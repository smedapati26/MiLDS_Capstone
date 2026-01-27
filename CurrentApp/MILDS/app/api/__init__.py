from ninja import NinjaAPI
from app.api.griffin import router as griffin_router

api = NinjaAPI(title="MiLDS API", docs_url=None)
api.add_router("/griffin", griffin_router)