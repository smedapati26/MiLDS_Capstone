from aircraft.model_utils import AircraftFamilies
from aircraft.models import Aircraft, Airframe

distinct_mds = Aircraft.objects.values_list("model", flat=True).distinct()

for mds in distinct_mds:
    split = mds.split("-")
    model = "-".join(split[:2])
    if model.startswith("CH-47F"):
        model = "CH-47F"

    if "-47" in model:
        family = AircraftFamilies.CHINOOK
    elif "-60" in model:
        family = AircraftFamilies.BLACKHAWK
    elif "-64" in model:
        family = AircraftFamilies.APACHE
    elif "-72" in model:
        family = AircraftFamilies.LAKOTA
    else:
        family = AircraftFamilies.OTHER

    airframe = Airframe.objects.create(mds=mds, model=model, family=family)
