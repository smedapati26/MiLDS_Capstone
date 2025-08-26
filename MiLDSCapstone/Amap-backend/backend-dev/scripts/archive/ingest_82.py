def ingest_82nd_units(request):
    # Access soldier csv
    os.chdir("C:\\Users\\1036553100121004.MIL\\Documents\\82nd")
    rows = []
    with open("82ndUnitsOnly.csv", "r") as csvfile:
        datareader = csv.reader(csvfile)
        next(datareader, None)  # skip headers
        for row in datareader:
            unit, _ = Unit.objects.get_or_create(uic=row[0])
            unit.short_name = row[1]
            unit.display_name = row[2]
            unit.echelon = row[3]
            try:
                parent = Unit.objects.get(uic=row[4])
                unit.parent_uic = parent
            except Unit.DoesNotExist:
                print("Se la vie")
            unit.save()
    return HttpResponse("Ingested 82nd Units")


def ingest_82nd_soldiers(request):
    # Access soldier csv
    os.chdir("C:\\Users\\1036553100121004.MIL\\Documents\\82nd")
    with open("SoldierData.csv", "r") as csvfile:
        datareader = csv.reader(csvfile)
        next(datareader, None)  # skip headers
        for row in datareader:
            try:
                unit = Unit.objects.get(uic=row[1])
                soldier, _ = Soldier.objects.get_or_create(user_id=row[0], unit=unit, is_admin=False)
                soldier.rank = row[2]
                soldier.first_name = row[3]
                soldier.last_name = row[4]
                soldier.mos = row[5]
                soldier.maintenance_level = "ML0"
                # Assign random ML within range for a given rank
                if (row[2] == "PV1") | (row[2] == "PV2"):
                    numeric_ml = 0
                    soldier.maintenance_level = "ML" + str(numeric_ml)
                if row[2] == "PFC":
                    numeric_ml = random.choice([0, 1])
                    soldier.maintenance_level = "ML" + str(numeric_ml)
                if (row[2] == "SPC") | (row[2] == "CPL"):
                    numeric_ml = random.choice([0, 1, 2])
                    soldier.maintenance_level = "ML" + str(numeric_ml)
                if row[2] == "SGT":
                    numeric_ml = random.choice([1, 2, 3])
                    soldier.maintenance_level = "ML" + str(numeric_ml)
                if row[2] == "SSG":
                    numeric_ml = random.choice([2, 3, 4])
                    soldier.maintenance_level = "ML" + str(numeric_ml)
                if row[2] == "SFC":
                    numeric_ml = random.choice([3, 4])
                    soldier.maintenance_level = "ML" + str(numeric_ml)
                soldier.save()
            except Unit.DoesNotExist:
                print("Se la vie")

    return HttpResponse("Successfuly ingested soldiers")
