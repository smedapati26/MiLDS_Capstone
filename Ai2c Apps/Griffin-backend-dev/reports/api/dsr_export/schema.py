from datetime import date
from typing import List, Optional, Union

from ninja import Schema


class DSRExportIn(Schema):
    pages: Optional[Union[str, List[str]]] = []
    mods: Optional[Union[str, List[str]]] = []
    insp: Optional[Union[str, List[str]]] = []
    models: Optional[Union[str, List[str]]] = []
    history_date: Optional[date] = None
