from datetime import datetime

from reports.base.report_config import ReportConfig
from reports.base.report_format import ReportFormat


class DailyStatusConfig(ReportConfig):
    def __init__(
        self,
        format: ReportFormat,
        debug: bool = False,
        include_uas: bool = True,
        custom_pages: list = [],
        custom_mods: list = [],
        custom_insp: list = [],
        custom_models: list = [],
        history_date: datetime = None,
    ):
        self.include_uas = include_uas
        self.custom_pages = (
            ["summary", "details", "phase", "nrtl", "forscom"] if len(custom_pages) == 0 else custom_pages
        )
        self.custom_mods = custom_mods
        self.custom_insp = custom_insp
        self.custom_models = custom_models
        self.history_date = history_date
        super().__init__(format=format, debug=debug)

    def __str__(self) -> str:
        return super().__str__()
