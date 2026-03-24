import { IInspectionTypeDto } from '@store/griffin_api/inspections/models';

export const mockInspectionTypes: IInspectionTypeDto[] = [
  {
    id: 1,
    code: 'INS001',
    model: 'CH-47F',
    common_name: 'Annual Inspection',
    tracking_type: 'calendar',
    is_phase: false,
  },
  {
    id: 2,
    code: 'PHASE001',
    model: 'CH-47F',
    common_name: 'Phase Check',
    tracking_type: 'hours',
    is_phase: true,
  },
  {
    id: 3,
    code: 'INS002',
    model: 'UH-60A',
    common_name: 'Monthly Inspection',
    tracking_type: 'calendar',
    is_phase: false,
  },
];
