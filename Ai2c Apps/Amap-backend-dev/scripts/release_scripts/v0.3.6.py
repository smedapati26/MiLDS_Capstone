from simple_history.utils import update_change_reason

from personnel.models import Soldier, SoldierFlag, UserRequest, UserRole, UserRoleAccessLevel


# Delete soldier unit flags - can run whenever
def delete_soldier_unit_flags():
    flags_to_delete = SoldierFlag.objects.filter(soldier__isnull=False, unit__isnull=False, flag_deleted=False)
    print(flags_to_delete.count())
    for flag in flags_to_delete:
        flag.flag_deleted = True
        flag.history_user = Soldier.objects.get(user_id="1036553100")
        flag.save()
        update_change_reason(flag, "Removed soldier flags that were created as part of a unit flag")


# Run whenever
# delete_soldier_unit_flags()


def create_simplehistory_for_roles():
    user_roles = UserRole.objects.all()
    for role in user_roles:
        role.save()
        update_change_reason(role, "Initial save of user role history")
    user_requests = UserRequest.objects.all()
    for request in user_requests:
        request.save()
        update_change_reason(request, "Initial save of user request history")


# Run BEFORE the conversion for the roles
# create_simplehistory_for_roles()


def convert_user_roles():
    user_roles = UserRole.objects.all()
    for role in user_roles:
        if role.access_level == UserRoleAccessLevel.EVALUATOR:
            role.access_level = UserRoleAccessLevel.RECORDER
        elif role.access_level == UserRoleAccessLevel.MANAGER:
            role.access_level = UserRoleAccessLevel.RECORDER
        elif role.access_level == UserRoleAccessLevel.ADMIN:
            role.access_level = UserRoleAccessLevel.MANAGER
        else:
            continue
        role.save()
        update_change_reason(role, "Conversion of legacy roles to new role structure")
    user_requests = UserRequest.objects.all()
    for request in user_requests:
        if request.access_level == UserRoleAccessLevel.EVALUATOR:
            request.access_level = UserRoleAccessLevel.RECORDER
        elif request.access_level == UserRoleAccessLevel.MANAGER:
            request.access_level = UserRoleAccessLevel.RECORDER
        elif request.access_level == UserRoleAccessLevel.ADMIN:
            request.access_level = UserRoleAccessLevel.MANAGER
        else:
            continue
        request.save()
        update_change_reason(request, "Conversion of legacy requests to new role structure")


convert_user_roles()
