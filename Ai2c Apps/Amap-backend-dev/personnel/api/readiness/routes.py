import io
import json
import re
import zipfile
from datetime import date, datetime, timedelta
from http import HTTPStatus
from typing import List

import pandas as pd
from django.db.models import Q
from django.forms import ValidationError
from django.http import FileResponse, HttpRequest
from django.shortcuts import get_list_or_404, get_object_or_404
from django.utils import timezone
from ninja import Query, Router
from ninja.errors import HttpError

from forms.models import DA_4856, Event, SupportingDocument
from forms.views.shiny_export_7817_xml import shiny_export_7817_xml
from personnel.api.readiness.schema import (
    ActualAuthorizedByMosOut,
    CrewAuthorizedActualDelta,
    CTLResponse,
    DateData,
    InexperiencedMaintainersOut,
    MaintainersAuthorizedActualDelta,
    MaintenanceLevelCount,
    MOSAvailabilityOut,
    MOSCodeOut,
    MOSData,
    MOSFilter,
    PhaseMaintainersOut,
    PhaseTeamIn,
    PhaseTeamOut,
    RankFilter,
    SkillAvailabilityOut,
    UnavailableMaintainersOut,
    UpdateSoldierIn,
    UpdateSoldierOut,
)
from personnel.api.users.schema import SoldierOut
from personnel.model_utils import MaintenanceLevel, Months, MxAvailability
from personnel.models import MTOE, MOSCode, PhaseTeam, Soldier, SoldierAdditionalMOS, SoldierFlag, Unit, UserRole
from personnel.utils import get_prevailing_status, get_soldier_mos_ml, get_soldier_uctl_and_ictl_dataframes
from personnel.utils.time.reporting_periods import get_reporting_period, get_reporting_periods, two_years_prior
from units.models import Unit
from utils.http import get_user_id, user_has_roles_with_soldiers, user_has_roles_with_units
from utils.http.constants import DATE_FORMAT

router = Router()


@router.get("/amap-packet", response=None, summary="Get AMAP Digital Packet")
def get_amap_packet(
    request: HttpRequest,
    soldier_ids: List[str] = Query(..., description="List of soldier user IDs to include in the packet"),
    include_ictl: bool = False,
    include_uctl: bool = False,
    include_da_4856: bool = False,
    include_da_7817: bool = False,
    include_supporting_documents: bool = False,
):
    """
    Retrieves all relevant and queried AMAP documents based on the soldiers passed in.
    @param request: HttpRequest object
    @param soldier_ids: List of soldier user IDs to include in the packet
    @param include_ictl: Flag to include ICTL tasks
    @param include_uctl: Flag to include USAACE tasks
    @param include_da_4856: Flag to include DA 4856 data
    @param include_da_7817: Flag to include DA 7817 data
    @param include_supporting_documents: Flag to include Supporting Document data
    @returns FileResponse: A zip file containing all the requested data for the passed in soldiers
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    # Query soldiers based on provided IDs
    queried_soldiers = Soldier.objects.filter(user_id__in=soldier_ids)

    if not requesting_user.is_admin:
        if not user_has_roles_with_soldiers(requesting_user, queried_soldiers):
            raise HttpError(
                HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for every soldier's unit."
            )

    # Create zip buffer to write files to
    unit_zip_buffer = io.BytesIO(b"")

    with zipfile.ZipFile(unit_zip_buffer, "w", zipfile.ZIP_DEFLATED) as unit_zip:
        for soldier in queried_soldiers:
            # Get the required documents for each soldier
            if include_supporting_documents:
                soldier_supporting_documents = SupportingDocument.objects.filter(soldier=soldier)
            else:
                soldier_supporting_documents = []
            if include_da_4856:
                soldier_da_4856s = DA_4856.objects.filter(soldier=soldier)
            else:
                soldier_da_4856s = []
            if include_da_7817:
                soldier_7817s = Event.objects.filter(soldier=soldier, event_deleted=False)
            else:
                soldier_7817s = []
            if include_uctl or include_ictl:
                usaace_ictl_df, unit_uctl_df = get_soldier_uctl_and_ictl_dataframes(soldier)
            else:
                usaace_ictl_df, unit_uctl_df = [], []

            # Initialize the Naming for the soldier folder
            soldier_folder = "{}/".format(soldier.name_and_rank())

            # Check to see if the requested data is valid by existing and being requested
            valid_supporting_documents = len(soldier_supporting_documents) > 0 and include_supporting_documents
            valid_da_4856 = len(soldier_da_4856s) > 0 and include_da_4856
            valid_da_7817 = len(soldier_7817s) > 0 and include_da_7817
            valid_usaace_ictl = len(usaace_ictl_df) > 0 and include_ictl
            valid_unit_uctl = len(unit_uctl_df) > 0 and include_uctl

            # Check to see if this soldier is valid to have any processing done for their AMAP Digital Packet
            valid_soldier = (
                valid_supporting_documents or valid_da_4856 or valid_da_7817 or valid_usaace_ictl or valid_unit_uctl
            )

            if valid_soldier:
                # Initialize the soldier's folder
                unit_zip.writestr(soldier_folder, "")

                if valid_supporting_documents:
                    # Initialize the soldier's Supporting Document folder
                    soldier_supporting_document_folder = "{}Supporting Documents/".format(soldier_folder)
                    unit_zip.writestr(soldier_supporting_document_folder, "")

                    for supporting_document in soldier_supporting_documents:
                        supporting_doc_title = "{}{}".format(
                            soldier_supporting_document_folder,
                            supporting_document.document_title,
                        )
                        if supporting_document.document != None:
                            try:
                                with supporting_document.document.open("rb") as myfile:
                                    unit_zip.writestr(supporting_doc_title, myfile.read())
                            except ValueError:
                                unit_zip.writestr(supporting_doc_title + ".txt", "ERROR ON RETRIEVING FILE")

                if valid_da_4856:
                    # Initialize the soldier's DA 4856 folder
                    soldier_da_4856_folder = "{}DA 4856s/".format(soldier_folder)
                    unit_zip.writestr(soldier_da_4856_folder, "")

                    for da_4856 in soldier_da_4856s:
                        da_4856_doc_title = "{}{}.pdf".format(soldier_da_4856_folder, da_4856.title)
                        try:
                            if da_4856.document != None:
                                with da_4856.document.open("rb") as myfile:
                                    unit_zip.writestr(da_4856_doc_title, myfile.read())
                        except ValueError:
                            unit_zip.writestr(da_4856_doc_title + ".txt", "ERROR ON RETRIEVING FILE")

                if valid_da_7817:
                    # Initialize the soldier's 7817 folder
                    soldier_da_7817_folder = "{}DA 7817s/".format(soldier_folder)
                    unit_zip.writestr(soldier_da_7817_folder, "")
                    soldier_7817_export_response = shiny_export_7817_xml(request=request, dod_id=soldier.user_id)
                    soldier_7817_buffer = io.BytesIO(soldier_7817_export_response.getvalue())

                    with zipfile.ZipFile(soldier_7817_buffer, "r") as soldier_7817_zip:
                        for soldier_7817 in soldier_7817_zip.infolist():
                            soldier_7817_title = "{}{}".format(soldier_da_7817_folder, soldier_7817.filename)
                            soldier_7817_data = soldier_7817_zip.read(soldier_7817.filename)
                            unit_zip.writestr(soldier_7817_title, soldier_7817_data)

                if valid_usaace_ictl or valid_unit_uctl:
                    # Initialize the soldier's Task List folder
                    task_list_folder = "{}Critical Task Lists/".format(soldier_folder)
                    unit_zip.writestr(task_list_folder, "")

                    if valid_usaace_ictl:
                        usaace_buffer = io.BytesIO()
                        usaace_grouped_dfs = usaace_ictl_df.groupby("ictl__ictl_title")

                        with pd.ExcelWriter(usaace_buffer, engine="xlsxwriter") as excel_writer:
                            for usaace_group_name, usaace_group_data in usaace_grouped_dfs:
                                usaace_group_data = usaace_group_data.drop(
                                    columns=["ictl__ictl_title", "ictl__unit", "ictl__unit__short_name"]
                                )
                                if len(usaace_group_name) > 31 and usaace_group_name.__contains__("SHARED"):
                                    usaace_group_name = usaace_group_name[
                                        : usaace_group_name.index("SHARED") + len("SHARED")
                                    ]
                                    if len(usaace_group_name) > 31:
                                        usaace_group_name = usaace_group_name[:31]
                                elif len(usaace_group_name) > 31:
                                    usaace_group_name = usaace_group_name[:31]

                                usaace_group_sheet_name = re.sub(r"[\[\]\:\*\?/\"]", "-", str(usaace_group_name))
                                usaace_group_data.to_excel(
                                    excel_writer, sheet_name=str(usaace_group_sheet_name), index=False
                                )
                            workbook = excel_writer.book
                            for worksheet in workbook.worksheets():
                                worksheet.autofit()

                        usaace_buffer.seek(0)
                        usaace_list_file_name = "{}USAACE Task Lists.xlsx".format(task_list_folder)
                        unit_zip.writestr(usaace_list_file_name, usaace_buffer.getvalue())

                    if valid_unit_uctl:
                        unit_list_buffer = io.BytesIO()
                        unit_grouped_dfs = unit_uctl_df.groupby("ictl__ictl_title")

                        with pd.ExcelWriter(unit_list_buffer, engine="xlsxwriter") as excel_writer:
                            for unit_group_name, unit_group_data in unit_grouped_dfs:
                                unit_group_data = unit_group_data.drop(
                                    columns=["ictl__ictl_title", "ictl__unit", "ictl__unit__short_name"]
                                )
                                if len(unit_group_name) > 31 and unit_group_name.__contains__("SHARED"):
                                    unit_group_name = unit_group_name[: unit_group_name.index("SHARED") + len("SHARED")]
                                    if len(unit_group_name) > 31:
                                        unit_group_name = unit_group_name[:31]
                                elif len(unit_group_name) > 31:
                                    unit_group_name = unit_group_name[:31]
                                unit_group_sheet_name = re.sub(r"[\[\]\:\*\?/\"]", "-", str(unit_group_name))
                                unit_group_data.to_excel(excel_writer, sheet_name=unit_group_sheet_name, index=False)
                            workbook = excel_writer.book
                            for worksheet in workbook.worksheets():
                                worksheet.autofit()

                        unit_list_buffer.seek(0)
                        unit_list_file_name = "{}Unit Task Lists.xlsx".format(task_list_folder)
                        unit_zip.writestr(unit_list_file_name, unit_list_buffer.getvalue())

    unit_zip_buffer.seek(0)

    return FileResponse(
        unit_zip_buffer, as_attachment=True, filename="AMTP Digital Packet.zip", content_type="application/zip"
    )


@router.get("/unit/unavailable", response=List[UnavailableMaintainersOut], summary="Get Unavailable Maintainers")
def get_unavailable_maintainers(
    request: HttpRequest, uic: str, start_date: date | None = None, end_date: date | None = None
):
    """
    Gets a list of unavailable maintainers by count for the periods requested, grouped by MOS and maintenance level.
    Finds soldiers with UNAVAILABLE flags active during the date range and gets their latest non-null maintenance level.

    @param: request: (django.http.HttpRequest) the request object
    @param: uic: the uic of the unit of interest
    @param: start_date: beginning of date range of interest
    @param: end_date: end of date range of interest
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    flag_filters = {
        "unit__uic__in": [uic, *unit.subordinate_uics],
        "is_maintainer": True,
        "soldier_flags__mx_availability": MxAvailability.UNAVAILABLE,
        "soldier_flags__soldier__isnull": False,
        "primary_mos__isnull": False,
    }

    if start_date and end_date:
        flag_filters.update(
            {
                "soldier_flags__start_date__lte": end_date,
                "soldier_flags__end_date__gte": start_date,
            }
        )

    unavailable_soldiers = Soldier.objects.select_related("primary_mos").filter(**flag_filters).distinct()
    results = {}
    for soldier in unavailable_soldiers:
        event_filters = {"soldier": soldier, "maintenance_level__isnull": False}
        if start_date and end_date:
            event_filters["date__lte"] = end_date

        latest_ml = (
            Event.objects.filter(**event_filters).order_by("-date").values_list("maintenance_level", flat=True).first()
        )

        if latest_ml is not None and soldier.primary_mos is not None:
            key = (soldier.primary_mos.mos, latest_ml)
            results[key] = results.get(key, 0) + 1

    return [{"mos": mos, "ml": ml, "count": count} for (mos, ml), count in results.items()]


@router.get("/unit/inexperienced", response=List[InexperiencedMaintainersOut], summary="Get Inexperienced Maintainers")
def get_inexperienced_maintainers(
    request: HttpRequest, uic: str, start_date: date | None = None, end_date: date | None = None
):
    """
    Gets a list of inexperienced maintainers (ML0 and ML1) by count for the periods requested,
    grouped by MOS and maintenance level. Finds soldiers' latest maintenance level within the date range.

    @param: request: (django.http.HttpRequest) the request object
    @param: uic: the uic of the unit of interest
    @param: start_date: beginning of date range of interest
    @param: end_date: end of date range of interest
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    soldiers = (
        Soldier.objects.select_related("primary_mos")
        .filter(
            unit__uic__in=[uic, *unit.subordinate_uics],
            is_maintainer=True,
            primary_mos__isnull=False,
        )
        .distinct()
    )

    results = {}
    for soldier in soldiers:
        event_filters = {
            "soldier": soldier,
            "maintenance_level__isnull": False,
            "maintenance_level__in": [MaintenanceLevel.ML0, MaintenanceLevel.ML1],
        }

        if start_date and end_date:
            event_filters["date__range"] = (start_date, end_date)

        latest_ml = (
            Event.objects.filter(**event_filters).order_by("-date").values_list("maintenance_level", flat=True).first()
        )

        if latest_ml is not None:
            key = (soldier.primary_mos.mos, latest_ml)
            results[key] = results.get(key, 0) + 1

    return [{"mos": mos, "ml": ml, "count": count} for (mos, ml), count in results.items()]


@router.get("/unit/strength_by_mos", response=list[MOSAvailabilityOut])
def get_personnel_strength_by_mos(
    request: HttpRequest, uic: str, start_date: date | None = None, ranksFilter: RankFilter = Query(...)
):
    """
    Gets personnel availability counts grouped by MOS for a specific date.
    Returns available, total, and authorized counts for each MOS.
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    target_date = start_date if start_date else date.today()

    # Determine fiscal year for MTOE lookup (Oct 1 - Sep 30)
    # And convert to YY format
    if target_date.month >= 10:  # Oct, Nov, Dec
        fiscal_year = target_date.year + 1
    else:  # Jan-Sep
        fiscal_year = target_date.year
    fiscal_year = str(fiscal_year)[2:]

    if start_date:
        # Get historical soldier records as of the target date
        HistoricalSoldier = Soldier.history.model

        # Get all historical records up to target date, ordered by user_id and history_date
        all_historical_soldiers = HistoricalSoldier.objects.filter(
            history_date__date__lte=target_date,
            unit__in=[uic, *unit.subordinate_uics],
            is_maintainer=True,
            primary_mos__isnull=False,
            rank__in=ranksFilter.ranks,
        ).order_by("user_id", "-history_date")

        # Get the most recent record for each soldier (latest state as of target date)
        latest_records = {}
        for record in all_historical_soldiers:
            if record.user_id not in latest_records:
                latest_records[record.user_id] = record

        # Count soldiers by MOS
        mos_data = {}
        for historical_soldier in latest_records.values():
            # Get the actual MOS code from the historical record
            try:
                mos_obj = MOSCode.objects.get(id=historical_soldier.primary_mos_id)
                mos = mos_obj.mos
            except MOSCode.DoesNotExist:
                continue

            if mos not in mos_data:
                mos_data[mos] = {"total_count": 0, "available_count": 0}

            mos_data[mos]["total_count"] += 1

        # Get soldiers who had unavailable flags active on the target date
        unavailable_ids = set(
            SoldierFlag.objects.filter(
                soldier__user_id__in=latest_records.keys(),
                mx_availability=MxAvailability.UNAVAILABLE,
                flag_deleted=False,
                start_date__lte=target_date,
                end_date__gte=target_date,
            ).values_list("soldier__user_id", flat=True)
        )

        # Update available counts
        for historical_soldier in latest_records.values():
            try:
                mos_obj = MOSCode.objects.get(id=historical_soldier.primary_mos_id)
                mos = mos_obj.mos
                if historical_soldier.user_id not in unavailable_ids:
                    mos_data[mos]["available_count"] += 1
            except MOSCode.DoesNotExist:
                continue
    else:
        # Use current soldier data (original logic)
        maintainers = Soldier.objects.filter(
            unit__uic__in=[uic, *unit.subordinate_uics],
            is_maintainer=True,
            primary_mos__isnull=False,
            rank__in=ranksFilter.ranks,
        ).select_related("primary_mos")

        unavailable_ids = set(
            maintainers.filter(
                soldier_flags__mx_availability=MxAvailability.UNAVAILABLE,
                soldier_flags__flag_deleted=False,
                soldier_flags__start_date__lte=target_date,
                soldier_flags__end_date__gte=target_date,
            ).values_list("user_id", flat=True)
        )

        mos_data = {}
        for soldier in maintainers:
            mos = soldier.primary_mos.mos
            if mos not in mos_data:
                mos_data[mos] = {"total_count": 0, "available_count": 0}
            mos_data[mos]["total_count"] += 1
            if soldier.user_id not in unavailable_ids:
                mos_data[mos]["available_count"] += 1

    # Get authorized counts from MTOE for the appropriate fiscal year
    mos_codes = list(mos_data.keys())
    mtoe_data = {}
    for mos_code in mos_codes:
        mtoe_records = MTOE.objects.filter(uic__uic__in=[uic, *unit.subordinate_uics], fiscal_year=fiscal_year)
        authorized_total = 0
        for record in mtoe_records:
            if record.mos == mos_code:
                authorized_total += record.authorized_strength or 0

        mtoe_data[mos_code] = authorized_total

    return [
        {
            "mos": mos,
            "available_count": counts["available_count"],
            "total_count": counts["total_count"],
            "authorized_count": mtoe_data.get(mos, 0),
        }
        for mos, counts in mos_data.items()
    ]


@router.get("/unit/strength_by_skill", response=list[SkillAvailabilityOut])
def get_strength_by_skill(
    request: HttpRequest, uic: str, start_date: date | None = None, ranksFilter: RankFilter = Query(...)
):
    """
    Gets personnel availability counts grouped by skill/ASI code for a specific date.
    Returns available, total, and authorized counts for each skill.
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    target_date = start_date if start_date else date.today()

    # Determine fiscal year for MTOE lookup (Oct 1 - Sep 30)
    if target_date.month >= 10:  # Oct, Nov, Dec
        fiscal_year = target_date.year + 1
    else:  # Jan-Sep
        fiscal_year = target_date.year
    fiscal_year = str(fiscal_year)[2:]

    skill_data = {}

    if start_date:
        # Get historical soldier records as of the target date
        HistoricalSoldier = Soldier.history.model

        # Get all historical records up to target date, ordered by user_id and history_date
        all_historical_soldiers = HistoricalSoldier.objects.filter(
            history_date__date__lte=target_date,
            unit__in=[uic, *unit.subordinate_uics],
            is_maintainer=True,
            rank__in=ranksFilter.ranks,
        ).order_by("user_id", "-history_date")

        # Get the most recent record for each soldier (latest state as of target date)
        latest_records = {}
        for record in all_historical_soldiers:
            if record.user_id not in latest_records:
                latest_records[record.user_id] = record

        # Get current soldiers to access their skills
        current_soldiers = Soldier.objects.filter(user_id__in=latest_records.keys()).prefetch_related("asi_codes")

        # Count soldiers by skill
        for soldier in current_soldiers:
            for skill in soldier.asi_codes.all():
                skill_code = skill.asi_code
                if skill_code not in skill_data:
                    skill_data[skill_code] = {"total_count": 0, "available_count": 0}
                skill_data[skill_code]["total_count"] += 1

        # Get soldiers who had unavailable flags active on the target date
        unavailable_ids = set(
            SoldierFlag.objects.filter(
                soldier__user_id__in=latest_records.keys(),
                mx_availability=MxAvailability.UNAVAILABLE,
                flag_deleted=False,
                start_date__lte=target_date,
                end_date__gte=target_date,
            ).values_list("soldier__user_id", flat=True)
        )

        # Update available counts
        for soldier in current_soldiers:
            if soldier.user_id not in unavailable_ids:
                for skill in soldier.asi_codes.all():
                    skill_code = skill.asi_code
                    skill_data[skill_code]["available_count"] += 1

    else:
        # Use current soldier data
        maintainers = Soldier.objects.filter(
            unit__uic__in=[uic, *unit.subordinate_uics],
            is_maintainer=True,
            rank__in=ranksFilter.ranks,
        ).prefetch_related("asi_codes")

        # Get unavailable soldier IDs
        unavailable_ids = set(
            SoldierFlag.objects.filter(
                soldier__unit__uic__in=[uic, *unit.subordinate_uics],
                soldier__is_maintainer=True,
                soldier__rank__in=ranksFilter.ranks,
                mx_availability=MxAvailability.UNAVAILABLE,
                flag_deleted=False,
                start_date__lte=target_date,
                end_date__gte=target_date,
            ).values_list("soldier__user_id", flat=True)
        )

        # Count soldiers by skill
        for soldier in maintainers:
            is_available = soldier.user_id not in unavailable_ids

            for skill in soldier.asi_codes.all():
                skill_code = skill.asi_code
                if skill_code not in skill_data:
                    skill_data[skill_code] = {"total_count": 0, "available_count": 0}

                skill_data[skill_code]["total_count"] += 1
                if is_available:
                    skill_data[skill_code]["available_count"] += 1

    # Get authorized counts from MTOE
    mtoe_records = MTOE.objects.filter(
        uic__uic__in=[uic, *unit.subordinate_uics], fiscal_year=fiscal_year
    ).prefetch_related("asi_codes")

    mtoe_data = {}
    for record in mtoe_records:
        for skill in record.asi_codes.all():
            skill_code = skill.asi_code
            mtoe_data[skill_code] = mtoe_data.get(skill_code, 0) + (record.authorized_strength or 0)

    return [
        {
            "skill": skill_code,
            "available_count": counts["available_count"],
            "total_count": counts["total_count"],
            "authorized_count": mtoe_data.get(skill_code, 0),
        }
        for skill_code, counts in skill_data.items()
    ]


@router.get("/mos/all", response=List[MOSCodeOut], summary="Get All MOS Codes")
def get_all_mos_codes(request: HttpRequest):
    """
    Gets all MOS codes in the system.
    @param request: (django.http.HttpRequest) the request object
    @returns List[MOSCodeOut] - List of all MOS's
    """
    return MOSCode.objects.all().values("mos", "mos_description").order_by("mos")


@router.get("/unit/maintainer_experience_by_mos", response=List[MOSData], summary="Get Maintainer Experience History")
def get_maintainer_experience_by_mos(
    request: HttpRequest, uic: str, report_date: date | None = None, mos_filter: MOSFilter = Query(None)
):
    """
    Gets historical maintenance level counts by reporting period for specified MOS codes within a unit.
    Returns data for current reporting period +/- 3 reporting periods (7 total periods).
    @param request: HttpRequest object
    @param uic: Unit Identification Code
    @param date: Optional date to determine current reporting period. If not provided, uses today's date.
    @param mos_filter: MOSFilter containing list of MOS codes to include. If not provided, includes all MOS codes in the unit.
    @returns List[MOSData] containing maintenance level counts by reporting period for each MOS
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    target_date = report_date if report_date else date.today()
    start_date = target_date - timedelta(days=90)
    end_date = target_date + timedelta(days=90)
    reporting_periods = sorted(get_reporting_periods(start_date, end_date))

    mos_codes = (
        mos_filter.MOSs
        if mos_filter and mos_filter.MOSs
        else list(
            Soldier.objects.filter(
                unit__uic__in=[uic, *unit.subordinate_uics], is_maintainer=True, primary_mos__isnull=False
            )
            .values_list("primary_mos__mos", flat=True)
            .distinct()
        )
    )

    # Get authorized personnel counts from MTOE
    mtoe_data = {}
    for mos_code in mos_codes:
        # Get all MTOE records for this unit where the computed mos property matches
        mtoe_records = MTOE.objects.filter(uic__uic__in=[uic, *unit.subordinate_uics])
        authorized_total = 0

        for record in mtoe_records:
            if record.mos == mos_code:
                authorized_total += record.authorized_strength or 0

        mtoe_data[mos_code] = authorized_total

    # Get all relevant events in one query
    events = Event.objects.filter(
        date__gte=reporting_periods[0][0],
        date__lte=reporting_periods[-1][1],
        soldier__unit__uic__in=[uic, *unit.subordinate_uics],
        soldier__primary_mos__mos__in=mos_codes,
        maintenance_level__isnull=False,
        event_deleted=False,
    ).values("soldier_id", "soldier__primary_mos__mos", "maintenance_level", "date")

    # Process events into a lookup structure
    # {mos: {period_end_date: {soldier_id: latest_ml}}}
    ml_by_period = {}
    for event in events:
        mos = event["soldier__primary_mos__mos"]
        if mos not in ml_by_period:
            ml_by_period[mos] = {}

        # Find which reporting period this event belongs to
        for period_start, period_end in reporting_periods:
            if period_start <= event["date"] <= period_end:
                if period_end not in ml_by_period[mos]:
                    ml_by_period[mos][period_end] = {}
                soldier_id = event["soldier_id"]
                current_ml = ml_by_period[mos][period_end].get(soldier_id)

                # Only update if this is the most recent event for this soldier in this period
                if current_ml is None or event["date"] > current_ml["date"]:
                    ml_by_period[mos][period_end][soldier_id] = {
                        "ml": event["maintenance_level"],
                        "date": event["date"],
                    }
                break

    # Format results according to schema
    result = []
    for mos in mos_codes:
        mos_data = []
        mos_periods = ml_by_period.get(mos, {})
        for period_start, period_end in reporting_periods:
            # Count soldiers at each ML level for this period
            ml_counts = {}
            for soldier_data in mos_periods.get(period_end, {}).values():
                ml = soldier_data["ml"]
                ml_counts[ml] = ml_counts.get(ml, 0) + 1

            # Create MaintenanceLevelCount objects for all levels
            counts = [
                MaintenanceLevelCount(level=level.value, count=ml_counts.get(level.value, 0))
                for level in MaintenanceLevel
            ]

            # Add period data
            period_name = period_end.strftime("%B %Y")
            mos_data.append(DateData(date=period_name, counts=counts))

        # Add complete MOS data
        result.append(MOSData(mos=mos, authorized_personnel=mtoe_data.get(mos, 0), data=mos_data))

    return result


@router.get(
    "/unit/actual_authorized_personnel_by_mos",
    response=ActualAuthorizedByMosOut,
    summary="Get Actual vs Authorized Maintainer Counts",
)
def get_actual_vs_authorized_maintainer_mos_counts(request: HttpRequest, uic: str, date: str, mos: str | None = None):
    """
    Gets actual vs authorized maintainer counts for current and prior reporting periods.
    Returns data for specific MOS if provided, otherwise returns all aviation MOS codes (15R, 15T, 15U, 15Z).

    @param request: HttpRequest object
    @param uic: Unit Identification Code
    @param date: Date string (YYYYMMDD format) to determine the reporting period of interest
    @param mos: Optional MOS filter. If provided, only returns data for that MOS
    @returns ActualAuthorizedByMosOut containing current vs prior period comparison
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    try:
        parsed_date = datetime.strptime(date, "%Y%m%d").date()
    except ValueError:
        raise HttpError(400, "Invalid date format. Use YYYYMMDD format.")

    aviation_mos_codes = ["15R", "15T", "15U", "15Z"]

    # Filter MOS codes based on parameter and convert to IDs
    if mos:
        target_mos_codes = [mos]
    else:
        target_mos_codes = aviation_mos_codes

    target_mos_ids = []
    for mos_code in target_mos_codes:
        try:
            mos_obj = MOSCode.objects.get(mos=mos_code)
            target_mos_ids.append(mos_obj.id)
        except MOSCode.DoesNotExist:
            raise HttpError(404, f"MOS {mos_code} not found")

    current_period_start, _ = get_reporting_period(parsed_date)

    _, prior_period_end = get_reporting_period(current_period_start - timedelta(days=1), previous_period=True)

    # Get authorized personnel counts from MTOE
    mtoe_data = {}

    for mos_id in target_mos_ids:
        mos_obj = MOSCode.objects.get(id=mos_id)
        mos_code = mos_obj.mos

        mtoe_records = MTOE.objects.filter(uic__uic__in=[uic, *unit.subordinate_uics])
        authorized_count = 0

        for record in mtoe_records:
            if record.mos == mos_code:
                authorized_count += record.authorized_strength or 0

        mtoe_data[mos_id] = authorized_count

    # Get total authorized maintainers from MTOE
    all_mtoe_records = MTOE.objects.filter(uic__uic__in=[uic, *unit.subordinate_uics])
    total_authorized = sum(record.authorized_strength or 0 for record in all_mtoe_records)

    # Get current period actual counts for aviation MOS codes
    current_actual_soldiers = Soldier.objects.filter(
        unit__uic__in=[uic, *unit.subordinate_uics],
        is_maintainer=True,
        primary_mos__id__in=target_mos_ids,
        primary_mos__isnull=False,
    ).select_related("primary_mos")

    current_mos_counts = {}

    for soldier in current_actual_soldiers:
        mos_id = soldier.primary_mos.id
        current_mos_counts[mos_id] = current_mos_counts.get(mos_id, 0) + 1

    # Get current period total maintainers
    current_total_actual = Soldier.objects.filter(
        unit__uic__in=[uic, *unit.subordinate_uics], is_maintainer=True, primary_mos__isnull=False
    ).count()

    # Get prior period actual counts using historical records
    HistoricalSoldier = Soldier.history.model
    prior_period_end_datetime = timezone.make_aware(datetime.combine(prior_period_end, datetime.min.time()))

    all_historical_soldiers = HistoricalSoldier.objects.filter(
        history_date__lte=prior_period_end_datetime,
        unit__in=[uic, *unit.subordinate_uics],
        is_maintainer=True,
        primary_mos__in=target_mos_ids,
        primary_mos__isnull=False,
    ).order_by("user_id", "-history_date")

    latest_records = {}
    for record in all_historical_soldiers:
        if record.user_id not in latest_records:
            latest_records[record.user_id] = record

    prior_mos_counts = {}

    for historical_soldier in latest_records.values():
        mos_id = historical_soldier.primary_mos_id
        if mos_id in target_mos_ids:
            prior_mos_counts[mos_id] = prior_mos_counts.get(mos_id, 0) + 1

    # Get prior period total maintainers
    all_historical_maintainers = HistoricalSoldier.objects.filter(
        history_date__lte=prior_period_end_datetime,
        unit__in=[uic, *unit.subordinate_uics],
        is_maintainer=True,
        primary_mos__isnull=False,
    ).order_by("user_id", "-history_date")

    all_latest_records = {}
    for record in all_historical_maintainers:
        if record.user_id not in all_latest_records:
            all_latest_records[record.user_id] = record

    prior_total_actual = len(all_latest_records)

    crew_counts = []
    for mos_code in target_mos_codes:
        mos_obj = MOSCode.objects.get(mos=mos_code)
        mos_id = mos_obj.id

        crew_counts.append(
            CrewAuthorizedActualDelta(
                mos=mos_code,
                authorized_count=mtoe_data.get(mos_id, 0),
                actual_count=current_mos_counts.get(mos_id, 0),
                prior_period_actual_count=prior_mos_counts.get(mos_id, 0),
            )
        )

    maintainer_counts = MaintainersAuthorizedActualDelta(
        actual_total=current_total_actual,
        authorized_total=total_authorized,
        prior_period_actual_count=prior_total_actual,
    )

    return ActualAuthorizedByMosOut(maintainer_counts=maintainer_counts, crew_counts=crew_counts)


@router.get("/{str:user_id}/ctls", response=CTLResponse, summary="Get Soldier CTLs")
def get_soldier_ctls(request: HttpRequest, user_id: str):
    """
    Returns all Soldier UCTL and ICTL data
    Args:
        request: The HTTP request
        user_id: The soldier's user ID
    Returns:
        Dictionary containing ICTL and UCTL data for the soldier
    """
    requester_id = get_user_id(request.headers)

    if not requester_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=requester_id)

    soldier = get_object_or_404(Soldier, user_id=user_id)

    if not requesting_user.is_admin:
        if not user_has_roles_with_soldiers(requesting_user, [soldier]):
            raise HttpError(
                HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this soldier's unit."
            )

    soldier_ictl, soldier_uctl = get_soldier_uctl_and_ictl_dataframes(soldier)

    # Convert ICTL dataframe to JSON if it has data, otherwise return empty list
    if len(soldier_ictl) > 0:
        ictl = json.loads(soldier_ictl.to_json(orient="records"))
    else:
        ictl = []

    # Convert UCTL dataframe to JSON if it has data, otherwise return empty list
    if len(soldier_uctl) > 0:
        uctl = json.loads(soldier_uctl.to_json(orient="records"))
    else:
        uctl = []
    return {
        "soldier_ictl": ictl,
        "soldier_uctl": uctl,
    }


@router.get("/{str:user_id}", response=SoldierOut, summary="Get Soldier Details")
def get_soldier(request: HttpRequest, user_id: str):
    """
    Gets the details for an individual Soldier/user account

    @param request: (django.http.HttpRequest) the request object
    @param user_id: (str) the user_id of the user to get details for
    @returns (SoldierOut) the soldier's details
    """
    requester_id = get_user_id(request.headers)

    if not requester_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=requester_id)

    soldier = get_object_or_404(Soldier, user_id=user_id)

    if not requesting_user.is_admin:
        if not user_has_roles_with_soldiers(requesting_user, [soldier]):
            raise HttpError(
                HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this soldier's unit."
            )

    return soldier


@router.patch("/{str:user_id}/update", response=UpdateSoldierOut, summary="Update Soldier Information")
def update_soldier_info(request: HttpRequest, user_id: str, data: UpdateSoldierIn):
    """Updates soldier information
    Args:
        request: HTTP request object
        user_id: Soldier's user ID
        data: Update data
    Returns:
        Updated soldier information
    Raises:
        HttpError: 404 if soldier not found, 400 for validation errors
    """
    try:
        # Get the user making the update
        try:
            updated_by = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
        except:
            updated_by = None

        # Get soldier to update
        soldier = get_object_or_404(Soldier, user_id=user_id)

        # Handle primary MOS update
        if data.primary_mos != "not_passed":
            if data.primary_mos == "None":
                soldier.primary_mos = None
            elif data.primary_mos is not None:
                try:
                    primary_mos = MOSCode.objects.get(mos=data.primary_mos)
                    soldier.primary_mos = primary_mos
                except MOSCode.DoesNotExist:
                    raise ValueError(f"{data.primary_mos} not found in MOS Codes")

        # Handle additional MOS updates
        if data.additional_mos != "not_passed":
            if data.additional_mos is None:
                # Remove all additional MOS
                SoldierAdditionalMOS.objects.filter(soldier=soldier).delete()
            else:
                # Handle both string and list inputs
                mos_list = data.additional_mos if isinstance(data.additional_mos, list) else [data.additional_mos]

                # Add new MOS
                for mos in mos_list:
                    try:
                        mos_obj = MOSCode.objects.get(mos=mos)
                        SoldierAdditionalMOS.objects.get_or_create(soldier=soldier, mos=mos_obj)
                    except MOSCode.DoesNotExist:
                        raise ValueError(f"{mos} not found in MOS Codes")

                # Remove MOS not in the list
                SoldierAdditionalMOS.objects.filter(soldier=soldier).exclude(mos__mos__in=mos_list).delete()

        # Handle birth month update
        if data.birth_month != "not_passed":
            if data.birth_month is not None:
                if not Months.has_value(data.birth_month):
                    raise ValueError(Months.has_value(data.birth_month, return_error=True))
                soldier.birth_month = data.birth_month

        # Handle DOR updates
        date_fields = ["pv2_dor", "pfc_dor", "spc_dor", "sgt_dor", "ssg_dor", "sfc_dor"]
        for field in date_fields:
            value = getattr(data, field)
            if value != "not_passed":
                if value is not None:
                    setattr(soldier, field, datetime.strptime(value, DATE_FORMAT).date())
                else:
                    setattr(soldier, field, None)

        # Handle email updates
        if data.dod_email != "not_passed":
            soldier.dod_email = data.dod_email
        if data.receive_emails is not None:
            soldier.recieve_emails = data.receive_emails

        # Save updates
        soldier._history_user = updated_by
        soldier.save()

        # Prepare response
        return {
            "user_id": soldier.user_id,
            "rank": soldier.rank,
            "first_name": soldier.first_name,
            "last_name": soldier.last_name,
            "primary_mos": soldier.primary_mos.mos if soldier.primary_mos else "None",
            "primary_ml": get_soldier_mos_ml(soldier),
            "all_mos_and_ml": get_soldier_mos_ml(soldier, all=True),
            "pv2_dor": soldier.pv2_dor,
            "pfc_dor": soldier.pfc_dor,
            "spc_dor": soldier.spc_dor,
            "sgt_dor": soldier.sgt_dor,
            "ssg_dor": soldier.ssg_dor,
            "sfc_dor": soldier.sfc_dor,
            "unit": soldier.unit.uic,
            "is_admin": soldier.is_admin,
            "is_maintainer": soldier.is_maintainer,
            "dod_email": soldier.dod_email,
            "birth_month": soldier.birth_month,
        }

    except ValidationError as e:
        raise HttpError(400, e.messages)
    except ValueError as e:
        raise HttpError(400, str(e))


@router.get("/unit/{uic}/soldiers/{type}", summary="Get Unit Soldiers")
def get_unit_soldiers(request: HttpRequest, uic: str, type: str):
    """
    Return different DFs for a given unit based on input
    @param request: (django.http.HttpRequest) the request object
    @param uic: top uic to get soldiers for
    @param type: type of unit soldier request
        "amtp_maintainers" : Return all soldiers who hold an AMTP MOS as their
        primary MOS, additional information such as status, primary, mos, and primary ml
        "amtp_maintainers_short" : Return all soldiers who hold an AMTP MOS as their
        primary MOS, with basic information
        "all_maintainers" : All soldiers that have a packet in A-MAP, regardless
        of their primary MOS
        "all_soldiers" : All soldiers that are in the Unit
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    if type == "amtp_maintainers":
        unit_amtp_maintainers = (
            Soldier.objects.filter(unit__uic__in=[unit.uic, *unit.subordinate_uics])
            .exclude(Q(primary_mos__amtp_mos=False) | Q(primary_mos__isnull=True))
            .order_by("last_name")
        )

        soldier_flags = SoldierFlag.objects.filter(soldier__in=unit_amtp_maintainers)
        flag_records = [{"user_id": flag.soldier_id, "flag": flag} for flag in list(soldier_flags)]
        flags_df = pd.DataFrame.from_records(flag_records, columns=["user_id", "flag"])
        soldiers_list = list(unit_amtp_maintainers.values())

        # Add soldier prevailing status to returned list
        for soldier in soldiers_list:
            soldier["availability_status"] = get_prevailing_status(
                flags_df[flags_df.user_id == soldier["user_id"]]["flag"].tolist()
            )
            soldier["primary_mos"] = (
                MOSCode.objects.get(id=soldier["primary_mos_id"]).mos if soldier["primary_mos_id"] else "None"
            )
            soldier.pop("primary_mos_id")
            specific_soldier = Soldier.objects.get(user_id=soldier["user_id"])
            soldier["primary_ml"] = get_soldier_mos_ml(specific_soldier)

        return {"soldiers": soldiers_list}

    else:
        if type == "amtp_maintainers_short":
            unit_soldiers = (
                Soldier.objects.filter(unit__uic__in=[unit.uic, *unit.subordinate_uics])
                .exclude(Q(primary_mos__amtp_mos=False) | Q(primary_mos__isnull=True))
                .order_by("last_name")
            )

        if type == "all_maintainers":
            unit_soldiers = Soldier.objects.filter(
                unit__uic__in=[unit.uic, *unit.subordinate_uics], is_maintainer=True
            ).order_by("last_name")
        elif type == "all_soldiers":
            unit_soldiers = Soldier.objects.filter(unit__uic__in=[unit.uic, *unit.subordinate_uics]).order_by(
                "last_name"
            )

        basic_soldier_info = ["user_id", "rank", "first_name", "last_name", "unit", "is_maintainer", "primary_mos__mos"]

        return {"soldiers": list(unit_soldiers.values(*basic_soldier_info))}


@router.get("/unit/phase-maintainers", response=List[PhaseMaintainersOut], summary="Get Phase Maintainers")
def get_phase_maintainers(request: HttpRequest, uic: str, start_date: date, end_date: date):
    """
    Gets a list of available phase maintainers for a unit, along with a boolean indicating whether they
    have an ongoing availability flag during the duration of the planned phase.

    @param: request: (django.http.HttpRequest) the request object
    @param: uic: the uic of the unit of interest
    @param: start_date: beginning of date range of interest
    @param: end_date: end of date range of interest
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    # Get all relevant maintainers
    soldiers = (
        Soldier.objects.select_related("primary_mos")
        .filter(
            unit__uic__in=[uic, *unit.subordinate_uics],
            is_maintainer=True,
            primary_mos__isnull=False,
        )
        .distinct()
    )

    # Determine which maintainers are unavailable
    unavailable_ids = set(
        soldiers.filter(
            soldier_flags__mx_availability=MxAvailability.UNAVAILABLE,
            soldier_flags__flag_deleted=False,
            soldier_flags__start_date__lte=end_date,
            soldier_flags__end_date__gte=start_date,
        ).values_list("user_id", flat=True)
    )

    # Build response
    response = []
    for soldier in soldiers:
        # Determine latest maintenance level
        event_filters = {
            "soldier": soldier,
            "maintenance_level__isnull": False,
        }
        if start_date and end_date:
            event_filters["date__lte"] = end_date

        latest_ml = (
            Event.objects.filter(**event_filters).order_by("-date").values_list("maintenance_level", flat=True).first()
        )

        if latest_ml is not None:
            ml_value = latest_ml
        else:
            ml_value = "No ML"

        response.append(
            PhaseMaintainersOut(
                user_id=soldier.user_id,
                first_name=soldier.first_name,
                last_name=soldier.last_name,
                ml=ml_value,
                mos=soldier.primary_mos.mos,
                availability_flag=soldier.user_id in unavailable_ids,
            )
        )

    return response


@router.get("/phase-team/{phase_id}", response=PhaseTeamOut)
def get_phase_team(request, phase_id: int):
    """
    Returns information on a phase team
    Args:
        request: The HTTP request
        phase_id: The ID of the phase (from Griffin)
    Returns:
        JSON object representing the phase team
    """
    try:
        phase_team = PhaseTeam.objects.get(phase_id=phase_id)
        return {
            "id": phase_team.id,
            "phase_id": phase_team.phase_id,
            "phase_members": phase_team.phase_members,
            "phase_lead_user_id": phase_team.phase_lead.user_id,
            "assistant_phase_lead_user_id": phase_team.assistant_phase_lead.user_id,
        }
    except:
        return {
            "id": 0,
            "phase_id": phase_id,
            "phase_members": [],
            "phase_lead_user_id": "",
            "assistant_phase_lead_user_id": "",
        }


@router.post("/phase-team/{phase_id}")
def create_phase_team(request, phase_id: int, data: PhaseTeamIn):
    """
    Creates a phase team
    Args:
        request: The HTTP request
        phase_id: The ID of the phase (from Griffin)
        data: User IDs of Soldiers involved in the Phase
    Returns:
        JSON object
    """
    phase_lead = get_object_or_404(Soldier, user_id=data.phase_lead_user_id)
    assistant_phase_lead = get_object_or_404(Soldier, user_id=data.assistant_phase_lead_user_id)
    phase_team = PhaseTeam.objects.create(
        phase_id=phase_id,
        phase_lead=phase_lead,
        assistant_phase_lead=assistant_phase_lead,
        phase_members=data.phase_members,
    )
    return {"id": phase_team.id}


@router.put("/phase-team/{phase_id}")
def update_phase_team(request, phase_id: int, data: PhaseTeamIn):
    """
    Updates a phase team
    Args:
        request: The HTTP request
        phase_id: The ID of the phase (from Griffin)
        data: User IDs of Soldiers involved in the Phase
    Returns:
        JSON object
    """
    phase_team = get_object_or_404(PhaseTeam, phase_id=phase_id)
    phase_team.phase_lead = get_object_or_404(Soldier, user_id=data.phase_lead_user_id)
    phase_team.assistant_phase_lead = get_object_or_404(Soldier, user_id=data.assistant_phase_lead_user_id)
    phase_team.phase_members = data.phase_members
    phase_team.save()
    return {"success": True}


@router.delete("/phase-team/{phase_id}")
def delete_phase_team(request, phase_id: int):
    """
    Deletes a phase team
    Args:
        request: The HTTP request
        phase_id: The ID of the phase (from Griffin)
    Returns:
        JSON object
    """
    phase_team = get_object_or_404(PhaseTeam, phase_id=phase_id)
    phase_team.delete()
    return {"success": True}
