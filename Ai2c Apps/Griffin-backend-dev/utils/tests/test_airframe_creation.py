from aircraft.models import Airframe


def create_single_test_airframe(
    mds: str = "TH-10AV1",
    model: str = "TH-10A",
    family: str = "Other",
) -> Airframe:
    """
    Creates a single Aircraft object.

    @param mds: (str) The aircraft mission design series value for the new Aircraft
    @param model: (str) The aircraft model for the new Aircraft
    @param family: (str) Family of aircraft that the airframe exists within

    @returns (Airframe)
            The newly created Airframe object.
    """
    airframe = Airframe.objects.create(
        mds=mds,
        model=model,
        family=family,
    )

    return airframe
