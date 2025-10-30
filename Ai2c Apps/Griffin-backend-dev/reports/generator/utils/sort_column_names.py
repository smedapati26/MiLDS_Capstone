def sort_inspection_columns(inspection_column_names: list[str], descending: bool = False) -> list[str]:
    """
    Takes a list of inspection column names (defined as having a format like: 40 Hour...) and sorts
    them based on the number part of the column names

    @param inspection_column_names: ([str]) the list of string column names
    @param descending: (bool) [default False] the order to sort the list in
                       note, the behavior matches the sorted method and the reverse keyword
    """
    numbers = [(int(column_name.split(" ")[0]), column_name.split(" ")[1]) for column_name in inspection_column_names]
    sorted_list = sorted(numbers, reverse=descending)
    return [" ".join([str(number), rest]) for number, rest in sorted_list]
