from django.core.files.uploadedfile import SimpleUploadedFile


def create_test_4856_pdf():
    with open("static/pdf/DA4856_BLANK.pdf", "rb") as pdf_file:
        pdf_upload = SimpleUploadedFile("DA4856_BLANK.pdf", pdf_file.read(), content_type="application/pdf")
    return pdf_upload
