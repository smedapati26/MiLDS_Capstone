/* eslint-disable sonarjs/use-type-alias */
import { Dayjs } from 'dayjs';

/* Represents MOS Code data transfer object */
export interface IMOSCodeDTO {
  id: number;
  mos: string;
  mos_description: string;
  amtp_mos: boolean;
  ictl_mos: boolean;
}

/* Represents a Unit data transfer object */
export interface IUnitDTO {
  uic: string;
  short_name: string;
  display_name: string;
  nick_name?: string;
  echelon: string;
  logo?: string;
  compo: string;
  state?: string;
  parent_unit?: string;
  start_date: string | Date;
  end_date?: string | Date;
  level: number;
  parent_uics: string[];
  child_uics: string[];
  subordinate_uics: string[];
  as_of_logical_time: number;
}

/* Represents Additional MOS Codes data transfer object */
export interface ISoldierAdditionalMOSDTO {
  id: number;
  soldier: ISoldierDTO;
  mos: IMOSCodeDTO;
}

/* Represents a soldier data transfer object */
export interface ISoldierDTO {
  user_id: string;
  rank?: string;
  first_name: string;
  last_name: string;
  primary_mos?: IMOSCodeDTO | string;
  primary_ml?: string;
  all_mos_and_ml: ISoldierAdditionalMOSDTO[];
  pv2_dor?: Date | string;
  pfc_dor?: Date | string;
  spc_dor?: Date | string;
  sgt_dor?: Date | string;
  ssg_dor?: Date | string;
  sfc_dor?: Date | string;
  unit_id: IUnitDTO | string;
  unit: string;
  is_admin: boolean;
  is_maintainer: boolean;
  dod_email?: string;
  receive_emails: boolean;
  birth_month: string;
}

/* Represents a Soldier interface from a DTO */
export interface ISoldier {
  userId: string;
  rank?: string;
  firstName: string;
  lastName: string;
  primaryMos?: string | IMOSCodeDTO | undefined;
  primaryMl?: string;
  allMosAndMl: ISoldierAdditionalMOSDTO[];
  pv2Dor?: string | Date;
  pfcDor?: string | Date;
  spcDor?: string | Date;
  sgtDor?: string | Date;
  ssgDor?: string | Date;
  sfcDor?: string | Date;
  unitId: IUnitDTO | string;
  unit: string;
  isAdmin: boolean;
  isMaintainer: boolean;
  dodEmail?: string;
  receiveEmails: boolean;
  birthMonth: string;
}

/* Represents a Soldier response payload interface */
export interface IUpdateSoldierOut {
  user_id: string;
  primary_mos?: string | null;
  additional_mos?: string[] | null;
  birth_month?: string | null;
  pv2_dor?: Dayjs | string | null;
  pfc_dor?: Dayjs | string | null;
  spc_dor?: Dayjs | string | null;
  sgt_dor?: Dayjs | string | null;
  ssg_dor?: Dayjs | string | null;
  sfc_dor?: Dayjs | string | null;
  is_maintainer?: boolean | null;
}
