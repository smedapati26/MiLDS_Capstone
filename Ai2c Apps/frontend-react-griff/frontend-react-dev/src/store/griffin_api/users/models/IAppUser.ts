import dayjs from 'dayjs';

import { emptyUnit, IUnitBrief, IUnitBriefDto, mapToIUnitBrief } from '@store/griffin_api/auto_dsr/models/IUnitBrief';

/**
 * Represents an application user object returned from the backend
 */
export interface IAppUserDto {
  new_user: boolean;
  user_id: string;
  rank: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  default_unit?: IUnitBriefDto;
  global_unit?: IUnitBriefDto;
  last_activity?: string;
  job_description?: string;
}

/**
 * Represents an update to be made to an application user being sent to the backend
 */
export interface IUpdatedAppUserDto {
  user_id: string;
  rank: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  unit_uic: string;
  global_unit_uic?: string;
  job_description?: string;
}

/**
 * The object used to create a user in the app backend
 */
export interface ICreateAppUserOut {
  user_id: string;
  rank: string;
  first_name: string;
  last_name: string;
  unit_uic: string;
}

/**
 * Represents an application user with various personal and organizational details.
 */
export interface IAppUser {
  userId: string;
  firstName: string;
  lastName: string;
  rank: string;
  isAdmin: boolean;
  fullname?: string;
  rankAndName?: string;
  email?: string;
  unit: IUnitBrief;
  globalUnit?: IUnitBrief;
  newUser: boolean;
  lastActive?: string;
  jobDescription?: string;
  jwt?: string;
}

/**
 * Maps an IAppUserDto object to an IAppUser object.
 *
 * @param dto - The data transfer object containing the properties to map.
 * @returns An IAppUser object with the mapped properties.
 */
export const mapToIAppUser = (dto: IAppUserDto): IAppUser => ({
  userId: dto.user_id,
  firstName: dto.first_name,
  lastName: dto.last_name,
  rank: dto.rank,
  isAdmin: dto.is_admin,
  fullname: `${dto.first_name} ${dto.last_name}`,
  rankAndName: `${dto.rank} ${dto.first_name} ${dto.last_name}`,
  unit: mapToIUnitBrief(dto.default_unit ?? emptyUnit),
  globalUnit: dto.global_unit ? mapToIUnitBrief(dto.global_unit) : mapToIUnitBrief(dto.default_unit ?? emptyUnit),
  newUser: dto.new_user,
  lastActive: dto.last_activity ? dayjs(dto.last_activity).format('MM/DD/YYYY') : undefined,
  jobDescription: dto.job_description ?? '',
});

/**
 * Maps an IAppUser object to an IUpdatedAppUserDto object.
 *
 * @param data - The data object containing the properties to map.
 * @returns An IUpdatedAppUserDto object with the mapped properties.
 */
export const mapToIUpdatedAppUserDto = (data: IAppUser): IUpdatedAppUserDto => ({
  user_id: data.userId,
  rank: data.rank,
  first_name: data.firstName,
  last_name: data.lastName,
  is_admin: data.isAdmin,
  unit_uic: data.unit.uic,
  global_unit_uic: data.globalUnit?.uic,
  job_description: data.jobDescription,
});
