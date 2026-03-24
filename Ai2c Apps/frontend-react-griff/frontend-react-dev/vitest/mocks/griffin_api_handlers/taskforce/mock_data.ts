import { IUserEquipmentsDto } from '@store/griffin_api/taskforce/models/IUserEquipment';

export const mockUserEquipment: IUserEquipmentsDto = {
  aircraft: [
    {
      serial: '64-12345',
      model: 'AH-64D',
      current_unit__short_name: 'TEST_UNIT',
      status: 'FMC',
    },
    {
      serial: '64-67890',
      model: 'AH-64E',
      current_unit__short_name: 'TEST_UNIT',
      status: 'PMC',
    },
  ],
  uas: [
    {
      serial_number: 'UAV-001',
      model: 'RQ-7B',
      current_unit__short_name: 'TEST_UNIT',
      status: 'FMC',
    },
    {
      serial_number: 'UAC-502',
      model: 'GCS-3',
      current_unit__short_name: 'TEST_UNIT',
      status: 'FMC',
    },
    {
      serial_number: 'UAV-003',
      model: 'RQ-11B',
      current_unit__short_name: 'TEST_UNIT',
      status: 'NMC',
    },
  ],
  agse: [
    {
      equipment_number: 'AGSE-100',
      model: 'GPU',
      current_unit__short_name: 'TEST_UNIT',
      condition: 'FMC',
    },
    {
      equipment_number: 'AGSE-200',
      model: 'Hydro Cart',
      current_unit__short_name: 'TEST_UNIT',
      condition: 'PMC',
    },
  ],
};
