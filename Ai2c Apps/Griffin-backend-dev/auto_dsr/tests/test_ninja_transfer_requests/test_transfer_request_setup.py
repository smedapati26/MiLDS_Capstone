from django.test import TestCase, tag
from django.utils import timezone
from ninja.testing import TestClient

from auto_dsr.api.routes import auto_dsr_router
from auto_dsr.model_utils.transfer_object_types import TransferObjectTypes
from auto_dsr.model_utils.user_role_access_level import UserRoleAccessLevel
from auto_dsr.models import Unit
from utils.tests import create_test_units, create_test_user
from utils.tests.test_aircraft_creation import create_single_test_aircraft
from utils.tests.test_object_transfer_request_creation import create_single_test_object_transfer_request
from utils.tests.test_uac_creation import create_single_test_uac
from utils.tests.test_uav_creation import create_single_test_uav
from utils.tests.test_user_role_creation import create_user_role_in_all


@tag("transfer_request")
class TransferRequestTest(TestCase):

    def setUp(self):
        create_test_units()

        self.now = timezone.now()
        self.now_format = self.now.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
        self.unit_0AA = Unit.objects.get(uic="TEST000AA")
        self.unit_0A0 = Unit.objects.get(uic="TEST000A0")
        self.unit_1AA = Unit.objects.get(uic="TEST001AA")
        self.unit_1A0 = Unit.objects.get(uic="TEST001A0")
        self.unit_2AA = Unit.objects.get(uic="TEST002AA")

        self.aircraft = create_single_test_aircraft(current_unit=self.unit_0A0, serial="AIRCRAFT0A01")
        self.aircraft2 = create_single_test_aircraft(current_unit=self.unit_0AA, serial="AIRCRAFT0A02")

        self.uac = create_single_test_uac(current_unit=self.unit_1AA, serial_number="UAC0A01")
        self.uac2 = create_single_test_uac(current_unit=self.unit_1A0, serial_number="UAC0A02")

        self.uav = create_single_test_uav(current_unit=self.unit_2AA, serial_number="UAV0A01")
        self.uav2 = create_single_test_uav(current_unit=self.unit_2AA, serial_number="UAV0A02")

        self.admin_user = create_test_user(unit=self.unit_0AA, is_admin=True)

        create_user_role_in_all(self.admin_user, [self.unit_0AA, self.unit_0A0, self.unit_1A0])

        # Create User for authentication
        self.elevated_user = create_test_user(unit=self.unit_1A0, user_id="0000000001", is_admin=False)
        self.elevated_role = create_user_role_in_all(
            user=self.elevated_user,
            units=[self.unit_0A0, self.unit_1A0],
            user_access_level=UserRoleAccessLevel.WRITE,
        )
        self.random_user = create_test_user(unit=self.unit_1AA, user_id="0000000002", is_admin=False)
        self.random_user2 = create_test_user(unit=self.unit_0AA, user_id="0000000003", is_admin=False)
        self.elevated_client = TestClient(auto_dsr_router, headers={"Auth-User": self.elevated_user.user_id})
        self.admin_client = TestClient(auto_dsr_router, headers={"Auth-User": self.admin_user.user_id})
        self.client = TestClient(auto_dsr_router, headers={"Auth-User": self.random_user.user_id})

        self.aircraft_transfer_request = create_single_test_object_transfer_request(
            object=self.aircraft,
            object_type=TransferObjectTypes.AIR,
            originating_unit=self.aircraft.current_unit,
            destination_unit=self.unit_1A0,
            requesting_user=self.elevated_user,
            permanent=True,
            last_updated_datetime=self.now,
        )

        self.uac_transfer_request = create_single_test_object_transfer_request(
            object=self.uac,
            object_type=TransferObjectTypes.UAC,
            originating_unit=self.uac.current_unit,
            destination_unit=self.unit_1A0,
            requesting_user=self.admin_user,
            permanent=True,
            last_updated_datetime=self.now,
        )

        self.uav_transfer_request = create_single_test_object_transfer_request(
            object=self.uav,
            object_type=TransferObjectTypes.UAV,
            originating_unit=self.uav.current_unit,
            destination_unit=self.unit_1AA,
            requesting_user=self.random_user,
            permanent=True,
            last_updated_datetime=self.now,
        )

        self.request_data = {"approved": True}
