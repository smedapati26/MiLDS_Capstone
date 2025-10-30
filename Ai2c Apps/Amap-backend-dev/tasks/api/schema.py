from typing import List, Optional

from ninja import Schema


class SoldierTaskResponse(Schema):
    task_number: str
    task_title: str
    mos: str


class UCTLTaskOut(Schema):
    task_number: str
    task_title: str
    training_location: Optional[str]
    frequency: Optional[str]
    subject_area: Optional[str]
    pdf_url: Optional[str]


class UCTLOut(Schema):
    ictl_id: int
    ictl_title: str
    date_published: str
    status: str
    skill_level: Optional[str]
    target_audience: Optional[str]
    unit_name: str
    unit_uic: str
    tasks: List[UCTLTaskOut]


class UCTLListResponse(Schema):
    uctls: List[UCTLOut]
    total_count: int


class DeleteUCTLOut(Schema):
    deleted_ictl: bool
    deleted_tasks_count: int
    message: str


class CreateUCTLIn(Schema):
    title: str
    unit_uic: str
    mos_codes: List[str]
    skill_level: str
    target_audience: str


class CreateUCTLOut(Schema):
    ictl_id: int
    message: str


class UpdateUCTLIn(Schema):
    title: str
    unit_uic: str
    mos_codes: List[str]
    skill_level: str
    target_audience: str


class UpdateUCTLOut(Schema):
    ictl_id: int
    message: str


class TaskWithUCTLOut(Schema):
    task_number: str
    task_title: str
    training_location: Optional[str]
    frequency: Optional[str]
    subject_area: Optional[str]
    pdf_url: Optional[str]
    similarity_score: int
    uctl_id: int
    uctl_title: str
    unit_name: str
    unit_uic: str


class UCTLSearchResult(Schema):
    ictl_id: int
    ictl_title: str
    date_published: str
    status: str
    skill_level: Optional[str]
    target_audience: Optional[str]
    unit_name: str
    unit_uic: str
    similarity_score: float


class SearchResponse(Schema):
    search_type: str
    query: str
    uctl_results: List[UCTLSearchResult] = []
    task_results: List[TaskWithUCTLOut] = []


class CreateTaskIn(Schema):
    ictl_ids: List[int] = []
    task_title: str
    training_location: Optional[str] = None
    frequency: Optional[str] = None
    subject_area: Optional[str] = None


class CreateTaskOut(Schema):
    task_number: str
    message: str


class UpdateTaskIn(Schema):
    task_title: Optional[str] = None
    training_location: Optional[str] = None
    frequency: Optional[str] = None
    subject_area: Optional[str] = None


class UpdateTaskOut(Schema):
    task_number: str
    message: str


class DeleteTaskOut(Schema):
    task_number: str
    deleted: bool
    message: str


class TaskDetailOut(Schema):
    task_number: str
    task_title: str
    training_location: Optional[str]
    frequency: Optional[str]
    subject_area: Optional[str]
    pdf_url: Optional[str]
    unit_uic: Optional[str]
    unit_name: Optional[str]
    deleted: bool


class CreateUCTLIn(Schema):
    title: str
    unit_uic: str
    mos_codes: List[str]
    skill_level: str
    target_audience: str
    tasks: List[str] = []


class UpdateUCTLIn(Schema):
    title: str
    unit_uic: str
    mos_codes: List[str]
    skill_level: str
    target_audience: str
    tasks: List[str] = []


class TaskFilterSchema(Schema):
    query: Optional[str] = None
    mos: Optional[List[str]] = None
    skill_level: Optional[List[str]] = None
    proponent: Optional[List[str]] = None


class TaskOut(Schema):
    mos_code: Optional[str] = None
    ictl_id: Optional[int] = None
    ictl_title: Optional[str] = None
    proponent: Optional[str] = None
    unit: Optional[str] = None
    skill_level: Optional[str] = None
    target_audience: Optional[str] = None
    status: Optional[str] = None
    task_number: str
    task_title: str
    pdf_url: Optional[str] = None
    unit_task_pdf: Optional[str] = None
    training_location: Optional[str] = None
    frequency: Optional[str] = None
    subject_area: Optional[str] = None
