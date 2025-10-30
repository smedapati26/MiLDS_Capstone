from collections import defaultdict

from django.test import TestCase, tag

from personnel.model_utils import UserRoleAccessLevel
from personnel.models import SoldierTransferRequest
from personnel.utils.transfers_to_managers import get_manager_details, map_units_to_manager_details
from units.models import Unit
from utils.tests import create_test_soldier, create_test_transfer_request, create_testing_unit, create_user_role_in_all


@tag("personnel", "shiny_soldier_transfer_requests")
class SoldierTransferRequestTests(TestCase):
    def setUp(self):
        # Create Units for testing
        self.current_owning_bn = create_testing_unit(uic="OWNING_BN", echelon=Unit.Echelon.BATTALION)

        # Current unit with a parent battalion
        self.current_unit = create_testing_unit(
            uic="OWNING",
            short_name="A CO, 1-100 TEST",
            display_name="Alpha Company, 1st Battalion, 100th Test Aviation Regiment",
            echelon=Unit.Echelon.COMPANY,
            parent_unit=self.current_owning_bn,
        )
        # unit with ano parent
        self.unit_2 = create_testing_unit(
            uic="OWNING2",
            short_name="E CO, 4-100 TEST",
            display_name="Echo Company, 4th Battalion, 100th Test Aviation Regiment",
            echelon=Unit.Echelon.COMPANY,
        )

        # Requesting units for transfer requests
        self.requesting_unit_1 = create_testing_unit(
            uic="REQUEST1",
            short_name="B CO, 2-100 TEST",
            display_name="Bravo Company, 2nd Battalion, 100th Test Aviation Regiment",
            echelon=Unit.Echelon.COMPANY,
        )
        self.requesting_unit_2 = create_testing_unit(
            uic="REQUEST2",
            short_name="C CO, 2-100 TEST",
            display_name="Charlie Company, 2nd Battalion, 100th Test Aviation Regiment",
            echelon=Unit.Echelon.COMPANY,
        )

        # Set unit lists for testing hierarchy relationships
        self.current_owning_bn.set_all_unit_lists()
        self.current_unit.set_all_unit_lists()

        # Create Soldiers
        self.test_soldier = create_test_soldier(unit=self.current_unit)

        # Create a second soldier for additional transfer requests
        self.test_second_soldier = create_test_soldier(
            unit=self.requesting_unit_1, user_id="0000000000", last_name="Requested Jr."
        )

        # Create a third soldier for additional transfer requests
        self.test_third_soldier = create_test_soldier(unit=self.unit_2, user_id="5555555555", last_name="Requested III")

        # Create requesters for initiating transfer requests
        self.test_requester = create_test_soldier(
            unit=self.requesting_unit_1, user_id="1111111111", last_name="Requester"
        )
        self.test_second_requester = create_test_soldier(
            unit=self.requesting_unit_2, user_id="2222222222", last_name="Requester II"
        )

        # Create battalion admin soldier with admin privileges
        self.test_owning_bn_admin = create_test_soldier(
            unit=self.current_unit, user_id="3333333333", last_name="BN Admin"
        )

        # Create A-MAP Admin with higher admin privileges for test cases
        self.test_amap_admin = create_test_soldier(
            unit=self.current_owning_bn, user_id="4444444444", last_name="A-MAP Admin", is_admin=True
        )

        # Create User Roles for battalion admin with access to multiple units
        self.test_bn_admin_role = create_user_role_in_all(
            self.test_owning_bn_admin,
            units=[self.current_owning_bn, self.requesting_unit_2, self.unit_2],
            user_access_level=UserRoleAccessLevel.MANAGER,
        )

        self.test_unit_2_role = create_user_role_in_all(
            self.test_second_soldier,
            units=[self.unit_2],
            user_access_level=UserRoleAccessLevel.MANAGER,
        )

        # Create initial transfer request by a requester for a soldier
        self.test_request = create_test_transfer_request(
            requester=self.test_requester,
            gaining_unit=self.requesting_unit_1,
            soldier=self.test_soldier,
        )
        # Create a second transfer request for a different soldier
        self.test_second_request = create_test_transfer_request(
            id=3,
            requester=self.test_second_requester,
            gaining_unit=self.requesting_unit_2,
            soldier=self.test_second_soldier,
        )

        # Create a third transfer request for a different soldier
        self.test_third_request = create_test_transfer_request(
            id=4,
            requester=self.test_requester,
            gaining_unit=self.requesting_unit_1,
            soldier=self.test_third_soldier,
        )

    def test_map_units_to_admin_details(self):
        """Test mapping of units to their admin details."""
        requests = SoldierTransferRequest.objects.all()
        unit_admins_mapping = map_units_to_manager_details(requests)
        # One admin in unit
        self.assertEqual(1, len(unit_admins_mapping[self.test_soldier.unit.uic]))
        self.assertEqual(
            self.test_owning_bn_admin.name_and_rank(), unit_admins_mapping[self.test_soldier.unit.uic][0]["name"]
        )
        self.assertEqual("No E-mail on File", unit_admins_mapping[self.test_soldier.unit.uic][0]["dod_email"])
        self.assertEqual(
            self.test_owning_bn_admin.unit.short_name, unit_admins_mapping[self.test_soldier.unit.uic][0]["unit"]
        )

        # No admin in unit
        self.assertEqual([], unit_admins_mapping[self.test_second_requester.unit.uic])

        # Multiple admins in unit
        self.assertEqual(2, len(unit_admins_mapping[self.test_third_soldier.unit.uic]))

    def test_get_admin_details(self):
        """Test retrieving admin details."""
        admin_ids = [self.test_owning_bn_admin.user_id]
        admin_details = get_manager_details(admin_ids)

        self.assertEqual(len(admin_details), len(admin_ids))
        self.assertEqual(self.test_owning_bn_admin.name_and_rank(), admin_details[0]["name"])
