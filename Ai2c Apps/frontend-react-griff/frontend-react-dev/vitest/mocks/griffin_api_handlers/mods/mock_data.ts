import { IAutoDsrLocationDto } from '@store/griffin_api/auto_dsr/models';
import {
  IModificationDto,
  IModificationEditOutDto,
  IModsDto,
  TrackingVariableOptions,
} from '@store/griffin_api/mods/models';

export const mockModsDto: IModsDto[] = [
  {
    serial_number: 'serial1',
    TEST1: ' ',
    TEST2: ' ',
    TEST3: ' ',
    TEST4: ' ',
    TEST5: ' ',
    TEST6: ' ',
    TEST7: ' ',
    TEST8: ' ',
    TEST9: '',
  },
  {
    serial_number: 'serial2',
    TEST1: ' ',
    TEST2: ' ',
    TEST3: ' ',
    TEST4: ' ',
    TEST5: ' ',
    TEST6: ' ',
    TEST7: ' ',
    TEST8: ' ',
    TEST9: '',
  },
  {
    serial_number: 'serial3',
    TEST1: 'TEST_ENTRY',
    TEST2: ' ',
    TEST3: ' ',
    TEST4: 'TEST_ENTRY',
    TEST5: 'TEST_ENTRY',
    TEST6: ' ',
    TEST7: ' ',
    TEST8: 'TEST_ENTRY',
    TEST9: 'TEST_ENTRY',
  },
  {
    serial_number: 'serial4',
    TEST1: 'TEST_ENTRY',
    TEST2: ' ',
    TEST3: ' ',
    TEST4: 'TEST_ENTRY',
    TEST5: 'TEST_ENTRY',
    TEST6: ' ',
    TEST7: ' ',
    TEST8: 'TEST_ENTRY',
    TEST9: 'TEST_ENTRY',
  },
];

export const mockMods2Dto: IModsDto[] = [
  {
    serial_number: 'serial T1 1',
    TEST1: 'TEST_ENTRY',
    TEST2: ' ',
    TEST3: ' ',
    TEST4: 'TEST_ENTRY',
    TEST5: 'TEST_ENTRY',
    TEST6: ' ',
    TEST7: ' ',
    TEST8: 'TEST_ENTRY',
    TEST9: 'TEST_ENTRY',
  },
  {
    serial_number: 'serial4',
    TEST1: 'TEST_ENTRY',
    TEST2: ' ',
    TEST3: ' ',
    TEST4: 'TEST_ENTRY',
    TEST5: 'TEST_ENTRY',
    TEST6: ' ',
    TEST7: ' ',
    TEST8: 'TEST_ENTRY',
    TEST9: 'TEST_ENTRY',
  },
];

export const mockModificationModels: string[] = ['model1', 'model2'];

export const mockModificationsDto: IModificationDto[] = [
  {
    id: 1,
    serial_number: 'serial1',
    model: 'model1',
    unit: 'unit1',
    tracking_variable: TrackingVariableOptions.STATUS.value,
    value: 'FMC',
    location: undefined,
    remarks: undefined,
    assigned_aircraft: undefined,
  },
  {
    id: 2,
    serial_number: 'serial2',
    model: 'model2',
    unit: 'unit1',
    tracking_variable: TrackingVariableOptions.STATUS.value,
    value: 'NMC',
    location: {
      id: 1,
      code: 'LOC',
      name: 'Location',
    } as IAutoDsrLocationDto,
    remarks: 'Comments',
    assigned_aircraft: 'aircraft1',
  },
  {
    id: 3,
    serial_number: 'serial3',
    model: 'model1',
    unit: 'unit1',
    tracking_variable: TrackingVariableOptions.OTHER.value,
    value: '',
    location: undefined,
    remarks: undefined,
    assigned_aircraft: undefined,
  },
  {
    id: 4,
    serial_number: 'serial4',
    model: 'model2',
    unit: 'unit1',
    tracking_variable: TrackingVariableOptions.INSTALL.value,
    value: 'INSTALLED',
    location: undefined,
    remarks: undefined,
    assigned_aircraft: undefined,
  },
];

export const mockModificationEditOutDto: IModificationEditOutDto = {
  edited_mods: [1, 2, 3],
  not_edited_mods: [0],
  detail: 'Could not edit mods 0. Mods 1, 2, 3 were successfully updated.',
};
