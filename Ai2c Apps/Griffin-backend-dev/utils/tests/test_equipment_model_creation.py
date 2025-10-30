from aircraft.models import EquipmentModel


def create_single_equipment_model(name: str) -> EquipmentModel:
    """
    Creates a single Equipment Model object.

    @param name: (str) The name value for the new Equipment Model (must be unique)

    @returns (EquipmentModel)
            The newly created EquipmentModel object.
    """
    new_equipment_model = EquipmentModel.objects.create(name=name)

    return new_equipment_model
