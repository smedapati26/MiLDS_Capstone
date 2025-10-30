from ninja import Router

from personnel.api.readiness.routes import router as readiness_router
from personnel.api.soldier_designation.routes import soldier_designation_router

router = Router()


router.add_router("/readiness", readiness_router, tags=["readiness", "personnel", "griffin"])
router.add_router("/designation", soldier_designation_router, tags=["readiness", "personnel"])
