import io
import zipfile
from datetime import date
from http import HTTPStatus
from typing import List, Optional

from django.db.models import F
from django.http import FileResponse, HttpRequest
from django.shortcuts import get_list_or_404, get_object_or_404
from ninja import File, Form, Query, Router, UploadedFile
from ninja.errors import HttpError
from ninja.files import UploadedFile

from forms.api.supporting_documents.schema import (
    SupportingDocumentIn,
    SupportingDocumentOut,
    SupportingDocumentResponse,
    SupportingDocumentTypeOut,
    SupportingDocumentUpdateIn,
)
from forms.model_utils import EvaluationResult
from forms.models import DA_4856, Event, SupportingDocument, SupportingDocumentType
from personnel.api.users.schema import SoldierOut
from personnel.models import Soldier, SoldierDesignation, UserRole
from personnel.utils import get_soldier_arrival_at_unit, get_soldier_designations, get_soldier_eval_status
from personnel.utils.get_soldier_mos_ml_dict import get_soldier_mos_ml
from personnel.utils.single_soldier_availability import get_prevailing_user_status
from utils.http import get_user_id, user_has_roles_with_soldiers, user_has_roles_with_units

from .schema import DesignationSupportingDocsResponse

router = Router()


@router.get("/types", response=List[SupportingDocumentTypeOut], summary="Get all supporting document types")
def get_supporting_document_types(request: HttpRequest):
    """
    Get all available supporting document types.
    Args:
        request: The HTTP request
    Returns:
        List[SupportingDocumentTypeOut]: List of all supporting document types
    """
    return SupportingDocumentType.objects.all()


@router.get(
    "/{int:designation_id}/supporting-docs",
    response=DesignationSupportingDocsResponse,
    summary="Get Supporting Documents for Designation",
)
def get_designation_supporting_docs(request: HttpRequest, designation_id: int):
    """
    Retrieves all supporting documents associated with a soldier designation.
    Args:
        request: The HTTP request
        designation_id: The ID of the soldier designation
    Returns:
       All Associated Data (DA 4856 Counselings and/or Supporting Document objects) for a DA 7817 event
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    designation = get_object_or_404(SoldierDesignation, id=designation_id)

    if not requesting_user.is_admin:
        if not user_has_roles_with_soldiers(requesting_user, [designation.soldier]):
            raise HttpError(
                HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this soldier's unit."
            )

    supporting_docs = SupportingDocument.objects.filter(related_designation=designation, visible_to_user=True)

    recent_annual_eval = (
        Event.objects.filter(
            soldier=designation.soldier,
            event_type__type="Evaluation",
            evaluation_type__type="Annual",
            go_nogo=EvaluationResult.GO,
            event_deleted=False,
        )
        .order_by("-date")
        .first()
    )
    recent_eval_date = recent_annual_eval.date if recent_annual_eval else None

    response_data = {"associated_supporting_docs": []}
    if supporting_docs.exists():
        response_data["associated_supporting_docs"] = [
            SupportingDocumentOut(
                id=supporting_doc.id,
                uploaded_by=supporting_doc.uploaded_by.name_and_rank() if supporting_doc.uploaded_by else None,
                soldier=SoldierOut(
                    user_id=supporting_doc.soldier.user_id,
                    rank=supporting_doc.soldier.rank,
                    first_name=supporting_doc.soldier.first_name,
                    last_name=supporting_doc.soldier.last_name,
                    display=supporting_doc.soldier.name_and_rank(),
                    pv2_dor=supporting_doc.soldier.pv2_dor,
                    pfc_dor=supporting_doc.soldier.pfc_dor,
                    spc_dor=supporting_doc.soldier.spc_dor,
                    sgt_dor=supporting_doc.soldier.sgt_dor,
                    ssg_dor=supporting_doc.soldier.ssg_dor,
                    sfc_dor=supporting_doc.soldier.sfc_dor,
                    unit_id=supporting_doc.soldier.unit.uic,
                    dod_email=supporting_doc.soldier.dod_email,
                    receive_emails=supporting_doc.soldier.recieve_emails,
                    birth_month=supporting_doc.soldier.birth_month,
                    is_admin=supporting_doc.soldier.is_admin,
                    is_maintainer=supporting_doc.soldier.is_maintainer,
                    availability_status=get_prevailing_user_status(supporting_doc.soldier),
                    primary_mos=supporting_doc.soldier.primary_mos.mos if supporting_doc.soldier.primary_mos else "",
                    primary_ml=get_soldier_mos_ml(supporting_doc.soldier),
                    all_mos_and_ml=get_soldier_mos_ml(supporting_doc.soldier, all=True) or {},
                    designations=get_soldier_designations(supporting_doc.soldier.user_id) or "",
                    arrival_at_unit=get_soldier_arrival_at_unit(supporting_doc.soldier),
                    annual_evaluation=recent_eval_date,
                    evaluation_status=get_soldier_eval_status(supporting_doc.soldier)[2],
                ),
                upload_date=supporting_doc.upload_date.strftime("%m/%d/%Y"),
                document_date=supporting_doc.document_date.strftime("%m/%d/%Y"),
                document_title=supporting_doc.document_title,
                document_type=supporting_doc.document_type.type if supporting_doc.document_type else None,
                related_event=supporting_doc.related_event if supporting_doc.related_event != None else None,
                related_designation=(
                    supporting_doc.related_designation.designation.type if supporting_doc.related_designation else None
                ),
                visible_to_user=supporting_doc.visible_to_user,
            )
            for supporting_doc in supporting_docs
        ]

    return response_data


@router.post("/soldier/{soldier_id}", response=SupportingDocumentResponse, summary="Add a supporting document")
def add_supporting_document(
    request: HttpRequest,
    soldier_id: str,
    data: Form[SupportingDocumentIn],
    file: UploadedFile = File(...),
):
    """
    Creates a new Supporting Document for a soldier.
    Args:
        request: The HTTP request
        soldier_id: The DoD ID of the soldier the supporting document is created for
        data: The supporting document metadata
        file: The document file to upload
    Returns:
        SupportingDocumentResponse: Success message
    """
    uploading_soldier = get_object_or_404(Soldier, user_id=get_user_id(request.headers))

    soldier = get_object_or_404(Soldier, user_id=soldier_id)

    event = None
    if data.related_event_id and data.related_event_id != "None":
        event = get_object_or_404(Event, id=data.related_event_id)

    designation = None
    if data.related_designation_id and data.related_designation_id != "None":
        designation = get_object_or_404(SoldierDesignation, id=data.related_designation_id)

    supporting_doc_type = get_object_or_404(SupportingDocumentType, type=data.document_type)

    new_supporting_doc = SupportingDocument.objects.create(
        soldier=soldier,
        uploaded_by=uploading_soldier,
        upload_date=date.today(),
        document_date=data.document_date,
        document_title=data.document_title,
        document_type=supporting_doc_type,
        related_event=event,
        related_designation=designation,
    )

    new_supporting_doc.document = file
    new_supporting_doc._history_user = uploading_soldier
    new_supporting_doc.save()
    return {"message": f"Supporting Document {new_supporting_doc.document_title} created successfully."}


@router.get("/combined_documents", response=None, summary="Get combined DA 4856 and Supporting Documents as zip")
def get_combined_documents(
    request,
    da_4856_ids: Optional[str] = Query(None, description="Comma-separated list of DA 4856 IDs"),
    supporting_doc_ids: Optional[str] = Query(None, description="Comma-separated list of Supporting Document IDs"),
):
    """
    Returns a zip file containing DA 4856 documents and Supporting Documents.

    Args:
        request: The HTTP request
        da_4856_ids: Comma-separated string of DA 4856 IDs (optional)
        supporting_doc_ids: Comma-separated string of Supporting Document IDs (optional)

    Returns:
        FileResponse: Zip file containing all requested documents
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    da_ids = []
    if da_4856_ids:
        try:
            da_ids = [int(id.strip()) for id in da_4856_ids.split(",") if id.strip()]
        except ValueError:
            raise HttpError(400, "Invalid DA 4856 ID format")

    support_ids = []
    if supporting_doc_ids:
        try:
            support_ids = [int(id.strip()) for id in supporting_doc_ids.split(",") if id.strip()]
        except ValueError:
            raise HttpError(400, "Invalid Supporting Document ID format")

    if not da_ids and not support_ids:
        raise HttpError(400, "Must provide at least one DA 4856 ID or Supporting Document ID")

    da_4856s = DA_4856.objects.filter(id__in=da_ids, visible_to_user=True)
    supporting_documents = SupportingDocument.objects.filter(id__in=support_ids, visible_to_user=True)

    if not requesting_user.is_admin:
        soldiers = [da_4856.soldier for da_4856 in da_4856s] + [
            supporting_document.soldier for supporting_document in supporting_documents
        ]

        if not user_has_roles_with_soldiers(requesting_user, soldiers):
            raise HttpError(
                HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for every soldier's unit."
            )

    zip_buffer = io.BytesIO()
    soldier_first_name = ""
    soldier_last_name = ""

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for da_4856 in da_4856s:
            try:
                if not soldier_first_name:
                    soldier_first_name = da_4856.soldier.first_name
                    soldier_last_name = da_4856.soldier.last_name

                if da_4856.document:
                    try:
                        with da_4856.document.open("rb") as doc_file:
                            filename = f"DA4856_{da_4856.title}.pdf"
                            zip_file.writestr(filename, doc_file.read())
                    except Exception as e:
                        # Skip document if file access fails (e.g., Azure auth issues)
                        pass

            except DA_4856.DoesNotExist:
                pass

        for supporting_doc in supporting_documents:
            try:
                if not soldier_first_name:
                    soldier_first_name = supporting_doc.soldier.first_name
                    soldier_last_name = supporting_doc.soldier.last_name

                if supporting_doc.document:
                    try:
                        with supporting_doc.document.open("rb") as doc_file:
                            filename = supporting_doc.document_title
                            if not filename.lower().endswith(".pdf"):
                                filename += ".pdf"
                            zip_file.writestr(filename, doc_file.read())
                    except Exception as e:
                        # Skip document if file access fails (e.g., Azure auth issues)
                        pass

            except SupportingDocument.DoesNotExist:
                pass

    zip_buffer.seek(0)

    return FileResponse(
        zip_buffer,
        as_attachment=True,
        filename=f"{soldier_first_name}_{soldier_last_name}_Documents.zip",
    )


@router.get(
    "/{document_id}",
    response=None,
    summary="Get a supporting document",
)
def get_supporting_document(request, document_id: str):
    """
    Retrieves a supporting document file or multiple documents as a zip.
    Args:
        request: The HTTP request
        document_id: Single ID or comma-separated list of IDs
    Returns:
        FileResponse: The document file or zip file containing multiple documents
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    id_list = document_id.split(",")

    supporting_documents = SupportingDocument.objects.filter(id__in=id_list)

    if not requesting_user.is_admin:
        soldiers = [supporting_document.soldier for supporting_document in supporting_documents]

        if not user_has_roles_with_soldiers(requesting_user, soldiers):
            raise HttpError(
                HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for every soldier's unit."
            )

    if len(supporting_documents) == 1:
        return FileResponse(
            supporting_documents[0].document,
            as_attachment=True,
            filename=supporting_documents[0].document_title + ".pdf",
        )
    else:
        # Create zip buffer for multiple documents
        zip_buffer = io.BytesIO(b"")
        soldier_first_name = ""
        soldier_last_name = ""
        first_pass = True
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for supporting_document in supporting_documents:
                try:
                    if first_pass:
                        soldier = Soldier.objects.get(user_id=supporting_document.soldier.user_id)
                        soldier_first_name = soldier.first_name
                        soldier_last_name = soldier.last_name
                        first_pass = False
                    if supporting_document.document:
                        with supporting_document.document.open("rb") as myfile:
                            zip_file.writestr(supporting_document.document_title, myfile.read())
                except SupportingDocument.DoesNotExist:
                    pass  # Skip if document doesn't exist
        zip_buffer.seek(0)
        return FileResponse(
            zip_buffer,
            as_attachment=True,
            filename=f"{soldier_first_name}_{soldier_last_name}_Supporting_Documents.zip",
        )


@router.put("/{document_id}", response=SupportingDocumentResponse, summary="Update a supporting document")
def update_supporting_document(request: HttpRequest, document_id: int, data: SupportingDocumentUpdateIn):
    """
    Updates an existing supporting document's metadata.
    Args:
        request: The HTTP request
        document_id: The ID of the document to update
        data: Updated document metadata
    Returns:
        SupportingDocumentResponse: Success message
    """
    try:
        uploading_soldier = get_object_or_404(Soldier, user_id=get_user_id(request.headers))
    except KeyError:
        raise HttpError(400, "No user ID in header")
    support_doc = get_object_or_404(SupportingDocument, id=document_id)
    # Update fields based on provided data
    update_fields = ["uploaded_by"]
    if data.document_title:
        support_doc.document_title = data.document_title
        update_fields.append("document_title")
    if data.document_type:
        supporting_doc_type = get_object_or_404(SupportingDocumentType, type=data.document_type)
        support_doc.document_type = supporting_doc_type
        update_fields.append("document_type")
    if data.associate_event == False:
        support_doc.related_event = None
        update_fields.append("related_event")
    elif data.related_event_id is not None:
        if data.related_event_id == "NA" or data.related_event_id == "None":
            support_doc.related_event = None
        else:
            event = get_object_or_404(Event, id=data.related_event_id)
            support_doc.related_event = event
        update_fields.append("related_event")
    if data.assign_designation == False:
        support_doc.related_designation = None
        update_fields.append("related_designation")
    elif data.related_designation_id is not None:
        if data.related_designation_id == "NA" or data.related_designation_id == "None":
            support_doc.related_designation = None
        else:
            designation = get_object_or_404(SoldierDesignation, id=data.related_designation_id)
            support_doc.related_designation = designation
        update_fields.append("related_designation")
    if data.visible_to_user is not None:
        support_doc.visible_to_user = data.visible_to_user
        update_fields.append("visible_to_user")
    support_doc.uploaded_by = uploading_soldier
    support_doc._history_user = uploading_soldier
    support_doc.save(update_fields=update_fields)
    return {"message": f"Supporting Document {support_doc.document_title} updated."}


@router.delete("/{document_id}", response=SupportingDocumentResponse, summary="Delete a supporting document")
def delete_supporting_document(request: HttpRequest, document_id: int):
    """
    Marks a supporting document as not visible to users (soft delete).
    Args:
        request: The HTTP request
        document_id: The ID of the document to delete
    Returns:
        SupportingDocumentResponse: Success message
    """
    delete_soldier = get_object_or_404(Soldier, user_id=get_user_id(request.headers))
    supporting_document = get_object_or_404(SupportingDocument, id=document_id)
    supporting_document.visible_to_user = False
    supporting_document._history_user = delete_soldier
    supporting_document.save(update_fields=["visible_to_user"])
    return {"message": f"Supporting Document {supporting_document.document_title} removed from User's view."}


@router.get("/soldier/{soldier_id}", response=List[SupportingDocumentOut], summary="Get soldier's supporting documents")
def get_soldier_supporting_documents(request: HttpRequest, soldier_id: str, visible_only: bool = True):
    """
    Retrieves all supporting documents for a specific soldier.
    Args:
        request: The HTTP request
        soldier_id: The soldier's DoD ID
        visible_only: Whether to return only visible documents
    Returns:
        List[SupportingDocumentOut]: List of supporting documents
    """
    requester_id = get_user_id(request.headers)

    if not requester_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = Soldier.objects.get(user_id=requester_id)

    # Get the soldier
    soldier = get_object_or_404(Soldier, user_id=soldier_id)

    if not requesting_user.is_admin:
        if not user_has_roles_with_soldiers(requesting_user, [soldier]):
            raise HttpError(
                HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this soldier's unit."
            )

    query = SupportingDocument.objects.filter(soldier=soldier)
    if visible_only:
        query = query.filter(visible_to_user=True)

    recent_annual_eval = (
        Event.objects.filter(
            soldier=soldier,
            event_type__type="Evaluation",
            evaluation_type__type="Annual",
            go_nogo=EvaluationResult.GO,
            event_deleted=False,
        )
        .order_by("-date")
        .first()
    )
    recent_eval_date = recent_annual_eval.date if recent_annual_eval else None

    return_data = [
        SupportingDocumentOut(
            id=supporting_doc.id,
            uploaded_by=supporting_doc.uploaded_by.name_and_rank() if supporting_doc.uploaded_by else None,
            soldier=SoldierOut(
                user_id=supporting_doc.soldier.user_id,
                rank=supporting_doc.soldier.rank,
                first_name=supporting_doc.soldier.first_name,
                last_name=supporting_doc.soldier.last_name,
                display=supporting_doc.soldier.name_and_rank(),
                pv2_dor=supporting_doc.soldier.pv2_dor,
                pfc_dor=supporting_doc.soldier.pfc_dor,
                spc_dor=supporting_doc.soldier.spc_dor,
                sgt_dor=supporting_doc.soldier.sgt_dor,
                ssg_dor=supporting_doc.soldier.ssg_dor,
                sfc_dor=supporting_doc.soldier.sfc_dor,
                unit_id=supporting_doc.soldier.unit.uic,
                dod_email=supporting_doc.soldier.dod_email,
                receive_emails=supporting_doc.soldier.recieve_emails,
                birth_month=supporting_doc.soldier.birth_month,
                is_admin=supporting_doc.soldier.is_admin,
                is_maintainer=supporting_doc.soldier.is_maintainer,
                availability_status=get_prevailing_user_status(supporting_doc.soldier),
                primary_mos=supporting_doc.soldier.primary_mos.mos if supporting_doc.soldier.primary_mos else "",
                primary_ml=get_soldier_mos_ml(supporting_doc.soldier),
                all_mos_and_ml=get_soldier_mos_ml(supporting_doc.soldier, all=True) or {},
                designations=get_soldier_designations(supporting_doc.soldier.user_id) or "",
                arrival_at_unit=get_soldier_arrival_at_unit(supporting_doc.soldier),
                annual_evaluation=recent_eval_date,
            ),
            upload_date=supporting_doc.upload_date.strftime("%m/%d/%Y"),
            document_date=supporting_doc.document_date.strftime("%m/%d/%Y"),
            document_title=supporting_doc.document_title,
            document_type=supporting_doc.document_type.type if supporting_doc.document_type else None,
            related_event=supporting_doc.related_event if supporting_doc.related_event != None else None,
            related_designation=(
                supporting_doc.related_designation.designation.type if supporting_doc.related_designation else None
            ),
            visible_to_user=supporting_doc.visible_to_user,
        )
        for supporting_doc in query
    ]

    return return_data
