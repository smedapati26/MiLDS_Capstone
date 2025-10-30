from aircraft.models import Aircraft, Airframe, InspectionReference

distinct_mds = Aircraft.objects.values_list("model", flat=True).distinct()

for reference in InspectionReference.objects.all():
    if reference.model in distinct_mds:
        reference.airframe = Airframe.objects.get(mds=reference.model)
        reference.save()
