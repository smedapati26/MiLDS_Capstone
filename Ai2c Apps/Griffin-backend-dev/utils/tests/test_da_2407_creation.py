from datetime import datetime

from aircraft.models import DA_2407, Aircraft
from auto_dsr.models import Unit


def create_single_test_da_2407(
    customer_unit: Unit,
    support_unit: Unit,
    uic_work_order_number: str = "123",
    work_order_number: str = "456",
    aircraft: Aircraft = None,
    shop: str = "Test Shop",
    deficiency: str = "Test Deficiency",
    malfunction_desc: str = "Test Malfunction",
    remarks: str = "Test Remark",
    submitted_datetime: datetime = datetime.now().astimezone(),
    accepted_datetime: datetime = datetime.now().astimezone(),
    work_start_datetime: datetime = datetime.now().astimezone(),
    when_discovered: str = "Test Discovered",
    how_discovered: str = "Test Discovered",
) -> DA_2407:
    """
    Creates a single DA2407 object.
    """
    return DA_2407.objects.create(
        customer_unit=customer_unit,
        support_unit=support_unit,
        uic_work_order_number=uic_work_order_number,
        work_order_number=work_order_number,
        aircraft=aircraft,
        shop=shop,
        deficiency=deficiency,
        malfunction_desc=malfunction_desc,
        remarks=remarks,
        submitted_datetime=submitted_datetime,
        accepted_datetime=accepted_datetime,
        work_start_datetime=work_start_datetime,
        when_discovered=when_discovered,
        how_discovered=how_discovered,
    )
