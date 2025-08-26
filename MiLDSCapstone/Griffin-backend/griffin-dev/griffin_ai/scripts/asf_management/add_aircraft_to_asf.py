from aircraft.models import Aircraft
from auto_dsr.models import Unit


asfs = Unit.objects.get(uic="W8AMFFASF")
asf = Unit.objects.get(uic="W89KAA")

with open("scripts/asf_management/data/gaarng_aasf3.txt", "r") as f:
    lines = f.readlines()
    tail_numbers = [line.strip() for line in lines]
    aircraft = Aircraft.objects.filter(serial__in=tail_numbers)
    for a in aircraft:
        a.uic.add(asf, asfs)
