import pandas as pd
from django.db import transaction
from ninja import Router

from aircraft.api.mods.schema import ChangesIn
from aircraft.models import Aircraft, AircraftMod, ModType
from auto_dsr.model_utils.user_role_access_level import UserRoleAccessLevel
from auto_dsr.models import Unit
from auto_dsr.utils.user_permission_check import user_has_permissions_to

mod_router = Router()


@mod_router.get("")
def selected_mods(request, uic: str):
    """
    Wide-format mods table for given aircraft serials
    """
    mods = AircraftMod.objects.select_related("aircraft", "mod_type").filter(aircraft__uic=uic)

    # Flatten into rows
    records = []
    for mod in mods:
        records.append(
            {
                "serial_number": mod.aircraft.serial,
                "mod_type": mod.mod_type.name,
                "value": mod.value,
            }
        )

    if not records:
        return []

    df = pd.DataFrame.from_records(records)

    # Pivot: serials as rows, mod_type as columns
    df = df.pivot(index="serial_number", columns="mod_type", values="value").reset_index()

    # Identify which columns have *no nulls* across all rows (so we dont show higher echelons all mods)
    non_null_cols = [col for col in df.columns if col == "serial_number" or not df[col].isnull().any()]

    df = df[non_null_cols]

    # Replace NaN with None for clean JSON
    df = df.where(pd.notnull(df), None)

    return df.to_dict(orient="records")


@mod_router.post("/new_unit_mod")
def add_new_mod(request, uic: str, mod_name: str):
    """
    Create a new mod for a unit (sets all to empty string, so they can later
    be filled by unit)
    """
    unit = Unit.objects.get(uic=uic)
    if user_has_permissions_to(request.auth, unit, access_level=UserRoleAccessLevel.WRITE):
        # if entirely new, create ModType, otherwise, get it
        mod_type, _ = ModType.objects.get_or_create(name=mod_name)

        # create empty AircraftMods for each aircraft in the unit
        mods_to_create = []
        for aircraft in Aircraft.objects.filter(uic=uic):
            try:
                existing_mod = AircraftMod.objects.get(aircraft=aircraft, mod_type=mod_type)
            except AircraftMod.DoesNotExist:
                mods_to_create.append(AircraftMod(aircraft=aircraft, mod_type=mod_type, value=" "))

        with transaction.atomic():
            AircraftMod.objects.bulk_create(mods_to_create)

        return {"success": True}
    else:
        return {"success": False}


@mod_router.post("/remove_unit_mod")
def remove_unit_mod(request, uic: str, mod_name: str):
    """
    Remove a mod for a unit (sets all aircraft value for that mod to null, so it
    no longer shows up for that unit)
    """
    unit = Unit.objects.get(uic=uic)
    if user_has_permissions_to(request.auth, unit, access_level=UserRoleAccessLevel.WRITE):

        mod_type = ModType.objects.get(name=mod_name)

        # set value to null for all Aircraft in that unit
        mods_to_remove = AircraftMod.objects.filter(aircraft__uic=uic, mod_type=mod_type)

        for obj in mods_to_remove:
            obj.value = None

        # Bulk update the objects, specifying the fields to update
        AircraftMod.objects.bulk_update(mods_to_remove, ["value"])

        return {"success": True}
    else:
        return {"success": False}


@mod_router.post("/update_unit_mods")
def update_unit_mods(request, uic: str, body: ChangesIn):
    """
    Update a mod for a unit (change value based on user input)
    """
    unit = Unit.objects.get(uic=uic)
    if user_has_permissions_to(request.auth, unit, access_level=UserRoleAccessLevel.WRITE):
        unit_aircraft = Aircraft.objects.filter(uic=uic)
        serial_to_aircraft = {a.serial: a for a in unit_aircraft}

        updated = 0
        skipped = []

        with transaction.atomic():
            for _, change in body.changes.items():
                # Only apply if the aircraft is part of this unit
                aircraft = serial_to_aircraft.get(change.serial_number)
                if not aircraft:
                    skipped.append(change.serial_number)
                    continue

                # Ensure the ModType exists
                mod_type, _ = ModType.objects.get_or_create(name=change.mod)

                # Update or create the AircraftMod entry
                AircraftMod.objects.update_or_create(
                    aircraft=aircraft,
                    mod_type=mod_type,
                    defaults={"value": change.value},
                )
                updated += 1

        return {
            "success": True,
            "updated": updated,
            "skipped": skipped,
        }
    else:
        return {"success": False}
