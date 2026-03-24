import { Echelon } from '@ai2c/pmx-mui';

import { SubordinateSchemaType } from '@features/task-forces/components/create-stepper/step 2/schema';
import { getSerialNumbers } from '@features/task-forces/utils/getSerialNumbers';

import {
  IAutoDsrLocation,
  IAutoDsrLocationDto,
  IUnitBasicSUnits,
  mapToIAutoDsrLocation,
} from '@store/griffin_api/auto_dsr/models';
import { IUserBrief, IUserBriefDto, mapToIUserBrief } from '@store/griffin_api/users/models/IUserBrief';

import { IUserEquipments } from './IUserEquipment';

export const TOP_LEVEL = 'top-level';

/* Base Taskforce Interface */
export interface ITaskforceBaseDto {
  tf_name: string;
  echelon: string;
  short_name: string;
  nick_name?: string;
  owner_user_id: string;
  aircraft: Array<string>;
  uas: Array<string>;
  agse: Array<string>;
  subordinates: Array<ITaskforceBaseDto>;
}

/**
 * ITaskforceDto
 * Represents Taskforce Data Transfer Object
 */
export interface ITaskforceDto extends ITaskforceBaseDto {
  slogan?: string;
  location_id: number;
  tf_start_date: string | Date;
  tf_end_date: string | Date;
}

export interface ITaskforceCreateOut {
  overall_success: boolean;
  message: string;
  total_attempted: number;
  total_created: number;
  total_failed: number;
  root_uic: string;
  results: [
    {
      tf_name: string;
      uic: string;
      success: boolean;
      error: string;
      parent_uic: string;
      level: number;
    },
  ];
}

/**
 * ITaskForceUnitDto
 * Represents Taskforce Unit Data Transfer Object
 */
export interface ITaskForceUnitDto extends IUnitBasicSUnits {
  slogan?: string;
  logo?: string;
}

/**
 * ITaskForceSimpleDto
 * Represents Simple Taskforce Data Transfer Object
 */
export interface ITaskForceSimpleDto {
  unit: ITaskForceUnitDto;
  location?: IAutoDsrLocationDto;
  owner?: IUserBriefDto;
  start_date: string | Date;
  end_date: string | Date;
}

/**
 * ITaskForceDetailsDto
 * Represents Detailed Taskforce Data Transfer Object
 */
export interface ITaskForceDetailsDto extends ITaskForceSimpleDto, IUserEquipments {
  subordinates: Array<ITaskForceDetailsDto>;
}

/**
 * ITaskForceUnit
 * Represents Taskforce Unit Data
 */
export interface ITaskForceUnit {
  uic: string;
  shortName: string;
  displayName: string;
  nickName?: string;
  echelon: string | Echelon;
  level: number;
  parentUic: string;
  slogan?: string;
  logo?: string;
}

/**
 * ITaskForceSimple
 * Represents Simple Taskforce Data
 */
export interface ITaskForceSimple {
  unit: ITaskForceUnit;
  location?: IAutoDsrLocation;
  owner?: IUserBrief;
  startDate: string;
  endDate: string;
}

/**
 * ITaskForceDetails
 * Represents Detailed Taskforce Data
 */
export interface ITaskForceDetails extends ITaskForceSimple, IUserEquipments {
  subordinates: Array<ITaskForceDetails>;
}

// Maps subordinates to base dto
export const mapToISubordinateDto = (subordinate: SubordinateSchemaType): ITaskforceBaseDto => {
  return {
    tf_name: subordinate.name,
    echelon: subordinate.echelon,
    short_name: subordinate.shortname,
    owner_user_id: subordinate.ownerId,
    nick_name: subordinate.nickname,
    aircraft: getSerialNumbers(subordinate.aircraft),
    uas: getSerialNumbers(subordinate.uas),
    agse: getSerialNumbers(subordinate.agse),
    subordinates: [],
  };
};

// Maps ITaskForceDetails Subordinates to SubordinateSchemaType
export const mapToSubordinateSchemaType = (tf: ITaskForceDetails): SubordinateSchemaType => {
  return {
    id: tf.unit.uic,
    uuid: tf.unit.uic,
    name: tf.unit.displayName,
    echelon: tf.unit.echelon,
    shortname: tf.unit.shortName,
    ownerId: tf.owner?.userId || '',
    nickname: tf.unit.nickName,
    aircraft: tf.aircraft,
    uas: tf.uas,
    agse: tf.agse,
    parentId: tf.unit.level == 1 ? TOP_LEVEL : tf.unit.parentUic,
    level: tf.unit.level,
  };
};

// Helper function to map ITaskForceUnit
const mapToITaskForceUnit = (dto: ITaskForceUnitDto): ITaskForceUnit => {
  return {
    uic: dto.uic,
    shortName: dto.short_name,
    displayName: dto.display_name,
    nickName: dto.nick_name ?? undefined,
    echelon: dto.echelon,
    level: dto.level,
    parentUic: dto.parent_uic,
    slogan: dto.slogan,
    logo: dto.logo,
  };
};

// Maps ITaskForceSimpleDTO to ITaskForceSimple
export const mapToITaskForceSimple = (dto: ITaskForceSimpleDto): ITaskForceSimple => {
  return {
    unit: mapToITaskForceUnit(dto.unit),
    owner: dto.owner ? mapToIUserBrief(dto.owner) : undefined,
    location: dto.location ? mapToIAutoDsrLocation(dto.location) : undefined,
    startDate: dto.start_date.toString(),
    endDate: dto.end_date.toString(),
  };
};

// Maps ITaskForceDetailsDTO to ITaskForceDetails
export const mapToITaskForceDetails = (dto: ITaskForceDetailsDto): ITaskForceDetails => {
  return {
    unit: mapToITaskForceUnit(dto.unit),
    owner: dto.owner ? mapToIUserBrief(dto.owner) : undefined,
    location: dto.location ? mapToIAutoDsrLocation(dto.location) : undefined,
    startDate: dto.start_date.toString(),
    endDate: dto.end_date.toString(),
    aircraft: dto.aircraft,
    uas: dto.uas,
    agse: dto.agse,
    subordinates: dto.subordinates.length > 0 ? dto.subordinates.map(mapToITaskForceDetails) : [],
  };
};
