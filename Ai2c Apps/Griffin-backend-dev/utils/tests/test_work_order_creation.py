from django.utils import timezone

from agse.models import AGSE
from aircraft.models import Aircraft, Fault
from supply.models import AGSEWorkOrder, AircraftWorkOrder, RawWorkOrder, UAVWorkOrder, WorkOrder, WorkOrderStatus
from uas.models import UAV


def create_single_test_generic_work_order(
    changed_by: str = "Ferris Bueller",
    created_by: str = "Abe Froman",
    order_number: str = "A12345",
    order_status: WorkOrderStatus = WorkOrderStatus.TECHNICALLY_COMPLETE,
    technical_status: Fault.TechnicalStatus = Fault.TechnicalStatus.NO_STATUS,
) -> WorkOrder:
    """
    Creates a single WorkOrder object

    @param changed_by:
    @param created_by:
    order_number:
    order_status:
    technical_status:

    @returns (WorkOrder)
            The newly created WorkOrder object.
    """
    new_work_order = WorkOrder.objects.create(
        changed_by=changed_by,
        created_by=created_by,
        order_number=order_number,
        order_status=order_status,
        technical_status=technical_status,
        changed_at=timezone.now(),
        created_at=timezone.now(),
        last_update_time=timezone.now(),
    )

    return new_work_order


def create_single_test_aircraft_work_order(
    aircraft: Aircraft,
    changed_by: str = "Ferris Bueller",
    created_by: str = "Abe Froman",
    order_number: str = "ACWO123",
    order_status: WorkOrderStatus = WorkOrderStatus.TECHNICALLY_COMPLETE,
    technical_status: Fault.TechnicalStatus = Fault.TechnicalStatus.NO_STATUS,
) -> AircraftWorkOrder:
    """
    Creates a single WorkOrder object

    @param changed_by:
    @param created_by:
    order_number:
    order_status:
    technical_status:

    @returns (WorkOrder)
            The newly created WorkOrder object.
    """
    new_work_order = AircraftWorkOrder.objects.create(
        aircraft=aircraft,
        changed_by=changed_by,
        created_by=created_by,
        order_number=order_number,
        order_status=order_status,
        technical_status=technical_status,
        changed_at=timezone.now(),
        created_at=timezone.now(),
        last_update_time=timezone.now(),
    )

    return new_work_order


def create_single_test_uav_work_order(
    uav: UAV,
    changed_by: str = "Ferris Bueller",
    created_by: str = "Abe Froman",
    order_number: str = "UAVWO0123",
    order_status: WorkOrderStatus = WorkOrderStatus.TECHNICALLY_COMPLETE,
    technical_status: Fault.TechnicalStatus = Fault.TechnicalStatus.NO_STATUS,
) -> AircraftWorkOrder:
    """
    Creates a single WorkOrder object

    @param changed_by:
    @param created_by:
    order_number:
    order_status:
    technical_status:

    @returns (WorkOrder)
            The newly created WorkOrder object.
    """
    new_work_order = UAVWorkOrder.objects.create(
        uav=uav,
        changed_by=changed_by,
        created_by=created_by,
        order_number=order_number,
        order_status=order_status,
        technical_status=technical_status,
        changed_at=timezone.now(),
        created_at=timezone.now(),
        last_update_time=timezone.now(),
    )

    return new_work_order


def create_single_test_agse_work_order(
    agse: AGSE,
    changed_by: str = "Ferris Bueller",
    created_by: str = "Abe Froman",
    order_number: str = "UAVWO0123",
    order_status: WorkOrderStatus = WorkOrderStatus.TECHNICALLY_COMPLETE,
    technical_status: Fault.TechnicalStatus = Fault.TechnicalStatus.NO_STATUS,
) -> AircraftWorkOrder:
    """
    Creates a single WorkOrder object

    @param changed_by:
    @param created_by:
    order_number:
    order_status:
    technical_status:

    @returns (WorkOrder)
            The newly created WorkOrder object.
    """
    new_work_order = AGSEWorkOrder.objects.create(
        agse=agse,
        changed_by=changed_by,
        created_by=created_by,
        order_number=order_number,
        order_status=order_status,
        technical_status=technical_status,
        changed_at=timezone.now(),
        created_at=timezone.now(),
        last_update_time=timezone.now(),
    )

    return new_work_order


def create_single_test_raw_work_order(
    changed_by: str = "Ferris Bueller",
    created_by: str = "Abe Froman",
    order_number: str = "A12345",
    order_status: WorkOrderStatus = WorkOrderStatus.TECHNICALLY_COMPLETE,
    technical_status: Fault.TechnicalStatus = Fault.TechnicalStatus.NO_STATUS,
    equipment_number: str = "EQ123",
) -> WorkOrder:
    """
    Creates a single WorkOrder object

    @param changed_by:
    @param created_by:
    order_number:
    order_status:
    technical_status:

    @returns (WorkOrder)
            The newly created WorkOrder object.
    """
    new_work_order = RawWorkOrder.objects.create(
        last_changed_by_user=changed_by,
        created_by_user=created_by,
        work_order_number=order_number,
        order_status=order_status,
        technical_status_code=technical_status,
        last_changed_at_timestamp=timezone.now(),
        created_at_timestamp=timezone.now(),
        centaur_sync_timestamp=timezone.now(),
        equipment_number=equipment_number,
    )

    return new_work_order
