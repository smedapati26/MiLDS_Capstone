import io
import zipfile

from django.http import FileResponse, HttpRequest, HttpResponseNotFound
from django.views.decorators.http import require_GET

from forms.models import DA_4856
from personnel.models import Soldier
from utils.http.constants import HTTP_404_DA4856_DOES_NOT_EXIST


@require_GET
def read_da_4856_document(request: HttpRequest, form_ids: str):
    """
    Reads a DA_4856's document and returns the file for download

    @param request: (HttpRequest) the request object
    @param form_id: (str) the object ID for the DA_4856 to return the file for,
    or a comma separated list of many ids to return DA4856 object for

    @returns (FileResponse) the DA4856 PDF object(s)
    """
    id_list = form_ids.split(",")

    if len(id_list) == 1:
        try:  # to get the DA 4856 object
            counseling = DA_4856.objects.get(id=int(form_ids))
        except DA_4856.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_DA4856_DOES_NOT_EXIST)

        return FileResponse(counseling.document, as_attachment=True, filename=counseling.title + ".pdf")

    else:
        # Create zip buffer to write pdf files to
        zip_buffer = io.BytesIO(b"")

        soldier_first_name = ""
        soldier_last_name = ""

        first_pass = True

        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for id in id_list:
                try:  # to get the DA 4856 object
                    counseling = DA_4856.objects.get(id=int(id))
                    if first_pass == True:
                        soldier = Soldier.objects.get(user_id=counseling.soldier.user_id)
                        soldier_first_name = soldier.first_name
                        soldier_last_name = soldier.last_name
                        first_pass = False
                    if counseling.document != None:
                        with counseling.document.open("rb") as myfile:
                            zip_file.writestr(counseling.title + ".pdf", myfile.read())
                except DA_4856.DoesNotExist:
                    pass

        zip_buffer.seek(0)

        return FileResponse(
            zip_buffer,
            as_attachment=True,
            filename="{}_{}_Counselings.zip".format(soldier_first_name, soldier_last_name),
        )
