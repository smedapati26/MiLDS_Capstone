import dayjs from 'dayjs';

import { IUnitBrief, IUnitBriefDto, mapToIUnitBrief } from '@store/griffin_api/auto_dsr/models';

import { IUserBrief, IUserBriefDto, mapToIUserBrief } from './IUserBrief';
import { UserRoleOptions } from './IUserRole';

/**
 * @typedef IRoleRequest
 * @prop { string } userId
 * @prop { IUnitBrief } unit
 * @prop { UserRoleOptions } requestedRole
 * @prop {string} dateRequested
 * @prop { IUserBrief[] } approvers
 */
export interface IRoleRequest {
  id: number;
  userId: string;
  unit: IUnitBrief;
  requestedRole: UserRoleOptions;
  dateRequested: string;
  approvers: IUserBrief[];
}

/**
 * @typedef IRoleRequestIn
 * @prop { string } user_id
 * @prop { IUnitBriefDto } unit
 * @prop { UserRoleOptions } role_requested
 * @prop {string} request_datetime
 * @prop { IUserBriefDto[] } approvers
 */
export interface IRoleRequestIn {
  id: number;
  user_id: string;
  unit: IUnitBriefDto;
  access_level: UserRoleOptions;
  date_created: string;
  approvers: IUserBriefDto[];
}

/**
 * @typedef IRoleRequestOut
 * @prop { string } user_id
 * @prop { string } uic
 * @prop { UserRoleOptions } access_level
 */
export interface IRoleRequestOut {
  user_id: string;
  uic: string;
  access_level: UserRoleOptions;
}

/**
 * Mapping function for IRoleRequestIn to IRoleRequest
 * Transforms raw role request data from API into transformed role request data to be used by frontend
 * Sorts approvers by lowest echelon first
 */
export function mapRoleRequest(data: IRoleRequestIn): IRoleRequest {
  return {
    id: data.id,
    userId: data.user_id,
    unit: mapToIUnitBrief(data.unit),
    requestedRole: data.access_level,
    dateRequested: dayjs(data.date_created).format('MM/DD/YYYY'),
    approvers: data.approvers.map(mapToIUserBrief),
  };
}
