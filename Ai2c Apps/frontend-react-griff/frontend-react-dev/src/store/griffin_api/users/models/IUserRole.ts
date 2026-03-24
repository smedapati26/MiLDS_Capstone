import dayjs from 'dayjs';

import { IUnitBrief, IUnitBriefDto, mapToIUnitBrief } from '@store/griffin_api/auto_dsr/models';
import { IAppUser, IAppUserDto, mapToIAppUser } from '@store/griffin_api/users/models';

export enum UserRoleOptions {
  ADMIN = 'Admin',
  WRITE = 'Write',
  READ = 'Read',
}

/**
 * @typedef IUserRole
 * @prop { number } id - Identifier for user role object
 * @prop { IAppUser } user - User that holds the role
 * @prop { IUnitBrief } unit - Unit that the role is applicable to
 * @prop { UserRoleOptions } accessLevel - Permissions level for the role
 * @prop { string } grantedOn - Formatted date string for the date the role was granted
 */
export interface IUserRole {
  id: number;
  user: IAppUser;
  unit: IUnitBrief;
  accessLevel: UserRoleOptions;
  grantedOn: string;
}

/**
 * @typedef IUserRoleIn
 * @prop { number } id - Identifier for user role object
 * @prop { IAppUserDto } user - User that holds the role
 * @prop { IUnitBriefDto } unit - Unit that the role is applicable to
 * @prop { UserRoleOptions } access_level - Permissions level for the role
 * @prop { str } granted_on - Date the role was granted
 */
export interface IUserRoleIn {
  id: number;
  user: IAppUserDto;
  unit: IUnitBriefDto;
  access_level: UserRoleOptions;
  granted_on: string;
}

/**
 * @typedef IUserRoleOut
 * @prop { str } user_id - User that holds the role
 * @prop { str } unit_uic - Unit that the role is applicable to
 * @prop { UserRoleOptions } access_level - Permissions level for the role
 */
export interface IUserRoleOut {
  user_id: string;
  unit_uic: string;
  access_level: UserRoleOptions;
}

/**
 * Mapping function for IUserRoleIn to IUserRole
 * Transforms raw role data from API into transformed role data to be used by frontend
 */
export function mapToIUserRole(data: IUserRoleIn): IUserRole {
  return {
    id: data.id,
    user: mapToIAppUser(data.user),
    unit: mapToIUnitBrief(data.unit),
    accessLevel: data.access_level,
    grantedOn: dayjs(data.granted_on).format('MM/DD/YYYY'),
  };
}

/**
 * Mapping function for IUserRole to IUserRoleOut
 * Transforms frontend role data to format for backend api updates
 */
export function mapToIUserRoleOut(data: IUserRole): IUserRoleOut {
  return {
    user_id: data.user.userId,
    unit_uic: data.unit.uic,
    access_level: data.accessLevel,
  };
}
