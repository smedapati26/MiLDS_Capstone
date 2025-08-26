from django.http import (
    HttpRequest,
    HttpResponse,
    JsonResponse,
    HttpResponseServerError,
    HttpResponseNotFound,
)
from django.forms import ValidationError
from django.utils.decorators import method_decorator
from django.views import View
import json
import datetime

from personnel.models import Unit, Soldier, SoldierFlag, MOSCode, SoldierAdditionalMOS
from personnel.utils import get_soldier_mos_ml, get_prevailing_user_status

from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_400_SOLDIER_CREATE_FAILED_ERROR_MESSAGE,
)
from utils.logging import log_api_call


class UserViews(View):
    """
    Defines views for single user retrieval, creation, and updating
    """

    @method_decorator(log_api_call)
    def get(self, request: HttpRequest, user_id: str):
        """
        Gets information about the requested user

        @param self:
        @param request: django.http.HttpRequest the request object
        @param user_id: str the DOD ID for the user requested
        """
        try:
            requested_user = Soldier.objects.get(user_id=user_id)
        except Soldier.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

        user_details = {
            "user_id": requested_user.user_id,
            "rank": requested_user.rank,
            "first_name": requested_user.first_name,
            "last_name": requested_user.last_name,
            "display": requested_user.name_and_rank(),
            "pv2_dor": requested_user.pv2_dor,
            "pfc_dor": requested_user.pfc_dor,
            "spc_dor": requested_user.spc_dor,
            "sgt_dor": requested_user.sgt_dor,
            "ssg_dor": requested_user.ssg_dor,
            "sfc_dor": requested_user.sfc_dor,
            "unit_id": requested_user.unit.uic,
            "dod_email": requested_user.dod_email,
            "birth_month": requested_user.birth_month,
            "is_admin": requested_user.is_admin,
            "is_maintainer": requested_user.is_maintainer,
            "availability_status": get_prevailing_user_status(requested_user.user_id),
            "primary_mos": requested_user.primary_mos.mos if requested_user.primary_mos else "None",
            "primary_ml": get_soldier_mos_ml(requested_user),
            "all_mos_and_ml": get_soldier_mos_ml(requested_user, all=True),
        }

        return JsonResponse(user_details)

    @method_decorator(log_api_call)
    def post(self, request: HttpRequest, user_id: str):
        """
        Accepts information about a given user and creates an associated account and initial default role

        @param self:
        @param request: django.http.HttpRequest the request object
        @param user_id: str The user_id to create a new user for
        """
        try:
            updated_by = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
        except:
            updated_by = None

        body_unicode = request.body.decode("utf-8")
        new_user = json.loads(body_unicode)

        try:
            new_user_unit = Unit.objects.get(uic=new_user["unit"])
        except Unit.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

        try:
            new_soldier = Soldier(
                user_id=user_id,
                rank=new_user["rank"],
                first_name=new_user["first_name"],
                last_name=new_user["last_name"],
                unit=new_user_unit,
                is_admin=new_user["is_admin"],
                is_maintainer=new_user["is_maintainer"],
            )

            primary_mos = new_user.get("primary_mos", None)
            if primary_mos is not None:
                if primary_mos != "None":
                    try:
                        mos = MOSCode.objects.get(mos=primary_mos)
                        new_soldier.primary_mos = mos
                    except:
                        raise ValidationError("{} not found in MOS Codes".format(mos))

            new_soldier._history_user = updated_by
            new_soldier.save()
        except:
            return HttpResponseServerError(HTTP_400_SOLDIER_CREATE_FAILED_ERROR_MESSAGE)

        # Add additional MOS for new user
        additional_mos = new_user.get("additional_mos", None)
        if additional_mos is not None:
            if type(additional_mos) == str:
                additional_mos = [additional_mos]
            for mos in list(additional_mos):
                if mos != "None":
                    try:
                        mos = MOSCode.objects.get(mos=mos)
                        # create additional soldier mos
                        additional_mos_object = SoldierAdditionalMOS.objects.create(soldier=new_user, mos=mos)
                    except:
                        raise ValidationError("{} not found in MOS Codes".format(mos))

        # If soldier being creating in unit with unit flag, apply flag to that soldier
        unit_flag = SoldierFlag.objects.filter(unit=new_user_unit, soldier=None).first()
        if not unit_flag is None:
            flag = SoldierFlag(
                soldier=new_soldier,
                unit=new_user_unit,
                flag_type=unit_flag.flag_type,
                unit_position_flag_info=unit_flag.unit_position_flag_info,
                mx_availability=unit_flag.mx_availability,
                start_date=datetime.date.today(),
                end_date=unit_flag.end_date,
                flag_remarks=unit_flag.flag_remarks,
                last_modified_by=unit_flag.last_modified_by,
            )
            flag._history_user = unit_flag.last_modified_by
            flag.save()

        return HttpResponse("Created New User")

    @method_decorator(log_api_call)
    def put(self, request: HttpRequest, user_id: str):
        """
        Accepts information about a given user and updates their account

        @param self:
        @param request: django.http.HttpRequest the request object
        @param user_id: str the DOD ID number for the user whose information to update
        """
        try:
            updated_by = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
        except:
            updated_by = None

        body_unicode = request.body.decode("utf-8")
        user_updates = json.loads(body_unicode)

        try:
            user = Soldier.objects.get(user_id=user_id)
        except Soldier.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

        old_unit = None

        # Inputs from soldier update profile modal
        user.rank = user_updates["rank"]
        user.first_name = user_updates["first_name"]
        user.last_name = user_updates["last_name"]

        # If soldier being transferred
        if user.unit.uic != user_updates["unit"]:
            try:
                unit = Unit.objects.get(uic=user_updates["unit"])
            except Unit.DoesNotExist:
                return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

            old_unit = user.unit
            user.unit = unit

            # Remove Unit flags from losing unit
            old_unit_flag = SoldierFlag.objects.filter(unit=old_unit, soldier=user).first()
            if not old_unit_flag is None:
                old_unit_flag.end_date = datetime.date.today()
                old_unit_flag._history_user = old_unit_flag.last_modified_by
                old_unit_flag.save()

            # Add Unit flags from gaining unit
            unit_flag = SoldierFlag.objects.filter(unit=user.unit, soldier=None).first()
            if not unit_flag is None:
                flag = SoldierFlag(
                    soldier=user,
                    unit=user.unit,
                    flag_type=unit_flag.flag_type,
                    unit_position_flag_info=unit_flag.unit_position_flag_info,
                    mx_availability=unit_flag.mx_availability,
                    start_date=datetime.date.today(),
                    end_date=unit_flag.end_date,
                    flag_remarks=unit_flag.flag_remarks,
                    last_modified_by=unit_flag.last_modified_by,
                )
                flag._history_user = unit_flag.last_modified_by
                flag.save()

        # Additional put inputs from admin page user management
        is_maintainer = user_updates.get("is_maintainer", "not_passed")
        if is_maintainer != "not_passed":
            user.is_maintainer = is_maintainer

        # Update primary MOS
        primary_mos = user_updates.get("primary_mos", "not_passed")
        if primary_mos != "not_passed":
            if primary_mos == "None":
                user.primary_mos = None
            else:
                try:
                    primary_mos = MOSCode.objects.get(mos=primary_mos)
                except:
                    raise ValidationError("{} not found in MOS Codes".format(primary_mos))
                user.primary_mos = primary_mos

        # Update additional MOS
        additional_mos = user_updates.get("additional_mos", "not_passed")
        if additional_mos != "not_passed":
            if additional_mos is None:
                # Remove all additional mos if None is passed (no additional MOS selected)
                SoldierAdditionalMOS.objects.filter(soldier=user).delete()
            else:
                if type(additional_mos) == str:
                    additional_mos = [additional_mos]
                for mos in list(additional_mos):
                    if mos != "None":
                        try:
                            mos = MOSCode.objects.get(mos=mos)
                            # Get or create additional soldier mos
                            additional_mos_object, _ = SoldierAdditionalMOS.objects.get_or_create(soldier=user, mos=mos)
                        except:
                            raise ValidationError("{} not found in MOS Codes".format(mos))
                # Remove any additional mos that weren't passed in call
                soldier_mos_to_remove = SoldierAdditionalMOS.objects.filter(soldier=user).exclude(
                    mos__mos__in=additional_mos
                )
                soldier_mos_to_remove.delete()

        user._history_user = updated_by
        user.save()

        return HttpResponse("Updated User Account")
