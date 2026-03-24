import dayjs from 'dayjs';

import { IUnitBrief, IUnitBriefDto, mapToIUnitBrief } from '@store/griffin_api/auto_dsr/models';

import { IUserBrief, IUserBriefDto, mapToIUserBrief } from './IUserBrief';
import { UserRoleOptions } from './IUserRole';

/**
 * @typedef RoleRequestStatus
 * Used for approving or rejecting a role request, maps to API path
 */
export enum RoleRequestStatus {
  APPROVE = 'approve',
  DENY = 'deny',
}

/**
 * @typedef IAdminRoleRequest
 * @prop { number } id - ID for role request object
 * @prop { IUserBrief } user - User that is requesting a role change
 * @prop { IUnitBrief } unit - Unit that role is being requested for
 * @prop { UserRoleOptions } requestedRole - Role that user is requesting
 * @prop { UserRoleOptions } [currentRole] - Optional current role for user's current perms
 * @prop { string } dateRequested - Timestamp for when the request was issued
 */
export interface IAdminRoleRequest {
  id: number;
  user: IUserBrief;
  unit: IUnitBrief;
  requestedRole: UserRoleOptions;
  currentRole?: UserRoleOptions;
  dateRequested: string;
}

/**
 * @typedef IAdminRoleRequestIn
 * @prop { number } id - ID for role request object
 * @prop { IUserBriefDto } user - User that is requesting a role change
 * @prop { IUnitBriefDto } unit - Unit that role is being requested for
 * @prop { UserRoleOptions } access_level - Role that user is requesting
 * @prop { UserRoleOptions } [current_role] - Optional current role for user's current perms
 * @prop { string } date_created - Timestamp for when the request was issued
 */
export interface IAdminRoleRequestIn {
  id: number;
  user: IUserBriefDto;
  unit: IUnitBriefDto;
  access_level: UserRoleOptions;
  current_role?: UserRoleOptions;
  date_created: string;
}

/**
 * Mapping function for IAdminRoleRequestIn to IAdminRoleRequest
 * Transforms raw role request data from API into transformed role request data to be used by frontend
 */
export function mapToIAdminRoleRequest(data: IAdminRoleRequestIn): IAdminRoleRequest {
  return {
    id: data.id,
    user: mapToIUserBrief(data.user),
    unit: mapToIUnitBrief(data.unit),
    requestedRole: data.access_level,
    currentRole: data.current_role ?? undefined,
    dateRequested: dayjs(data.date_created).format('MM/DD/YYYY'),
  };
}
