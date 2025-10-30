from django.db import connection
from django.http import JsonResponse
from ninja import NinjaAPI, Swagger

from faults.api.routes import router as faults_router
from forms.api.routes import router as forms_router
from personnel.api.flags.routes import router as flags_router
from personnel.api.routes import router as personnel_router
from personnel.api.soldier_management.routes import soldier_management_router
from personnel.api.soldier_requests.routes import router as soldier_requests_router
from personnel.api.unit_health.routes import router as unit_health_router
from personnel.api.users.routes import login_router
from personnel.api.users.routes import router as users_router
from personnel.api.vantage.routes import router as vantage_router
from tasks.api.routes import router as tasks_router
from units.api.routes import router as units_router

api = NinjaAPI(
    title="A-MAP API",
    version="1.0.0",
    description="A-MAP API Documentation",
    docs=Swagger(settings={"deepLinking": True, "docExpansion": None, "defaultModelsExpandDepth": 0, "filter": True}),
)
api.add_router("/personnel", personnel_router, tags=["personnel"])
api.add_router("/units", units_router, tags=["units"])
api.add_router("/forms", forms_router, tags=["forms"])
api.add_router("/who-am-i", login_router, tags=["login"])
api.add_router("/users", users_router, tags=["users"])
api.add_router("/tasks", tasks_router, tags=["tasks"])
api.add_router("/vantage", vantage_router)
api.add_router("/flags", flags_router, tags=["flags"])
api.add_router("/unit_health", unit_health_router, tags=["unit health"])
api.add_router("/soldier_management", soldier_management_router, tags=["soldier management"])
api.add_router("/soldier_requests", soldier_requests_router, tags=["soldier requests"])
api.add_router("/faults", faults_router, tags=["faults"])


@api.get("/health", auth=None, tags=["Health"])
def health_check(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            cursor.fetchone()
        return JsonResponse({"status": "ok", "db": "connected"})
    except Exception as e:
        return JsonResponse({"status": "error", "db": str(e)}, status=500)
