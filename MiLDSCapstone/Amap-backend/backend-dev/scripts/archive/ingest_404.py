def ingest_sample_404th(request):
    # Access soldier csv
    os.chdir("C:\\Users\\1036553100121004.MIL\\Documents\\SampleSoldier")
    rows = []
    with open("404.csv", "r") as csvfile:
        datareader = csv.reader(csvfile)
        next(datareader, None)  # skip headers
        for row in datareader:
            unit, _ = Unit.objects.get_or_create(uic=row[1])
            # if unit_created:
            short_name = "None"
            long_name = "None"
            if row[1] == "WJYCA0":
                short_name = "A Co, 404th ASB"
                long_name = "Alpha Company, 404th Aviation Support Battalion"
            if row[1] == "WJYCB0":
                short_name = "B Co, 404th ASB"
                long_name = "Bravo Company, 404th Aviation Support Battalion"
            if row[1] == "WJYCC0":
                short_name = "C Co, 404th ASB"
                long_name = "Charlie Company, 404th Aviation Support Battalion"
            if row[1] == "WJYCT0":
                short_name = "HSC, 404th ASB"
                long_name = "Headquarters and Service Company, 404th Aviation Support Battalion"
            unit.short_name = short_name
            unit.display_name = long_name
            unit.echelon = "CO"
            try:
                parent = Unit.objects.get(uic="WJYCAA")
                unit.parent_uic = parent
            except Unit.DoesNotExist:
                return HttpResponse("Unit does not exist")
            unit.save()
            soldier, _ = Soldier.objects.get_or_create(user_id=row[0], unit=unit, is_admin=False)
            # if soldier_created:
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

    return HttpResponse("Successfuly ingested soldiers")
