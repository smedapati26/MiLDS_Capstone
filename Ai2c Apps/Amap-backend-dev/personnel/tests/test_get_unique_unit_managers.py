from django.test import TestCase, tag

from personnel.models import Unit, UserRole, UserRoleAccessLevel
from personnel.utils.get_unique_unit_managers import get_unique_unit_managers
from units.models import Unit
from utils.tests import create_test_soldier, create_testing_unit, create_user_role_in_all


@tag("personnel", "get_unique_unit_managers")
class GetUniqueUnitManagersTest(TestCase):
    def setUp(self) -> None:
        # Set up test unit with hierarchy
        self.unit_high = create_testing_unit(uic="TEST000CC", echelon=Unit.Echelon.BRIGADE)
        self.unit_mid = create_testing_unit(uic="TEST000BB", echelon=Unit.Echelon.BATTALION, parent_unit=self.unit_high)
        self.unit_low = create_testing_unit(uic="TEST000AA", echelon=Unit.Echelon.COMPANY, parent_unit=self.unit_mid)
        self.unit_low2 = create_testing_unit(uic="TEST000ZZ", echelon=Unit.Echelon.COMPANY, parent_unit=self.unit_mid)
        self.unit_low.set_parent_uics()
        self.unit_low2.set_parent_uics()

        # Set up test soldiers with various roles at different levels
        self.soldier1_low = create_test_soldier(user_id="0000000000", unit=self.unit_low)
        self.soldier2_low = create_test_soldier(user_id="1111111111", unit=self.unit_low)
        self.soldier3_low = create_test_soldier(user_id="2222222222", unit=self.unit_low)
        self.soldier1_mid = create_test_soldier(user_id="3333333333", unit=self.unit_mid)
        self.soldier1_high = create_test_soldier(user_id="4444444444", unit=self.unit_high)
        self.soldier_all = create_test_soldier(user_id="5555555555", unit=self.unit_high)

        # Assign roles
        UserRole.objects.create(user_id=self.soldier1_low, unit=self.unit_low, access_level=UserRoleAccessLevel.MANAGER)
        UserRole.objects.create(user_id=self.soldier2_low, unit=self.unit_low, access_level=UserRoleAccessLevel.MANAGER)
        UserRole.objects.create(
            user_id=self.soldier3_low, unit=self.unit_low, access_level=UserRoleAccessLevel.RECORDER
        )
        UserRole.objects.create(user_id=self.soldier1_mid, unit=self.unit_mid, access_level=UserRoleAccessLevel.MANAGER)
        UserRole.objects.create(
            user_id=self.soldier1_high, unit=self.unit_high, access_level=UserRoleAccessLevel.MANAGER
        )
        create_user_role_in_all(
            soldier=self.soldier_all,
            units=[self.unit_low, self.unit_mid, self.unit_high],
            user_access_level=UserRoleAccessLevel.MANAGER,
        )

    @tag("validation")
    def test_get_all_managers(self):
        """ "
        Checks that the function returns all managers across the hierarchy
        """

        unique_managers = get_unique_unit_managers(self.unit_low)

        self.assertEqual(
            unique_managers,
            {
                self.soldier1_low.user_id,
                self.soldier2_low.user_id,
                self.soldier1_mid.user_id,
                self.soldier1_high.user_id,
                self.soldier_all.user_id,
            },
        )

    @tag("validation")
    def test_get_lowest_managers(self):
        """ "
        Checks that the function returns the managers in the lowest echelon
        """

        unique_managers = get_unique_unit_managers(self.unit_low, True)

        self.assertEqual(
            unique_managers,
            {
                self.soldier1_low.user_id,
                self.soldier2_low.user_id,
                self.soldier_all.user_id,
            },
        )

        unique_managers = get_unique_unit_managers(self.unit_low2, True)

        self.assertEqual(
            unique_managers,
            {
                self.soldier1_mid.user_id,
                self.soldier_all.user_id,
            },
        )
