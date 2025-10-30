from abc import ABC

from reports.base.report_config import ReportConfig


class ReportBase(ABC):
    """
    The base of a report from griffin
    """

    def __init__(self, config: ReportConfig):
        """
        Initialize a Report object with the given configuration parameters
        """
        self.config = config
        self.pages = self.initialize_pages()

    def initialize_pages(self):
        """
        Given the report configuration, generates an ordered list of pages to include in the report
        """
        raise NotImplementedError("Report must define a method for adding pages.")

    def generate_report(self):
        """
        Generates a report by calling the methods implemented below. If in debug mode, output will be written to
        local file system. If not, return the file to send back to user
        """
        self.fetch_data()
        self.prepare_data()
        self.assemble_representation()
        self.draw_representation()
        self.save()
        if not self.config.debug:
            return self.file

    def fetch_data(self):
        """
        Defines the method of retrieving the necessary data for a report
        """
        raise NotImplementedError("Must implement a fetch method")

    def prepare_data(self):
        """
        Defines the method for preparing (cleaning and merging fetched data) for the report
        """
        raise NotImplementedError("Must implement a preparation method")

    def assemble_representation(self):
        """
        Defines the method for assembling the data into its eventual representation
        """
        raise NotImplementedError("Must implement an assembly method")

    def draw_representation(self):
        """
        Defines the method to output representations of the data from previous steps
        """
        raise NotImplementedError("Must implement an draw method")

    def save(self):
        """
        Defines the method to close the write buffer/file and 'save' the file
        """
        raise NotImplementedError("Must implement a save method")
