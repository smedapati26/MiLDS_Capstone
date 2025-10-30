from datetime import date
from http import HTTPStatus
from typing import List

from django.db.models import Q
from django.http import HttpRequest
from django.shortcuts import get_list_or_404, get_object_or_404
from ninja import File, Form, Query, Router, UploadedFile
from ninja.errors import HttpError
from rapidfuzz import fuzz

from personnel.models import Soldier, UserRole
from tasks.api.schema import (
    CreateTaskIn,
    CreateTaskOut,
    CreateUCTLIn,
    CreateUCTLOut,
    DeleteTaskOut,
    DeleteUCTLOut,
    SearchResponse,
    SoldierTaskResponse,
    TaskDetailOut,
    TaskFilterSchema,
    TaskOut,
    TaskWithUCTLOut,
    UCTLListResponse,
    UCTLOut,
    UCTLSearchResult,
    UCTLTaskOut,
    UpdateTaskIn,
    UpdateTaskOut,
    UpdateUCTLIn,
    UpdateUCTLOut,
)
from tasks.model_utils import Proponent
from tasks.models import MOS, Ictl, IctlTasks, MosIctls, Task
from units.models import Unit
from utils.http import get_user_id, user_has_roles_with_soldiers
from utils.pagination import PaginatedResponseType, paginate_with_total_count

router = Router()


@router.get(
    "/{str:user_id}/searchable_tasklist", response=List[SoldierTaskResponse], summary="Get Soldier Searchable Task List"
)
def searchable_tasklist(request: HttpRequest, user_id: str, all_tasks: bool = Query(False)):
    """
    Returns tasks for a soldier based on the specified mode:
    - When all_tasks=False (default): Returns UCTL/ICTL tasks for the soldier's MOS
    - When all_tasks=True: Returns all tasks from non-deleted task lists
    """
    requester_id = get_user_id(request.headers)

    if not requester_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=requester_id)

    # Get the soldier
    soldier = get_object_or_404(Soldier, user_id=user_id)

    if not requesting_user.is_admin:
        if not user_has_roles_with_soldiers(requesting_user, [soldier]):
            raise HttpError(
                HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this soldier's unit."
            )

    # Get soldier's MOS codes
    soldier_mos_codes = []
    if soldier.primary_mos:
        soldier_mos_codes.append(soldier.primary_mos.mos)
    soldier_mos_codes.extend(mos.mos for mos in soldier.additional_mos.all())

    # Early return if no MOS codes in UCTL/ICTL mode
    if not soldier_mos_codes and not all_tasks:
        return []

    ###################
    # ALL TASKS MODE
    ###################
    if all_tasks:
        # Get all non-deleted tasks
        tasks = (
            Task.objects.filter(ictl__status="Approved", deleted=False).prefetch_related("ictl", "ictl__mos").distinct()
        )

        result = []
        for task in tasks:
            # Collect all MOS codes from this task's ICTLs
            mos_codes = {mos.mos_code for ictl in task.ictl.all() for mos in ictl.mos.all()}
            result.append(
                SoldierTaskResponse(
                    task_number=task.task_number, task_title=task.task_title, mos=", ".join(sorted(mos_codes))
                )
            )

        return result

    ###################
    # UCTL/ICTL MODE
    ###################
    # First check for unit tasks
    unit_hierarchy = [soldier.unit.uic] + soldier.unit.parent_uics

    # Try to find unit tasks (UCTLs) first
    unit_tasks = (
        Task.objects.filter(
            ictl__mos__mos_code__in=soldier_mos_codes,
            ictl__status="Approved",
            deleted=False,
            ictl__unit__uic__in=unit_hierarchy,
        )
        .prefetch_related("ictl", "ictl__mos")
        .distinct()
    )

    # If unit tasks exist, return them
    if unit_tasks:
        result = []
        for task in unit_tasks:
            # Collect ALL MOS codes from this task's ICTLs that match the soldier's MOS
            # This maintains consistency with the ALL mode
            mos_codes = {
                mos.mos_code for ictl in task.ictl.all() for mos in ictl.mos.all() if mos.mos_code in soldier_mos_codes
            }
            result.append(
                SoldierTaskResponse(
                    task_number=task.task_number, task_title=task.task_title, mos=", ".join(sorted(mos_codes))
                )
            )

        return result

    # If no unit tasks, fallback to USAACE tasks
    result = []

    # Get all USAACE tasks that match any of the soldier's MOS codes
    usaace_tasks = (
        Task.objects.filter(
            ictl__status="Approved", deleted=False, ictl__proponent="USAACE", ictl__mos__mos_code__in=soldier_mos_codes
        )
        .prefetch_related("ictl", "ictl__mos")
        .distinct()
    )

    for task in usaace_tasks:
        # Collect ALL MOS codes from this task's ICTLs that match the soldier's MOS
        # This maintains consistency with how we handle MOS codes in other cases
        mos_codes = {
            mos.mos_code for ictl in task.ictl.all() for mos in ictl.mos.all() if mos.mos_code in soldier_mos_codes
        }
        result.append(
            SoldierTaskResponse(
                task_number=task.task_number, task_title=task.task_title, mos=", ".join(sorted(mos_codes))
            )
        )

    return result


@router.get("/unit/uctls", response=UCTLListResponse, summary="Get Unit Critical Task Lists")
def get_unit_uctls(request: HttpRequest, uic: str, mos: str = None, skill_level: str = None):
    """
    Get all Unit Critical Task Lists (UCTLs) for a unit, MOS, and optional skill level.

    @param request: HttpRequest object
    @param uic: Unit Identification Code
    @param mos: Military Occupational Specialty code
    @param skill_level: Optional skill level filter
    @returns UCTLListResponse: List of UCTLs with their tasks
    """
    unit = get_object_or_404(Unit, uic=uic)

    unit_uics = [unit.uic] + unit.subordinate_uics

    uctl_filters = {"unit__uic__in": unit_uics}

    if mos:
        uctl_filters["mos__mos_code"] = mos

    if skill_level:
        uctl_filters["skill_level"] = skill_level

    uctls = list(
        Ictl.objects.filter(**uctl_filters)
        .exclude(proponent="USAACE")
        .select_related("unit")
        .distinct()
        .order_by("ictl_title")
    )

    if not uctls:
        return UCTLListResponse(uctls=[], total_count=0)

    uctl_ids = [uctl.ictl_id for uctl in uctls]

    all_tasks = (
        Task.objects.filter(ictl__ictl_id__in=uctl_ids, deleted=False)
        .values(
            "task_number", "task_title", "training_location", "frequency", "subject_area", "pdf_url", "ictl__ictl_id"
        )
        .order_by("task_number")
    )

    tasks_by_uctl = {}
    for task in all_tasks:
        uctl_id = task["ictl__ictl_id"]
        if uctl_id not in tasks_by_uctl:
            tasks_by_uctl[uctl_id] = []

        tasks_by_uctl[uctl_id].append(
            UCTLTaskOut(
                task_number=task["task_number"],
                task_title=task["task_title"],
                training_location=task["training_location"],
                frequency=task["frequency"],
                subject_area=task["subject_area"],
                pdf_url=task["pdf_url"],
            )
        )

    uctl_list = []
    for uctl in uctls:
        uctl_tasks = tasks_by_uctl.get(uctl.ictl_id, [])

        uctl_list.append(
            UCTLOut(
                ictl_id=uctl.ictl_id,
                ictl_title=uctl.ictl_title,
                date_published=uctl.date_published.strftime("%Y-%m-%d"),
                status=uctl.status,
                skill_level=uctl.skill_level,
                target_audience=uctl.target_audience,
                unit_name=uctl.unit.short_name,
                unit_uic=uctl.unit.uic,
                tasks=uctl_tasks,
            )
        )

    return UCTLListResponse(uctls=uctl_list, total_count=len(uctl_list))


@router.delete("/uctls/{int:ictl_id}", response=DeleteUCTLOut, summary="Delete UCTL or Remove Tasks")
def delete_uctl(request: HttpRequest, ictl_id: int, task_ids: List[str] = Query([])):
    """
    Delete a UCTL entirely or remove specific tasks from it.

    @param request: HttpRequest object
    @param ictl_id: ID of the ICTL/UCTL to modify
    @param task_ids: Optional list of task IDs to remove. If empty, deletes entire UCTL.
    @returns DeleteUCTLOut: Details about what was deleted
    """
    ictl = get_object_or_404(Ictl, ictl_id=ictl_id)

    if not task_ids:
        ictl.delete()
        return {"deleted_ictl": True, "deleted_tasks_count": 0, "message": "UCTL deleted successfully"}

    else:
        existing_ictl_tasks = IctlTasks.objects.filter(ictl=ictl, task__task_number__in=task_ids)

        existing_task_numbers = set(existing_ictl_tasks.values_list("task__task_number", flat=True))

        missing_tasks = set(task_ids) - existing_task_numbers
        if missing_tasks:
            raise HttpError(404, f"Tasks not found in this UCTL: {', '.join(missing_tasks)}")

        deleted_count = existing_ictl_tasks.count()
        existing_ictl_tasks.delete()

        return {
            "deleted_ictl": False,
            "deleted_tasks_count": deleted_count,
            "message": f"Removed {deleted_count} tasks from UCTL",
        }


@router.get("/uctls/check_duplicate", summary="Check for Duplicate UCTL Names")
def check_duplicate_uctl_name(
    request: HttpRequest,
    proposed_title: str = Query(..., description="Proposed UCTL title to check"),
    mos_codes: List[str] = Query([], description="MOS codes to filter by"),
    skill_levels: List[str] = Query([], description="Skill levels to filter by"),
    threshold: int = Query(75, description="Similarity threshold (0-100)"),
):
    """
    Check if a proposed UCTL title matches existing UCTLs.
    Filters by MOS and skill level before fuzzy matching.

    Returns list of similar UCTL names with similarity scores.
    """
    existing_uctls = Ictl.objects.exclude(proponent="USAACE")

    if mos_codes:
        existing_uctls = existing_uctls.filter(mos__mos_code__in=mos_codes)

    if skill_levels:
        existing_uctls = existing_uctls.filter(skill_level__in=skill_levels)

    existing_uctls = existing_uctls.values("ictl_id", "ictl_title")

    if not existing_uctls:
        return {"matches": []}

    results = []

    for uctl in existing_uctls:
        score = fuzz.partial_ratio(proposed_title, uctl["ictl_title"])

        if score >= threshold:
            results.append({"title": uctl["ictl_title"], "similarity_score": score, "ictl_id": uctl["ictl_id"]})

    results = sorted(results, key=lambda x: x["similarity_score"], reverse=True)

    return {"matches": results}


@router.post("/uctls", response=CreateUCTLOut, summary="Create Unit Critical Task List")
def create_uctl(request: HttpRequest, data: CreateUCTLIn):
    """
    Create a new Unit Critical Task List (UCTL).
    """
    unit = get_object_or_404(Unit, uic=data.unit_uic)

    if not data.mos_codes:
        raise HttpError(400, "At least one MOS code is required")

    mos_objects = []
    for mos_code in data.mos_codes:
        mos_obj = get_object_or_404(MOS, mos_code=mos_code)
        mos_objects.append(mos_obj)

    if data.tasks:
        existing_tasks = Task.objects.filter(task_number__in=data.tasks, deleted=False)
        existing_task_numbers = set(existing_tasks.values_list("task_number", flat=True))

        missing_tasks = set(data.tasks) - existing_task_numbers
        if missing_tasks:
            raise HttpError(404, f"Tasks not found: {', '.join(missing_tasks)}")

    uctl = Ictl.objects.create(
        ictl_title=data.title,
        date_published=date.today(),
        proponent=Proponent.Unit,
        unit=unit,
        status="NOT STARTED",
        skill_level=data.skill_level,
        target_audience=data.target_audience,
    )

    for mos_obj in mos_objects:
        MosIctls.objects.create(mos=mos_obj, ictl=uctl)

    if data.tasks:
        for task_number in data.tasks:
            task = Task.objects.get(task_number=task_number)
            IctlTasks.objects.create(ictl=uctl, task=task)

    return {"ictl_id": uctl.ictl_id, "message": f"UCTL '{data.title}' created successfully"}


@router.put("/uctls/{int:ictl_id}", response=UpdateUCTLOut, summary="Update Unit Critical Task List")
def update_uctl(request: HttpRequest, ictl_id: int, data: UpdateUCTLIn):
    """
    Update an existing Unit Critical Task List (UCTL).
    """
    uctl = get_object_or_404(Ictl, ictl_id=ictl_id)

    if not data.mos_codes:
        raise HttpError(400, "At least one MOS code is required")

    unit = get_object_or_404(Unit, uic=data.unit_uic)
    mos_objects = []
    for mos_code in data.mos_codes:
        mos_obj = get_object_or_404(MOS, mos_code=mos_code)
        mos_objects.append(mos_obj)

    if data.tasks:
        existing_tasks = Task.objects.filter(task_number__in=data.tasks, deleted=False)
        existing_task_numbers = set(existing_tasks.values_list("task_number", flat=True))

        missing_tasks = set(data.tasks) - existing_task_numbers
        if missing_tasks:
            raise HttpError(404, f"Tasks not found: {', '.join(missing_tasks)}")

    uctl.ictl_title = data.title
    uctl.unit = unit
    uctl.skill_level = data.skill_level
    uctl.target_audience = data.target_audience
    uctl.save()

    MosIctls.objects.filter(ictl=uctl).delete()
    for mos_obj in mos_objects:
        MosIctls.objects.create(mos=mos_obj, ictl=uctl)

    IctlTasks.objects.filter(ictl=uctl).delete()
    if data.tasks:
        for task_number in data.tasks:
            task = Task.objects.get(task_number=task_number)
            IctlTasks.objects.create(ictl=uctl, task=task)

    return {"ictl_id": uctl.ictl_id, "message": f"UCTL '{data.title}' updated successfully"}


@router.get("/search", response=SearchResponse, summary="Search UCTLs or Tasks")
def search_uctls_and_tasks(
    request: HttpRequest,
    query: str = Query(..., description="Search query"),
    search_type: str = Query(..., description="Search type: 'UCTL' or 'TASK'"),
    threshold: int = Query(75, description="Similarity threshold (0-100)"),
):
    """
    Search for UCTLs by title or Tasks by number/title using fuzzy matching.
    """
    if search_type not in ["UCTL", "TASK"]:
        raise HttpError(400, "search_type must be 'UCTL' or 'TASK'")

    if search_type == "UCTL":
        return search_uctls(query, threshold)
    else:
        return search_tasks(query, threshold)


def search_uctls(query: str, threshold: int) -> SearchResponse:
    """Search UCTLs by title"""
    # Single query gets all data needed - no N+1 issues
    uctls = list(
        Ictl.objects.exclude(proponent="USAACE").values(
            "ictl_id",
            "ictl_title",
            "date_published",
            "status",
            "skill_level",
            "target_audience",
            "unit__short_name",
            "unit__uic",
        )
    )

    results = []
    for uctl in uctls:
        score = fuzz.partial_ratio(query.lower(), uctl["ictl_title"].lower())

        if score >= threshold:
            results.append(
                UCTLSearchResult(
                    ictl_id=uctl["ictl_id"],
                    ictl_title=uctl["ictl_title"],
                    date_published=uctl["date_published"].strftime("%Y-%m-%d"),
                    status=uctl["status"],
                    skill_level=uctl["skill_level"],
                    target_audience=uctl["target_audience"],
                    unit_name=uctl["unit__short_name"],
                    unit_uic=uctl["unit__uic"],
                    similarity_score=score,
                )
            )

    results.sort(key=lambda x: x.similarity_score, reverse=True)

    return SearchResponse(search_type="UCTL", query=query, uctl_results=results)


def search_tasks(query: str, threshold: int) -> SearchResponse:
    """Search Tasks by number or title"""
    # Single query gets all data needed via JOIN - no N+1 issues
    tasks = list(
        Task.objects.filter(ictl__status="Approved", deleted=False)
        .exclude(ictl__proponent="USAACE")
        .values(
            "task_number",
            "task_title",
            "training_location",
            "frequency",
            "subject_area",
            "pdf_url",
            "ictl__ictl_id",
            "ictl__ictl_title",
            "ictl__unit__short_name",
            "ictl__unit__uic",
        )
    )

    results = []
    for task in tasks:
        score = fuzz.partial_ratio(query.lower(), task["task_title"].lower())

        if score >= threshold:
            results.append(
                TaskWithUCTLOut(
                    task_number=task["task_number"],
                    task_title=task["task_title"],
                    training_location=task["training_location"],
                    frequency=task["frequency"],
                    subject_area=task["subject_area"],
                    pdf_url=task["pdf_url"],
                    similarity_score=score,
                    uctl_id=task["ictl__ictl_id"],
                    uctl_title=task["ictl__ictl_title"],
                    unit_name=task["ictl__unit__short_name"],
                    unit_uic=task["ictl__unit__uic"],
                )
            )

    results.sort(key=lambda x: x.similarity_score, reverse=True)

    return SearchResponse(search_type="TASK", query=query, task_results=results)


@router.post("/tasks", response=CreateTaskOut, summary="Create Task")
def create_task(
    request: HttpRequest,
    data: Form[CreateTaskIn],
    unit_task_pdf: UploadedFile = File(None),
):
    """
    Create a new task and associate it with one or more UCTLs.
    """
    try:
        user_id = get_user_id(request.headers)
        user = get_object_or_404(Soldier, user_id=user_id)
    except KeyError:
        raise HttpError(400, "No user ID in header")

    # Validate ictl_ids list
    if not data.ictl_ids or not isinstance(data.ictl_ids, list):
        raise HttpError(400, "ictl_ids must be a non-empty list of integers")

    first_ictl = get_object_or_404(Ictl, ictl_id=data.ictl_ids[0])
    task_unit = first_ictl.unit

    # Generate task number
    unit_tasks = Task.objects.filter(unit=task_unit)
    if unit_tasks.exists():
        last_unit_task = unit_tasks.order_by("-task_number").first()
        try:
            last_number = int(last_unit_task.task_number.split("TASK")[1])
        except (IndexError, ValueError):
            last_number = 0
        new_number = f"{last_number + 1:04d}"
    else:
        new_number = "0001"
    task_number = f"{task_unit.uic}-TASK{new_number}"

    # Create the task
    task = Task.objects.create(
        task_number=task_number,
        task_title=data.task_title,
        training_location=data.training_location,
        frequency=data.frequency,
        subject_area=data.subject_area,
        unit=task_unit,
        unit_task_pdf=unit_task_pdf or None,
    )
    task._history_user = user
    task.save()

    # Associate with all ICTLs in the list
    for ictl_id in data.ictl_ids:
        ictl = get_object_or_404(Ictl, ictl_id=ictl_id)
        IctlTasks.objects.create(ictl=ictl, task=task)

    return CreateTaskOut(
        task_number=task.task_number,
        message=f"Task '{data.task_title}' created and linked to {len(data.ictl_ids)} ICTL(s)",
    )


@router.put("/tasks/{str:task_number}", response=UpdateTaskOut, summary="Update Task")
def update_task(
    request: HttpRequest,
    task_number: str,
    data: UpdateTaskIn,
):
    """
    Update an existing task metadata (not file).
    """
    try:
        user_id = get_user_id(request.headers)
        user = get_object_or_404(Soldier, user_id=user_id)
    except KeyError:
        raise HttpError(400, "No user ID in header")

    task = get_object_or_404(Task, task_number=task_number)

    if data.task_title is not None:
        task.task_title = data.task_title

    if data.training_location is not None:
        task.training_location = data.training_location

    if data.frequency is not None:
        task.frequency = data.frequency

    if data.subject_area is not None:
        task.subject_area = data.subject_area

    task._history_user = user
    task.save()

    return UpdateTaskOut(task_number=task.task_number, message=f"Task '{task.task_title}' updated successfully")


@router.post("/tasks/{str:task_number}/upload", response=UpdateTaskOut, summary="Upload/Replace Task PDF")
def upload_task_pdf(
    request: HttpRequest,
    task_number: str,
    unit_task_pdf: UploadedFile = File(...),
):
    """
    Upload or replace the PDF file for an existing task.
    """
    try:
        user_id = get_user_id(request.headers)
        user = get_object_or_404(Soldier, user_id=user_id)
    except KeyError:
        raise HttpError(400, "No user ID in header")

    task = get_object_or_404(Task, task_number=task_number)

    task.unit_task_pdf = unit_task_pdf
    task._history_user = user
    task.save()

    return UpdateTaskOut(
        task_number=task.task_number, message=f"PDF uploaded successfully for task '{task.task_title}'"
    )


@router.delete("/tasks/{str:task_number}", response=DeleteTaskOut, summary="Delete Task")
def delete_task(request: HttpRequest, task_number: str):
    """
    Soft delete a task by setting its deleted flag to True.
    """
    try:
        user_id = get_user_id(request.headers)
        user = get_object_or_404(Soldier, user_id=user_id)
    except KeyError:
        raise HttpError(400, "No user ID in header")

    task = get_object_or_404(Task, task_number=task_number)

    task.deleted = True
    task._history_user = user
    task.save()

    return DeleteTaskOut(
        task_number=task.task_number, deleted=True, message=f"Task '{task.task_title}' deleted successfully"
    )


@router.get("/tasks/{str:task_number}", response=TaskDetailOut, summary="Get Task Details")
def get_task(request: HttpRequest, task_number: str):
    """
    Get detailed information about a specific task.
    """
    task = get_object_or_404(Task, task_number=task_number)

    return TaskDetailOut(
        task_number=task.task_number,
        task_title=task.task_title,
        training_location=task.training_location,
        frequency=task.frequency,
        subject_area=task.subject_area,
        pdf_url=task.pdf_url,
        unit_uic=task.unit.uic if task.unit else None,
        unit_name=task.unit.short_name if task.unit else None,
        deleted=task.deleted,
    )


@router.get("/all", response=PaginatedResponseType[TaskOut], summary="Get All Tasks")
@paginate_with_total_count
def get_all_tasks(request: HttpRequest, filters: TaskFilterSchema = Query(...)):
    """
    Get all tasks and corresponding information for tasks from active USAACE published ICTLS, or from
    non-deleted unit tasks
    """
    tasks = Task.objects.filter(ictl__status="Approved", deleted=False)

    if filters.query:
        query = filters.query.strip()
        tasks = tasks.filter(
            Q(task_number__icontains=query)
            | Q(task_title__icontains=query)
            | Q(training_location__icontains=query)
            | Q(frequency__icontains=query)
            | Q(subject_area__icontains=query)
            | Q(ictl__ictl_title__icontains=query)
            | Q(ictl__proponent__icontains=query)
            | Q(ictl__unit__short_name__icontains=query)
            | Q(ictl__skill_level__icontains=query)
            | Q(ictl__target_audience__icontains=query)
            | Q(ictl__status__icontains=query)
            | Q(ictl__mos__mos_code__icontains=query)
        )

    if filters.mos:
        tasks = tasks.filter(ictl__mos__mos_code__in=filters.mos)

    if filters.skill_level:
        tasks = tasks.filter(ictl__skill_level__in=filters.skill_level)

    if filters.proponent:
        tasks = tasks.filter(ictl__proponent__in=filters.proponent)

    task_data = tasks.values(
        "task_number",
        "task_title",
        "pdf_url",
        "unit_task_pdf",
        "training_location",
        "frequency",
        "subject_area",
        "ictl__ictl_id",
        "ictl__ictl_title",
        "ictl__proponent",
        "ictl__unit__short_name",
        "ictl__skill_level",
        "ictl__target_audience",
        "ictl__status",
        "ictl__mos__mos_code",
    ).distinct()

    task_list = []
    for task in task_data:
        task_dict = {
            "mos_code": task["ictl__mos__mos_code"],
            "ictl_id": task["ictl__ictl_id"],
            "ictl_title": task["ictl__ictl_title"],
            "proponent": task["ictl__proponent"],
            "unit": task["ictl__unit__short_name"],
            "skill_level": task["ictl__skill_level"],
            "target_audience": task["ictl__target_audience"],
            "status": task["ictl__status"],
            "task_number": task["task_number"],
            "task_title": task["task_title"],
            "pdf_url": task["pdf_url"],
            "unit_task_pdf": str(task["unit_task_pdf"]) if task["unit_task_pdf"] else None,
            "training_location": task["training_location"],
            "frequency": task["frequency"],
            "subject_area": task["subject_area"],
        }
        task_list.append(task_dict)
    return task_list
