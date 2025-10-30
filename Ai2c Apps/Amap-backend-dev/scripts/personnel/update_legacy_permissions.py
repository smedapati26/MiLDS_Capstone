from personnel.model_utils import UserRoleAccessLevel
from personnel.models import UserRequest, UserRole


def change_legacy_roles():
    admins_changed = 0
    evaluators_changed = 0
    admin_roles = UserRole.objects.filter(access_level=UserRoleAccessLevel.ADMIN)
    for admin in admin_roles:
        admin.access_level = UserRoleAccessLevel.MANAGER
        admin.save()
        admins_changed += 1
    evaluator_roles = UserRole.objects.filter(access_level=UserRoleAccessLevel.EVALUATOR)
    for evaluator in evaluator_roles:
        evaluator.access_level = UserRoleAccessLevel.RECORDER
        evaluator.save()
        evaluators_changed += 1
    print("{} Admins and {} Evaluator Roles Changed".format(admins_changed, evaluators_changed))


def change_legacy_requests():
    admins_changed = 0
    evaluators_changed = 0
    admin_reqs = UserRequest.objects.filter(access_level=UserRoleAccessLevel.ADMIN)
    for admin in admin_reqs:
        admin.access_level = UserRoleAccessLevel.MANAGER
        admin.save()
        admins_changed += 1
    evaluator_reqs = UserRequest.objects.filter(access_level=UserRoleAccessLevel.EVALUATOR)
    for evaluator in evaluator_reqs:
        evaluator.access_level = UserRoleAccessLevel.RECORDER
        evaluator.save()
        evaluators_changed += 1
    print("{} Admins and {} Evaluator Requests Changed".format(admins_changed, evaluators_changed))


change_legacy_roles()
change_legacy_requests()
