from reportlab.pdfgen.canvas import Canvas


def register_document(canvas: Canvas, document_name: str) -> Canvas:
    """
    Registers basic admin information about the PDF being generated

    @param canvas: (reportlab.pdfgen.canvas.Canvas) the PDF document to save the information to
    @param document_name: (str) the name to give the document as its title
    @returns (reportlab.pdfgen.canvas.Canvas) the same document with general information registered
    """
    canvas.setAuthor("griffin.ai")
    canvas.setTitle(document_name)
    canvas.setSubject("Aircraft Daily Status Report")
    canvas.setCreator("Artificial Intelligence Integration Center")
    canvas.setProducer("United States Army")
    return canvas
