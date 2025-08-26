from django.http import HttpRequest, HttpResponseNotFound, FileResponse
from django.views.decorators.http import require_http_methods
import zipfile
import io

from forms.models import SupportingDocument
from personnel.models import Soldier

from utils.http.constants import HTTP_404_SUPPORTING_DOCUMENT_DOES_NOT_EXIST
from utils.logging import log_api_call


@log_api_call
@require_http_methods(["GET"])
def read_supporting_document(request: HttpRequest, supporting_doc_ids: str):
    """
    Retrieves of a Supporting Document's relevant document.

    @param request: (HttpRequest)
    @param supporting_doc_id: (str) The id of the Supporting Document to be returned,
    or a comma separated list of many ids to return the Supporting Document objects for

    @returns (FileResponse) the Supporting Document object(s)
    """
    id_list = supporting_doc_ids.split(",")

    if len(id_list) == 1:
        try:
            supporting_document = SupportingDocument.objects.get(id=supporting_doc_ids)
        except SupportingDocument.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_SUPPORTING_DOCUMENT_DOES_NOT_EXIST)

        return FileResponse(
            supporting_document.document, as_attachment=True, filename=supporting_document.document_title + ".pdf"
        )

    else:
        # Create zip buffer to write files to
        zip_buffer = io.BytesIO(b"")

        soldier_first_name = ""
        soldier_last_name = ""

        first_pass = True
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for id in id_list:
                try:
                    supporting_document = SupportingDocument.objects.get(id=int(id))
                    if first_pass == True:
                        soldier = Soldier.objects.get(user_id=supporting_document.soldier.user_id)
                        soldier_first_name = soldier.first_name
                        soldier_last_name = soldier.last_name
                        first_pass = False
                    if supporting_document.document != None:
                        with supporting_document.document.open("rb") as myfile:
                            zip_file.writestr(supporting_document.document_title, myfile.read())
                except SupportingDocument.DoesNotExist:
                    pass

        zip_buffer.seek(0)

        return FileResponse(
            zip_buffer,
            as_attachment=True,
            filename="{}_{}_Supporting_Documents.zip".format(soldier_first_name, soldier_last_name),
        )
