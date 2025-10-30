from datetime import date, datetime
from http import HTTPStatus
from typing import List, Optional

from django.http import HttpRequest
from django.shortcuts import get_list_or_404, get_object_or_404
from django.utils import timezone
from ninja import File, Form, Router, UploadedFile
from ninja.errors import HttpError

from forms.models import SupportingDocument, SupportingDocumentType
from personnel.api.soldier_designation.schema import (
    SoldierDesignationIn,
    SoldierDesignationOut,
    SoldierDesignationResponse,
)
from personnel.models import Designation, Soldier, SoldierDesignation, UserRole
from units.models import Unit
from utils.http import get_user_id, user_has_roles_with_soldiers, user_has_roles_with_units

soldier_designation_router = Router()


@soldier_designation_router.get("/types", summary="Get All Designation Values")
def get_all_designations(request: HttpRequest):
    """
    Returns all Designation objects from the database.
    """
    designation_values = list(Designation.objects.all().values("id", "type", "description"))

    return designation_values


@soldier_designation_router.get(
    "/soldier/{str:user_id}", response=List[SoldierDesignationOut], summary="Get Soldier Designations"
)
def get_soldier_designations(request: HttpRequest, user_id: str, current: bool = False):
    """
    Returns all Soldier Designations
    Args:
        request: The HTTP request
        user_id: The soldier's user ID
        current: If only the currently valid designations are returned
    Returns:
        Designation data for the soldier
    """
    requester_id = get_user_id(request.headers)

    if not requester_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=requester_id)

    soldier = get_object_or_404(Soldier, user_id=user_id)

    if not requesting_user.is_admin:
        if not user_has_roles_with_soldiers(requesting_user, [soldier]):
            raise HttpError(
                HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this soldier's unit."
            )

    designations = SoldierDesignation.objects.filter(soldier=soldier, designation_removed=False)

    if current:
        current_date = timezone.datetime.today()
        designations = designations.filter(end_date__gte=current_date)

    return designations


@soldier_designation_router.post("", response=SoldierDesignationResponse, summary="Create Soldier Designation")
def create_soldier_designation(
    request: HttpRequest,
    data: Form[SoldierDesignationIn],
    file: UploadedFile = File(None),
):
    """
    Creates a new Soldier Designation with optional supporting document.

    Args:
        request: The HTTP request
        data: Soldier designation data (soldier_id, unit_uic, designation, start_date, end_date, document_type)
        file: Optional supporting document file
    Returns:
        SoldierDesignationResponse: Success message with designation ID
    """
    try:
        creating_soldier = get_object_or_404(Soldier, user_id=get_user_id(request.headers))
    except KeyError:
        raise HttpError(400, "No user ID in header")

    soldier = get_object_or_404(Soldier, user_id=data.soldier_id)
    unit = get_object_or_404(Unit, uic=data.unit_uic)
    designation = get_object_or_404(Designation, type=data.designation)

    try:
        start_date = datetime.strptime(data.start_date, "%Y-%m-%d")
    except ValueError:
        raise HttpError(400, f"Invalid start_date format. Expected YYYY-MM-DD, got: {data.start_date}")

    end_date = None
    if data.end_date:
        try:
            end_date = datetime.strptime(data.end_date, "%Y-%m-%d")
        except ValueError:
            raise HttpError(400, f"Invalid end_date format. Expected YYYY-MM-DD, got: {data.end_date}")

    soldier_designation = SoldierDesignation.objects.create(
        soldier=soldier,
        designation=designation,
        unit=unit,
        start_date=start_date,
        end_date=end_date,
        designation_removed=False,
    )

    if file:
        document_title = f"{designation.type} - {soldier.last_name}"

        new_supporting_doc = SupportingDocument.objects.create(
            soldier=soldier,
            uploaded_by=creating_soldier,
            upload_date=date.today(),
            document_date=start_date.date(),
            document_title=document_title,
            related_designation=soldier_designation,
        )
        new_supporting_doc.document = file
        new_supporting_doc._history_user = creating_soldier
        new_supporting_doc.save()

    if data.supporting_document_id:
        supporting_doc = get_object_or_404(SupportingDocument, id=data.supporting_document_id)
        supporting_doc.related_designation = soldier_designation
        supporting_doc.save(update_fields=["related_designation"])

    return {
        "message": f"Designation '{designation.type}' created for {soldier.name_and_rank()}",
        "designation_id": soldier_designation.id,
    }


@soldier_designation_router.delete(
    "/{int:designation_id}", response=SoldierDesignationResponse, summary="Delete Soldier Designation"
)
def delete_soldier_designation(request: HttpRequest, designation_id: int):
    """
    Soft deletes a soldier designation by setting designation_removed to True.

    Args:
        request: The HTTP request
        designation_id: The ID of the designation to delete
    Returns:
        SoldierDesignationResponse: Success message
    """
    try:
        deleting_soldier = get_object_or_404(Soldier, user_id=get_user_id(request.headers))
    except KeyError:
        raise HttpError(400, "No user ID in header")

    soldier_designation = get_object_or_404(SoldierDesignation, id=designation_id)

    soldier_designation.designation_removed = True
    soldier_designation.last_modified_by = deleting_soldier
    soldier_designation.save(update_fields=["designation_removed", "last_modified_by"])

    return {
        "message": f"Designation removed successfully",
        "designation_id": designation_id,
    }
