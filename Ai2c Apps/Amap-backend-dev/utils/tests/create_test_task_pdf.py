from django.core.files.uploadedfile import SimpleUploadedFile


def create_test_task_pdf():
    with open("static/pdf/Test_15U_Phase_Eval.pdf", "rb") as pdf_file:
        pdf_upload = SimpleUploadedFile("Test_15U_Phase_Eval.pdf", pdf_file.read(), content_type="application/pdf")
    return pdf_upload
