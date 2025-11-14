from ninja import NinjaAPI
from django.forms.models import model_to_dict
from app.back_end.models import Aircraft, Soldier

api = NinjaAPI(title="MiLDS API", docs_url=None)

# --- Aircraft ---
@api.get("/aircraft/")
def api_aircraft_list(request):
    qs = Aircraft.objects.all().values()
    return list(qs)

@api.get("/aircraft/{pk}")
def api_aircraft_detail(request, pk: int):
    obj = Aircraft.objects.filter(pk=pk).first()
    if not obj:
        return api.create_response(request, {"detail": "Not found"}, status=404)
    return model_to_dict(obj)

# --- Personnel ---
@api.get("/personnel/")
def api_personnel_list(request):
    qs = Soldier.objects.all().values()
    return list(qs)

@api.get("/personnel/{pk}")
def api_personnel_detail(request, pk: int):
    obj = Soldier.objects.filter(pk=pk).first()
    if not obj:
        return api.create_response(request, {"detail": "Not found"}, status=404)
    return model_to_dict(obj)