from ninja import NinjaAPI
from .personnel import router as personnel_router
from .aircraft import router as aircraft_router

api = NinjaAPI(
    title="MILDS API",
    version="1.0.0",
    description="Observer Controller Injection Suite",
    docs_url="/docs",
)

api.add_router("/personnel", personnel_router, tags=["Personnel"])
api.add_router("/aircraft", aircraft_router, tags=["Aircraft"])