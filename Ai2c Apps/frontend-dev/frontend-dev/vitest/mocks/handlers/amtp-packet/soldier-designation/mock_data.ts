import { ISoldierDesignationDTO } from '@store/amap_ai/designation/models';

export const mockSoldierDesignations: ISoldierDesignationDTO[] = [
  {
    designation: 'Test Designation',
    designation_removed: false,
    end_date: '12/31/2025',
    start_date: '01/01/2025',
    id: 1,
    last_modified_by: 'CPT Testy MeGee',
    unit: 'Test Unit',
  },
  {
    designation: 'Test Designation 2',
    designation_removed: false,
    end_date: '12/31/2025',
    start_date: '01/01/2025',
    id: 2,
    last_modified_by: 'CPT Testy MeGee',
    unit: 'Test Unit 2',
  },
];
