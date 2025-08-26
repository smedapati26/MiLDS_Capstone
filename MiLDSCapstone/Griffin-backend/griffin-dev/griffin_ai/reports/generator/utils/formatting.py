def alert_formatting(
    cell_coordinates: tuple[int, int], status: str
) -> tuple[(str, tuple[int, int], tuple[int, int], str)]:
    """
    Given a cell, provide caution format styling

    @param cell_coordinates: (int, int) the coordinates of the cell to format
    @param status: (str) the status to apply, adjusting the background and textcolor values accordingly
    @returns ([(str, (int, int), (int, int), str)]) a list of the styles to apply to the TableStyle
    """
    if status == "confirmation":
        background = "#007A00"
        text_color = "#FFFFFF"
    elif status == "caution":
        background = "#FFA800"
        text_color = "#1A1A1A"
    elif status == "error":
        background = "#BD0000"
        text_color = "#FFFFFF"
    elif status == "info":
        background = "#00C7E3"
        text_color = "#1A1A1A"
    return [
        ("BACKGROUND", cell_coordinates, cell_coordinates, background),
        ("TEXTCOLOR", cell_coordinates, cell_coordinates, text_color),
    ]
