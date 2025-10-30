from ninja import Router

from forms.api.counselings.routes import router as counselings_router
from forms.api.events.routes import router as events_router
from forms.api.supporting_documents.routes import router as supporting_docs_router

router = Router()


router.add_router("/counselings", counselings_router, tags=["counselings"])
router.add_router("/events", events_router, tags=["events"])
router.add_router("/supporting_documents", supporting_docs_router, tags=["supporting_documents"])
