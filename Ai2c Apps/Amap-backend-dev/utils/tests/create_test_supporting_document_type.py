from forms.models import SupportingDocumentType


def create_single_supporting_document_type(type: str) -> SupportingDocumentType:
    """
    Creates and returns a single Supporting Document Type

    @param type: (str) The name of the new created Supporting Document Type

    @returns (SupportingDocumentType)"""
    return SupportingDocumentType.objects.create(type=type)
