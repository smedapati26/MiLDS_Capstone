from django.db.models import QuerySet
from django.http import HttpRequest, HttpResponseNotFound, JsonResponse

from aircraft.model_utils import ModificationTypes
from aircraft.models import AppliedModification, Modification, ModificationCategory
from auto_dsr.models import Unit
from utils.http import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST

MOD_TYPE_TO_COLUMN = {
    ModificationTypes.COUNT: "count",
    ModificationTypes.INSTALL: "installed",
    ModificationTypes.OTHER: "other",
    ModificationTypes.STATUS: "status",
    ModificationTypes.CATEGORY: "category__value",
}


def get_modification_system(request: HttpRequest, unit_uic: str):
    """
    Gets all modifications in the data base and each modification
    assigned to the requested unit's aircraft

    @param request: (django.http.HttpRequest) the request object
    @param unit_uic: (str) the uic of the requested Unit
    """
    try:
        unit = Unit.objects.get(uic=unit_uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    modifications = Modification.objects.all()

    modification_data = []

    for modification in modifications:
        if modification.type == ModificationTypes.CATEGORY:
            modification_data.append(
                {
                    "name": modification.name,
                    "type": ", ".join(
                        list(
                            ModificationCategory.objects.filter(modification=modification).values_list(
                                "value", flat=True
                            )
                        )
                    ),
                }
            )
        else:
            modification_data.append({"name": modification.name, "type": modification.type})

    applied_mods_qs = AppliedModification.objects.filter(aircraft__uic=unit)

    unique_applied_mods = set(applied_mods_qs.values_list("modification", flat=True))

    return_data = {"modification_data": modification_data}
    applied_mods_data = []

    for mod_name in unique_applied_mods:
        mod = Modification.objects.get(name=mod_name)

        mod_data = {"name": mod.name, "type": mod.type}

        currently_applied = applied_mods_qs.filter(modification=mod)

        mod_data["values"] = applied_mod_values(currently_applied, mod)

        mod_data["serials"] = list(currently_applied.values_list("aircraft__serial", flat=True))

        applied_mods_data.append(mod_data)

    return_data["unit_modification_data"] = applied_mods_data

    return JsonResponse(return_data, safe=False)


def applied_mod_values(mod_qs: QuerySet[AppliedModification], mod: Modification):
    """
    When passed in a QuerySet of AppliedModifications and the modification to get the values for,
    returns the values pertaining to that Modification.

    @param mod_qs: (QuerySet(AppliedModification)) The QuerySet of AppliedModifications
    @param mod: (Modification) the modification to retrieve values for from the given QuerySet

    @returns: (list(float | str | bool)) The columns of said Modification that are applied.
    """
    mod_value_column = MOD_TYPE_TO_COLUMN[mod.type]

    return list(mod_qs.values_list(mod_value_column, flat=True))
