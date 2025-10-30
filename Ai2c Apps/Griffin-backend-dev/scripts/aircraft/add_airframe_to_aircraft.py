from tqdm import tqdm

from aircraft.models import Aircraft, Airframe

all_aircraft = Aircraft.objects.all()
for aircraft in tqdm(all_aircraft):
    airframe = Airframe.objects.get(mds=aircraft.model)
    aircraft.airframe = airframe
    aircraft.save()
