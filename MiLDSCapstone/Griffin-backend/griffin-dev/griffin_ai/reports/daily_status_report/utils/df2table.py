import pandas as pd
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def dataframe_to_table(df: pd.DataFrame, column_widths: list[int]) -> Table:
    """
    Takes a dataframe and a list of column widths and returns a basic reportlab Table
    to be rendered on a pdf

    @param df: (pd.DataFrame) any pandas dataframe that you would like to render
    @param column_widths: (list[int]) list of integer column widths. len(column_widths) MUST
                    be the equal to the number of columns in your df
    @returns (Table) reportlab table instance that can be rendered on a frame.
    """
    if len(df) != 0:
        font_size = min(144/len(df), 8)
    else:
        font_size = 8
    styles = getSampleStyleSheet()
    styleN = ParagraphStyle(name="body", parent=styles["BodyText"], fontName="Roboto-Bold", fontSize=font_size)
    header_style = ParagraphStyle("header", parent=styles["Normal"], fontName="Roboto-Bold", textColor=colors.white)

    # Create a list for table data
    data = []

    # Add the header row with Paragraph to handle text styles
    data.append([Paragraph(f"<b>{col}</b>", header_style) for col in df.columns])

    # Add the rows from the DataFrame, using Paragraph to wrap text
    for row in df.values.tolist():
        data.append([Paragraph(str(cell), styleN) for cell in row])
    # Create the table
    table = Table(data, colWidths=column_widths)

    # Apply styling
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, 0), "Roboto-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 3),
                ("BACKGROUND", (0, 0), (-1, 0), "#00458A"),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("LINEBELOW", (0, 0), (-1, 0), 1, colors.black),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.black),
                ("BOX", (0, 0), (-1, -1), 1, colors.black),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.lightgrey, colors.white]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),  # Align text to the top
            ]
        )
    )

    return table
