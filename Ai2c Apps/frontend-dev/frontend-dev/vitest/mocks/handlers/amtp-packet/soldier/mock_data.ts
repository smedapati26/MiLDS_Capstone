import { IMOSCodeDTO, ISoldierAdditionalMOSDTO, ISoldierDTO, IUnitDTO } from '@store/amap_ai/soldier/models';

export const mockMOSCodeData: IMOSCodeDTO = {
  id: 1,
  mos: '11B',
  mos_description: 'Infantryman',
  amtp_mos: true,
  ictl_mos: false,
};

export const mockUnitData: IUnitDTO = {
  uic: 'A123',
  short_name: 'Alpha Co',
  display_name: 'Alpha Company',
  nick_name: 'Alpha',
  echelon: 'Company',
  logo: 'alpha_logo.png',
  compo: 'Active',
  state: 'CA',
  start_date: '2020-01-01T00:00:00.000Z', // Update date to ISO string
  end_date: undefined,
  level: 3,
  parent_uics: [],
  child_uics: [],
  subordinate_uics: [],
  as_of_logical_time: Date.now(),
};

export const mockAdditionalMOSData: ISoldierAdditionalMOSDTO = {
  id: 1,
  soldier: {
    user_id: '123',
    rank: 'SGT',
    first_name: 'John',
    last_name: 'Doe',
    primary_mos: mockMOSCodeData,
    all_mos_and_ml: [],
    pv2_dor: '2018-01-01T00:00:00.000Z', // Update date to ISO string
    pfc_dor: '2019-01-01T00:00:00.000Z', // Update date to ISO string
    spc_dor: '2020-01-01T00:00:00.000Z', // Update date to ISO string
    sgt_dor: '2021-01-01T00:00:00.000Z', // Update date to ISO string
    ssg_dor: undefined,
    sfc_dor: undefined,
    unit_id: mockUnitData,
    is_admin: true,
    is_maintainer: false,
    dod_email: 'john.doe@example.com',
    receive_emails: true,
    birth_month: 'January',
    unit: 'TSTUNIT',
  },
  mos: mockMOSCodeData,
};

export const mockSoldierData: ISoldierDTO = {
  user_id: '123',
  rank: 'SGT',
  first_name: 'John',
  last_name: 'Doe',
  primary_mos: mockMOSCodeData,
  all_mos_and_ml: [mockAdditionalMOSData],
  pv2_dor: '2018-01-01T00:00:00.000Z', // Update date to ISO string
  pfc_dor: '2019-01-01T00:00:00.000Z', // Update date to ISO string
  spc_dor: '2020-01-01T00:00:00.000Z', // Update date to ISO string
  sgt_dor: '2021-01-01T00:00:00.000Z', // Update date to ISO string
  ssg_dor: undefined,
  sfc_dor: undefined,
  unit_id: mockUnitData,
  is_admin: true,
  is_maintainer: false,
  dod_email: 'john.doe@example.com',
  receive_emails: true,
  birth_month: 'January',
  unit: 'TSTUNIT',
};

export const mockUnitSoldiersData: Record<string, Record<string, ISoldierDTO[]>> = {
  A123: {
    all_soldiers: [mockSoldierData],
    all_maintainers: [mockSoldierData],
    amtp_maintainers: [mockSoldierData],
    amtp_maintainers_short: [mockSoldierData],
  },
  B456: {
    all_soldiers: [
      {
        user_id: '456',
        rank: 'PFC',
        first_name: 'Jane',
        last_name: 'Smith',
        primary_mos: mockMOSCodeData,
        all_mos_and_ml: [],
        pv2_dor: '2019-01-01T00:00:00.000Z', // Update date to ISO string
        pfc_dor: '2020-01-01T00:00:00.000Z', // Update date to ISO string
        spc_dor: undefined,
        sgt_dor: undefined,
        ssg_dor: undefined,
        sfc_dor: undefined,
        unit_id: mockUnitData,
        is_admin: false,
        is_maintainer: true,
        dod_email: 'jane.smith@example.com',
        receive_emails: false,
        birth_month: 'February',
        unit: 'TSTUNIT',
      },
    ],
    all_maintainers: [],
    amtp_maintainers: [],
    amtp_maintainers_short: [],
    additionalMos: [],
  },
};

export const mockCtlsData = {
  A123: {
    soldier_ictl: [
      {
        MOS: '15H',
        document_link: 'https://example.com/task-doc',
        frequency: 'Annually',
        ictl__ictl_title: 'Aircraft Pneudraulics Repairer',
        ictl__unit: 'Unit A',
        ictl__unit__short_name: 'UA',
        ictl_proponent: 'USAACE',
        last_evaluated: '2025-03-20',
        last_trained: '2025-03-15',
        next_due: '2026-03-01',
        skill_level: 'SL1',
        subject_area: '07-Pneudraulic',
        task_number: '552-000-1002',
        task_title: 'Operate the APGU',
      },
    ],
    soldier_uctl: [],
  },
};

export const mockMOSData = [{ mos: '15H' }, { mos: '15E' }, { mos: '15F' }];
