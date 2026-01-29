from ninja import Router
from django.shortcuts import get_object_or_404
from app.back_end.models import Aircraft
from app.api.griffin_client import GriffinClient

router = Router()

# --- SYNCHRONIZATION ---
@router.post("/sync/unit/{uic}")
def trigger_unit_sync(request, uic: str):
    """
    Observer Controller clicks 'Refresh Data' in UI.
    This calls Griffin, gets fresh data, and updates local MILDS DB.
    """
    client = GriffinClient()
    client.sync_aircraft_data(uic)
    return {"message": f"Successfully synced data for {uic}"}

# --- INJECTION ---
@router.post("/inject/fault")
def inject_aircraft_fault(request, aircraft_pk: int, fault_code: str, description: str):
    """
    Observer Controller injects a fault.
    1. Update local MILDS DB to show the pending inject.
    2. Push the inject to Griffin.
    """
    # 1. Get Local Object
    plane = get_object_or_404(Aircraft, aircraft_pk=aircraft_pk)
    
    # 2. Push to Griffin
    client = GriffinClient()
    # Assuming we map PK to Serial for the external call
    # You might need a field in your model like 'serial_number' if pk is just an auto-int
    external_response = client.inject_aircraft_status(
        serial=str(plane.aircraft_pk), # Or plane.serial if you add that field
        new_status="NMC", 
        remarks=f"EXERCISE: {description}"
    )
    
    # 3. Update Local State to reflect success
    plane.status = "NMC"
    plane.remarks = f"EXERCISE: {description}"
    plane.save()
    
    return {"success": True, "external_ref": external_response}