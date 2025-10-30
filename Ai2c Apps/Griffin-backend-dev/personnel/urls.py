from django.urls import path

from personnel.views import transform_mtoe, transform_readiness_level, transform_readiness_skill, transform_skills

urlpatterns = [
    path("transform/mtoe", transform_mtoe, name="transform_mtoe"),
    path("transform/skills", transform_skills, name="transform_skills"),
    path("transform/readiness_skill", transform_readiness_skill, name="transform_readiness_skill"),
    path("transform/readiness_level", transform_readiness_level, name="transform_readiness_level"),
]
