from django.db import connection
from django.http import JsonResponse
from ninja import NinjaAPI, Swagger

from agse.api.routes import agse_router
from aircraft.api.aircraft.edit.routes import aircraft_edit_router
from aircraft.api.aircraft.routes import aircraft_router
from aircraft.api.components.routes import component_router
from aircraft.api.equipment.routes import equipment_router
from aircraft.api.faults.routes import faults_router
from aircraft.api.fhp.routes import fhp_router
from aircraft.api.inspections.routes import inspection_router
from aircraft.api.mods.routes import mod_router
from aircraft.api.readiness.routes import readiness_router
from auto_dsr.api.routes import auto_dsr_router
from auto_dsr.api.user_requests.admins.routes import user_requests_admins_router
from auto_dsr.api.user_requests.routes import user_requests_router
from auto_dsr.api.user_roles.routes import user_role_router
from auto_dsr.api.users.routes import login_router
from auto_dsr.api.users.routes import router as users_router
from events.api.routes import events_router
from griffin_ai.backends import AccountAuthBackend
from notifications.api.routes import notifications_router
from personnel.api.routes import personnel_router
from reports.api.dsr_export.routes import dsr_export_router
from units.api.favorite_unit.routes import router as favorite_units_router
from units.api.routes import router as units_router


def authenticate(request):
    user = AccountAuthBackend.authenticate(request)
    if user:
        return user
    else:
        return None


api = NinjaAPI(
    title="Griffin API",
    version="0.0.1",
    description="Griffin.ai API Documentation",
    docs=Swagger(settings={"deepLinking": True, "docExpansion": None, "defaultModelsExpandDepth": 0, "filter": True}),
)

api.add_router("/agse", agse_router, tags=["AGSE"], auth=authenticate)
api.add_router("/aircraft/edit", aircraft_edit_router, tags=["Aircraft", "Edit"], auth=authenticate)
api.add_router("/aircraft", aircraft_router, tags=["Aircraft"], auth=authenticate)
api.add_router("/auto_dsr", auto_dsr_router, tags=["Auto DSR"], auth=authenticate)
api.add_router("/components", component_router, tags=["Components"], auth=authenticate)
api.add_router("/events", events_router, tags=["Events"], auth=authenticate)
api.add_router("/faults", faults_router, tags=["Faults"], auth=authenticate)
api.add_router("/fhp", fhp_router, tags=["FHP"], auth=authenticate)
api.add_router("/inspections", inspection_router, tags=["Inspections"], auth=authenticate)
api.add_router("/mods", mod_router, tags=["Mods"], auth=authenticate)
api.add_router("/readiness", readiness_router, tags=["Readiness"], auth=authenticate)
api.add_router("/reports", dsr_export_router, tags=["Reports"])
api.add_router("/units/favorites", favorite_units_router, tags=["Units", "Favorites"], auth=authenticate)
api.add_router("/units", units_router, tags=["Units"], auth=authenticate)
api.add_router(
    "/users/requests/admin", user_requests_admins_router, tags=["Users", "User Requests", "Admin"], auth=authenticate
)
api.add_router("/users/requests", user_requests_router, tags=["Users", "User Requests"], auth=authenticate)
api.add_router("/users/roles", user_role_router, tags=["Users", "Roles"], auth=authenticate)
api.add_router("/users", users_router, tags=["Users"], auth=authenticate)
api.add_router("/who-am-i", login_router, tags=["Login", "Users"])
api.add_router("/notifications", notifications_router, tags=["Notifications"], auth=authenticate)
api.add_router("/personnel", personnel_router, tags=["Personnel"], auth=authenticate)


@api.get("/health", auth=None, tags=["Health"])
def health_check(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            cursor.fetchone()
        return JsonResponse({"status": "ok", "db": "connected"})
    except Exception as e:
        return JsonResponse({"status": "error", "db": str(e)}, status=500)


api.add_router("/equipment", equipment_router, tags=["Equipment"], auth=authenticate)
