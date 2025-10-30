from typing import List, Optional

from ninja import Schema


class RequestCountsOut(Schema):
    permission_request_count: int
    transfer_request_count: int


class RequestCountsOut(Schema):
    permission_request_count: int
    transfer_request_count: int


class AdjudicateRequestsIn(Schema):
    request_ids: List[int]
    approved: bool
    adjudicator_dod_id: str


class AdjudicateRequestsOut(Schema):
    processed_count: int
    success: bool
    message: str


class RequestCountsOut(Schema):
    permission_request_count: int
    transfer_request_count: int


class PermissionRequestOut(Schema):
    request_id: int
    name: str
    rank: str
    dod_id: str
    unit: str
    last_active: str
    current_role: Optional[str]
    requested_role: str


class ManagedUnitsWithPermissionsOut(Schema):
    unit_uic: str
    unit_name: str
    requests: list[PermissionRequestOut]


class TransferRequestPocOut(Schema):
    name: str
    email: Optional[str]


class ReceivedTransferRequestOut(Schema):
    request_id: int
    name: str
    rank: str
    dod_id: str
    current_unit: str
    current_unit_uic: str
    requesting_unit: str
    requesting_unit_uic: str
    requested_by: str


class SentTransferRequestOut(Schema):
    name: str
    rank: str
    dod_id: str
    current_unit: str
    gaining_unit: str
    pocs: List[TransferRequestPocOut]


class ManagedUnitsWithTransfersOut(Schema):
    received_requests: List[ReceivedTransferRequestOut]
    sent_requests: List[SentTransferRequestOut]


class SoldierInfo(Schema):
    user_id: str
    rank: str
    first_name: str
    last_name: str
    is_maintainer: bool
    is_amtp_maintainer: bool


class UnitWithSoldiers(Schema):
    id: str
    unit_name: str
    soldiers: List[SoldierInfo]


class CreateTransferRequestSchema(Schema):
    soldier_id: str
    gaining_uic: str


class CreatePermissionRequestSchema(Schema):
    user_id: str
    uic: str
    access_level: str
