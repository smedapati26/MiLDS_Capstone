from datetime import timezone

from agse.models import AGSE
from aircraft.models import Aircraft, Fault
from supply.models import AGSEWorkOrder, AircraftWorkOrder, RawWorkOrder, UAVWorkOrder, WorkOrder, WorkOrderStatus
from uas.models import UAV
from utils.data import JULY_FOURTH_1776
from utils.time.parse_time import vantage_strptime


def transform_work_orders():
    """
    Transforms Work Orders to specific Equipment Work Orders
    Note: The copy from raw utility should not be used as each equipment has to be found then mapped to the specific table.
    """
    failed_updates = set()
    total_records = RawWorkOrder.objects.count()
    for record in RawWorkOrder.objects.all():
        work_order = None
        try:
            work_order = WorkOrder.objects.get(order_number=record.work_order_number)
        except WorkOrder.DoesNotExist:
            awo = Aircraft.objects.filter(equipment_number=record.equipment_number)
            if awo.count() == 1:
                work_order = AircraftWorkOrder(
                    aircraft=awo[0],
                    order_number=record.work_order_number,
                    created_by=record.created_by_user,
                    created_at=vantage_strptime(record.created_at_timestamp, tz=timezone.utc),
                    last_update_time=JULY_FOURTH_1776,
                )

            uavwo = UAV.objects.filter(equipment_number=record.equipment_number)
            if uavwo.count() == 1:
                work_order = UAVWorkOrder(
                    uav=uavwo[0],
                    order_number=record.work_order_number,
                    created_by=record.created_by_user,
                    created_at=vantage_strptime(record.created_at_timestamp, tz=timezone.utc),
                    last_update_time=JULY_FOURTH_1776,
                )

            agsewo = AGSE.objects.filter(equipment_number=record.equipment_number)
            if agsewo.count() == 1:
                work_order = AGSEWorkOrder(
                    agse=agsewo[0],
                    order_number=record.work_order_number,
                    created_by=record.created_by_user,
                    created_at=vantage_strptime(record.created_at_timestamp, tz=timezone.utc),
                    last_update_time=JULY_FOURTH_1776,
                )

        if work_order:
            order_status_map = {
                "CREATED": WorkOrderStatus.CREATED,
                "RELEASED": WorkOrderStatus.RELEASED,
                "TECHNICALLY_COMPLETED": WorkOrderStatus.TECHNICALLY_COMPLETE,
                "CLOSED": WorkOrderStatus.CLOSED,
            }
            technical_status_map = {
                "TICL": Fault.TechnicalStatus.TI_CLEARED,
                "CLR": Fault.TechnicalStatus.CLEARED,
                "DI": Fault.TechnicalStatus.DIAGONAL,
                "NS": Fault.TechnicalStatus.NO_STATUS,
                "X": Fault.TechnicalStatus.DEADLINE,
                "DA": Fault.TechnicalStatus.DASH,
                "E": Fault.TechnicalStatus.ADMIN_DEADLINE,
                "CX": Fault.TechnicalStatus.CIRCLE_X,
                "BIO": Fault.TechnicalStatus.BIOLOGICAL,
                "CHEM": Fault.TechnicalStatus.CHEMICAL,
                "NUKE": Fault.TechnicalStatus.NUCLEAR,
            }
            total_records = RawWorkOrder.objects.count()

            work_order.main_work_center = record.main_work_center
            work_order.work_center = record.work_center
            work_order.plant = record.plant
            work_order.description = record.description
            work_order.order_status = order_status_map.get(record.order_status, WorkOrderStatus.UNKNOWN)
            work_order.date_released = record.date_released
            work_order.date_technically_completed = record.date_technically_completed
            work_order.date_closed = record.date_closed
            work_order.technical_status = technical_status_map.get(
                record.technical_status_code, Fault.TechnicalStatus.NO_STATUS
            )
            work_order.technical_status_start_datetime = vantage_strptime(
                record.technical_status_timestamp, tz=timezone.utc
            )
            work_order.project_code = record.project_code
            work_order.fund_code = record.fund_code
            work_order.order_priority = record.priority
            work_order.system_condition_code = record.system_condition
            work_order.system_condition_start_datetime = vantage_strptime(
                record.system_condition_datetime, tz=timezone.utc
            )
            work_order.basic_start_datetime = vantage_strptime(record.basic_start_datetime, tz=timezone.utc)
            work_order.basic_finish_datetime = vantage_strptime(record.basic_finish_datetime, tz=timezone.utc)
            work_order.scheduled_start_datetime = vantage_strptime(record.scheduled_start_datetime, tz=timezone.utc)
            work_order.scheduled_finish_datetime = vantage_strptime(record.scheduled_finish_datetime, tz=timezone.utc)
            work_order.actual_start_datetime = vantage_strptime(record.actual_start_datetime, tz=timezone.utc)
            work_order.confirmed_order_finish_datetime = vantage_strptime(
                record.confirmed_order_finish_datetime, tz=timezone.utc
            )
            work_order.changed_by = record.last_changed_by_user
            work_order.changed_at = vantage_strptime(record.last_changed_at_timestamp, tz=timezone.utc)

            try:
                work_order.save()
            except Exception:
                failed_updates.add(record.work_order_number)
        else:
            failed_updates.add(record)

    return "Transformed {} of {} records".format(total_records - len(failed_updates), total_records)
