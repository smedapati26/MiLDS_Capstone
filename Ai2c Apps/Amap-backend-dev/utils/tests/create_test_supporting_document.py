from django.core.files.uploadedfile import SimpleUploadedFile

from forms.models import Event, Soldier, SoldierDesignation, SupportingDocument, SupportingDocumentType


def create_single_test_supporting_document(
    soldier: Soldier,
    document_type: SupportingDocumentType,
    uploaded_by: Soldier | None = None,
    id: int = 1,
    upload_date: str = "2024-01-01",
    document_date: str = "2024-01-01",
    document_title: str = "New Doc",
    document: SimpleUploadedFile | None = None,
    related_event: Event | None = None,
    related_designation: SoldierDesignation | None = None,
    visible_to_user: bool = True,
) -> SupportingDocument:
    """
    Creates a new Supporting Document

    @param soldier: (Soldier) The soldier object the Supporting Doc is being created for
    @param document_type: (SupportingDocumentType) The SupportingDocumentType object for this Supporting Document
    @param uploaded_by: (Soldier | None) The Soldier object uploading the Supporting Document
    @param upload_date: (str) The date the Supporting Document object is being created on
    @param document_date: (str) The date the document being uploaded was validated/given
    @param document_title: (str) The title of the document being uploaded
    @param document: (SimpleUploadedFile | None) The document being uploaded
    @param related_event: (Event | None) The event relating to this Supporting Document
    @param related_designation: (SoldierDesignation | None) The Soldier Designation relating to this Supporting Document
    @param visible_to_user: (bool) Boolean indicating if the user will see this in their summary pages
    """
    supporting_doc = SupportingDocument.objects.create(
        soldier=soldier,
        uploaded_by=uploaded_by,
        id=id,
        upload_date=upload_date,
        document_date=document_date,
        document_title=document_title,
        document_type=document_type,
        related_event=related_event,
        related_designation=related_designation,
        visible_to_user=visible_to_user,
    )

    supporting_doc.document = document
    supporting_doc.save()

    return supporting_doc
