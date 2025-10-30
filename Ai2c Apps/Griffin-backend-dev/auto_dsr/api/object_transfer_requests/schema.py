from datetime import date
from typing import List, Optional

from django.db.models import Q
from ninja import Field, FilterSchema, ModelSchema, Schema

from auto_dsr.models import ObjectTransferRequest


class TransferRequestListSchemaOut(ModelSchema):
    aircraft: Optional[str] = Field(None, alias="requested_aircraft.serial")
    uac: Optional[str] = Field(None, alias="requested_uac.serial_number")
    uav: Optional[str] = Field(None, alias="requested_uav.serial_number")
    originating_uic: str = Field(alias="originating_unit.uic")
    destination_uic: str = Field(alias="destination_unit.uic")
    user_id: str = Field(alias="requested_by_user.user_id")

    class Meta:
        model = ObjectTransferRequest
        fields = [
            "id",
            "requested_object_type",
            "originating_unit_approved",
            "destination_unit_approved",
            "permanent_transfer",
            "date_requested",
            "status",
            "last_updated_datetime",
        ]


class TransferRequestListFilterSchema(FilterSchema):
    user_id: Optional[str] = Field(None, q="requested_by_user__user_id")
    id: Optional[int] = Field(None, q="id")
    aircraft: Optional[str] = Field(None, q="requested_aircraft__serial")
    uac: Optional[str] = Field(None, q="requested_uac__serial_number")
    uav: Optional[str] = Field(None, q="requested_uav__serial_number")
    requested_object_type: Optional[str] = Field(None)
    originating_uic: Optional[str] = Field(None, q="originating_unit__uic")
    destination_uic: Optional[str] = Field(None, q="destination_unit__uic")
    uic: Optional[str] = None
    destination_unit_approved: Optional[bool] = Field(None)
    requested_by_user: Optional[str] = Field(None, q="requested_by_user__user_id")
    permanent_transfer: Optional[bool] = Field(None)
    date_requested: Optional[date] = Field(None)

    def filter_uic(self, value: str = None) -> Q:
        """
        If UIC is passed in, use it to search for originating UIC or destination UIC.
        """
        if value:
            return Q(originating_unit__uic=value) | Q(destination_unit__uic=value)
        return Q()


class TransferRequestIn(ModelSchema):
    originating_uic: str
    destination_uic: str
    requested_by_user: Optional[str] = None
    aircraft: Optional[str] = None
    uac: Optional[str] = None
    uav: Optional[str] = None

    class Meta:
        model = ObjectTransferRequest
        fields = [
            "status",
            "permanent_transfer",
            "requested_object_type",
        ]
        fields_optional = "__all__"


class TransferUpdateIn(ModelSchema):
    destination_uic: Optional[str] = None

    class Meta:
        model = ObjectTransferRequest
        fields = [
            "permanent_transfer",
        ]
        fields_optional = "__all__"


class TransferRequestAdjudicationIn(Schema):
    transfer_request_ids: List[int]
    approved: bool
