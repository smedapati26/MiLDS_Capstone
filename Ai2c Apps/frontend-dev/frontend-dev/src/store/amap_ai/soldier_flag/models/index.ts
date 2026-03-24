export interface ISoldierFlagDTO {
  id: number;
  soldier_id: number;
  soldier_name: string | null;
  unit_uic: string | null;
  unit_name: string | null;
  flag_type: string | null;
  flag_info: string;
  mx_availability: string;
  start_date: string;
  end_date: string | null;
  flag_remarks: string | null;
  status: string;
  created_by_id: string;
  created_by_name: string;
  last_modified_id: string | null;
  last_modified_name: string | null;
}

export interface ISoldierUnitFlagDTO extends ISoldierFlagDTO {
  unit_soldier_count: number;
}

export interface ISoldierFlag {
  id: number;
  soldierId: number;
  soldierName: string | null;
  unitUic: string | null;
  unitName: string | null;
  flagType: string | null;
  flagInfo: string;
  mxAvailability: string;
  startDate: string;
  endDate: string | null;
  flagRemarks: string | null;
  status: string;
  createdById: string;
  createdByName: string;
  lastModifiedId: string | null;
  lastModifiedName: string | null;
}

export interface ISoldierUnitFlag extends ISoldierFlag {
  unitSoldierCount: number;
}

export interface ISoldierPersonnelFlagDTO {
  user_id: string;
  primary_mos__mos: string;
  rank: string;
  first_name: string;
  last_name: string;
  unit__short_name: string;
  flag_id: number;
}

export interface ISoldierPersonnelFlag {
  userId: string;
  primaryMos: string;
  rank: string;
  firstName: string;
  lastName: string;
  unitName: string;
  flagId: number;
}

export interface ICreateSoldierFlagOut {
  soldier_id?: string;
  unit_uic?: string;
  flag_type?: string;
  admin_flag_info?: string;
  unit_position_flag_info?: string;
  tasking_flag_info?: string;
  profile_flag_info?: string;
  mx_availability?: string;
  start_date?: string;
  end_date?: string;
  flag_remarks?: string;
}

export interface IUpdateSoldierFlagOut {
  flag_type?: string;
  admin_flag_info?: string;
  unit_position_flag_info?: string;
  tasking_flag_info?: string;
  profile_flag_info?: string;
  mx_availability?: string;
  start_date?: string;
  end_date?: string;
  flag_remarks?: string;
}

export const mapToISoldierFlag = (dto: ISoldierFlagDTO): ISoldierFlag => {
  return {
    id: dto.id,
    soldierId: dto.soldier_id,
    soldierName: dto.soldier_name,
    unitUic: dto.unit_uic,
    unitName: dto.unit_name,
    flagType: dto.flag_type,
    flagInfo: dto.flag_info,
    mxAvailability: dto.mx_availability,
    startDate: dto.start_date,
    endDate: dto.end_date,
    flagRemarks: dto.flag_remarks,
    status: dto.status,
    createdById: dto.created_by_id,
    createdByName: dto.created_by_name,
    lastModifiedId: dto.last_modified_id,
    lastModifiedName: dto.last_modified_name,
  };
};

export const mapToISoldierUnitFlag = (dto: ISoldierUnitFlagDTO): ISoldierUnitFlag => {
  return { ...mapToISoldierFlag(dto as ISoldierFlagDTO), unitSoldierCount: dto.unit_soldier_count };
};

export const mapToISoldierPersonnelFlag = (dto: ISoldierPersonnelFlagDTO): ISoldierPersonnelFlag => {
  return {
    userId: dto.user_id,
    primaryMos: dto.primary_mos__mos,
    rank: dto.rank,
    firstName: dto.first_name,
    lastName: dto.last_name,
    unitName: dto.unit__short_name,
    flagId: dto.flag_id,
  };
};
