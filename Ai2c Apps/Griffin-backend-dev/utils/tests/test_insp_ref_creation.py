from aircraft.models import Airframe, InspectionReference


def create_single_test_insp_ref(
    common_name: str = "TESTINSP",
    code: str = "TEST",
    is_phase: bool = False,
    description: str = "Test inspection ref.",
    model: str = "TESTMODEL",
    airframe: Airframe = None,
    tracking_type: str = "TEST TRACK TYPE",
    tracking_frequency: float = 0.0,
    schedule_front: float = 0.0,
    schedule_back: float = 0.0,
    writeup_front: float = 0.0,
    writeup_back: float = 0.0,
    extension_value: float = 0.0,
) -> InspectionReference:
    """
    Creates a single InspectionReference object.

    @param common_name (str): Colloquial name of inspection
    @param code (str): Code used to identify inspection
    @param is_phase (bool): Flag to identify phase inspections
    @param description (str): Short text description of inspection
    @param model (str): Model on which the inspection is conducted
    @param airframe (Airframe): airframe on which the inspection is conducted
    @param tracking_type (str): type of measurement over which inspection frequency is measured
    @param tracking_frequency (float): numeric interval over which inspection is conducted
    @param schedule_front (float): numeric amount that inspection can be done ahead of interval
    @param schedule_back (float): numeric amount that inspection can be done after interval
    @param writeup_front (float): numeric amount that writeup can be done ahead of interval
    @param writeup_back (float): numeric amount that writeup can be done after of interval
    @param extension_value (float): numeric amount for maximum extension value for given inspection

    @returns (InspectionReference)
            The newly created InspectionReference object.
    """
    return InspectionReference.objects.create(
        common_name=common_name,
        code=code,
        is_phase=is_phase,
        description=description,
        model=model,
        airframe=airframe,
        tracking_type=tracking_type,
        tracking_frequency=tracking_frequency,
        schedule_front=schedule_front,
        schedule_back=schedule_back,
        writeup_front=writeup_front,
        writeup_back=writeup_back,
        extension_value=extension_value,
    )
