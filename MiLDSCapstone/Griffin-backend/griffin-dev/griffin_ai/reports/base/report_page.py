from abc import ABC


class Page(ABC):
    """
    the base page class within a griffin report
    """

    def __init__(self):
        return self

    def fetch_data(self):
        """
        Defines the method of retrieving the necessary data for a page
        """
        raise NotImplementedError("Must implement a fetch method")

    def prepare_data(self):
        """
        Defines the method for preparing (cleaning and merging fetched data) data for a page
        """
        raise NotImplementedError("Must implement a preparation method")

    def assemble_representation(self):
        """
        Defines the method for assembling the data into its eventual representation for a page
        """
        raise NotImplementedError("Must implement an assembly method")

    def draw_representation(self):
        """
        Defines the method to output representations of the data from previous steps on a page
        """
        raise NotImplementedError("Must implement an output method")
