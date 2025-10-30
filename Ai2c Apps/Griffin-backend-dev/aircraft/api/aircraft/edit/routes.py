from typing import List

from django.http import HttpRequest
from ninja import Router
from ninja.responses import codes_4xx

from aircraft.api.aircraft.edit.schema import AircraftEditIn, AircraftEditOut
from aircraft.models import Aircraft, AircraftMod
from auto_dsr.model_utils import UserRoleAccessLevel
from auto_dsr.utils import user_has_permissions_to

aircraft_edit_router = Router()


@aircraft_edit_router.patch("", response={200: AircraftEditOut, codes_4xx: AircraftEditOut})
def edit_aircraft(request: HttpRequest, payload: List[AircraftEditIn]):
    """
    Edit a single or multiple aircraft with authorization checks

    Returns:
    - 200: Successful edits (partial or complete)
    - 403: User has no write access to any aircraft UICs
    - 422: User edited invalid field
    """
    # Handle empty payload
    if not payload:
        return 200, AircraftEditOut(edited_aircraft=[], not_edited_aircraft=[], detail=None)

    edited_aircraft = []
    not_edited_aircraft = []

    # Extract all aircraft serials from payload
    aircraft_serials = [aircraft.serial for aircraft in payload]

    existing_aircraft = Aircraft.objects.filter(serial__in=aircraft_serials).prefetch_related("uic")
    aircraft_dict = {aircraft.serial: aircraft for aircraft in existing_aircraft}
    valid_serials = set(aircraft_dict.keys())
    invalid_serials = set(aircraft_serials) - valid_serials
    not_edited_aircraft.extend(invalid_serials)

    # Get UIC for all valid aircraft
    aircraft_uics = {aircraft.serial: list(aircraft.uic.all()) for aircraft in existing_aircraft}

    # check permissions
    authorized_aircraft = []

    for item in payload:
        if item.serial in invalid_serials:
            continue  # Already added to not_edited_aircraft

        # Get all UICs for this aircraft
        uics = aircraft_uics.get(item.serial, [])

        # Check if user has write access to ANY of the aircraft's UICs
        has_access = any(user_has_permissions_to(request.auth, uic, UserRoleAccessLevel.WRITE) for uic in uics)
        if has_access:
            authorized_aircraft.append(item)
        else:
            not_edited_aircraft.append(item.serial)

    # If user has no write access to ANY aircraft, return 403
    if not authorized_aircraft:
        return 403, AircraftEditOut(
            edited_aircraft=[],
            not_edited_aircraft=not_edited_aircraft,
            detail="You do not have write access to any of the specified aircraft UICs",
        )

    # Process updates for authorized aircraft
    for item in authorized_aircraft:

        try:
            aircraft = Aircraft.objects.get(serial=item.serial)

            # Get fields that are being edited, excluding None values and serial
            edit_data = item.dict(exclude_unset=True, exclude={"serial"})

            # Update the fields
            for field, value in edit_data.items():
                setattr(aircraft, field, value)

            if item.field_sync_status is not None:
                current_sync_status = aircraft.field_sync_status or {}
                current_sync_status.update(item.field_sync_status)
                aircraft.field_sync_status = current_sync_status

            if item.mods is not None:

                incoming_mod_ids = set(mod.id for mod in item.mods)

                current_mod_ids = set(AircraftMod.objects.filter(aircraft=aircraft).values_list("id", flat=True))

                mods_to_delete = current_mod_ids - incoming_mod_ids

                if mods_to_delete:

                    AircraftMod.objects.filter(id__in=mods_to_delete, aircraft=aircraft).delete()

                # TODO: In the future handle creation/update of new modifications

            aircraft.save()
            edited_aircraft.append(item.serial)

        except Exception as e:
            if item.serial not in not_edited_aircraft:
                not_edited_aircraft.append(item.serial)

    # Response messages
    if edited_aircraft and not_edited_aircraft:
        message = f"Successfully edited: {len(edited_aircraft)} aircraft edited. {len(not_edited_aircraft)} could not be edited"
    elif edited_aircraft:
        message = f"Successfully edited {len(edited_aircraft)} aircraft."
    else:
        message = "No aircraft were edited. Check permissions and aircraft serials."

    return 200, AircraftEditOut(
        edited_aircraft=edited_aircraft, not_edited_aircraft=not_edited_aircraft, detail=message
    )
