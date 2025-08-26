from personnel.models import Soldier, Unit, SoldierTransferRequest


def create_test_transfer_request(
    requester: Soldier, gaining_unit: Unit, soldier: Soldier, id: int = 1
) -> SoldierTransferRequest:
    transfer_request = SoldierTransferRequest.objects.create(
        id=id, requester=requester, gaining_unit=gaining_unit, soldier=soldier
    )

    return transfer_request
