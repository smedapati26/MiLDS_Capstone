from django.db import IntegrityError
from rest_framework import serializers

from .models import TaskForce, Unit
from .utils import generate_tf_uic


class UnitSerializer(serializers.ModelSerializer):
    """
    UnitSerializer handles the serialization and deserialization of Unit instances.
    It has a special handling mechanism for 'uic':
    - If 'uic' is provided by the user and is valid, it will be used.
    - If 'uic' is not provided or left blank, it will auto-generate one using the `generate_uic()` function.
    Additionally, this serializer ensures:
    - That the provided 'uic' is unique.
    - That 'short_name' and 'display_name' fields do not conflict with existing names in the database.
    """

    uic = serializers.CharField(max_length=9, required=False, allow_blank=True)
    parent_uic = serializers.CharField(max_length=9, required=False, allow_blank=True)
    readiness_uic = serializers.CharField(max_length=9, required=False, allow_blank=True)
    start_date = serializers.DateField(write_only=True, required=True)
    end_date = serializers.DateField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Unit
        fields = [
            "uic",
            "display_name",
            "short_name",
            "nick_name",
            "echelon",
            "parent_uic",
            "readiness_uic",
            "start_date",
            "end_date",
        ]

    def validate(self, data):
        """
        Validate the data for creating a new Unit and associated TaskForce entry.

        - UIC must be globally unique.
        - Short_name and display_name cannot conflict with any other name.
        """
        uic = data.get("uic", None)
        short_name = data.get("short_name")
        display_name = data.get("display_name")

        # Generate a new uic or ensure the given one does not already exist
        if not uic:
            data["uic"] = generate_tf_uic()
        elif Unit.objects.filter(uic=uic).exists():
            raise serializers.ValidationError({"uic": "UIC already exists."})

        # Checking for short_name and display_name conflicts
        if Unit.objects.filter(short_name=short_name).exists() or Unit.objects.filter(display_name=short_name).exists():
            raise serializers.ValidationError({"short_name": "Short name cannot conflict with any other name."})

        if (
            Unit.objects.filter(short_name=display_name).exists()
            or Unit.objects.filter(display_name=display_name).exists()
        ):
            raise serializers.ValidationError({"display_name": "Display name cannot conflict with any other name."})

        return data

    def create(self, validated_data):
        """
        Create a new Unit and associated TaskForce entry based on validated data.
        """
        parent_uic = validated_data.get("parent_uic", None)
        if parent_uic:
            validated_data["parent_uic"] = Unit.objects.get(uic=parent_uic)

        start_date = validated_data.pop("start_date")
        end_date = validated_data.pop("end_date", None)

        try:
            # Create Unit
            unit = Unit.objects.create(**validated_data)
            unit.set_all_unit_lists()
            for uic in unit.parent_uics:
                Unit.objects.get(uic=uic).set_all_unit_lists()

            # Create associated TaskForce
            TaskForce.objects.create(uic=unit, start_date=start_date, end_date=end_date)

        except IntegrityError:
            # Handle race condition if two UICs are generated at the same time.
            # You can retry the creation or return an error to the client.
            raise serializers.ValidationError({"uic": "UIC conflict. Please try again."})

        return unit


class TaskForceSerializer(serializers.ModelSerializer):
    """
    TaskForceSerializer handles the serialization and deserialization of Task Force instances.
    """

    class Meta:
        model = TaskForce
        fields = ["uic", "readiness_uic", "start_date", "end_date"]


class TaskForceUICSerializer(serializers.ModelSerializer):
    """
    Serializer for listing Task Force UICs.
    This serializer only exposes the UIC field from the TaskForce model, making it suitable for endpoints where only the UICs of Task Forces are required.
    """

    class Meta:
        model = TaskForce
        fields = ["uic"]
