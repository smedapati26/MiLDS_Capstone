from tqdm import tqdm

from aircraft.models import Aircraft

all_aircraft = Aircraft.objects.all()

for aircraft in tqdm(all_aircraft):
    aircraft.owning_unit = aircraft.current_unit
    aircraft.save()
