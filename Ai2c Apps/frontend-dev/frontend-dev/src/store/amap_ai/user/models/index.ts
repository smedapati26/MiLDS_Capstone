import { Echelon } from '@ai2c/pmx-mui';

import { IMOSCodeDTO, ISoldierAdditionalMOSDTO } from '@store/amap_ai/soldier';
import { IUnitBrief, IUnitBriefDto, mapToIUnitBrief } from '@store/amap_ai/units';

/**
 * Represents an application user object returned from the backend
 */
export interface IAppUserDto {
  new_user: boolean;
  user_id: string;
  rank: string;
  first_name: string;
  last_name: string;
  availability_status: string;
  is_admin: boolean;
  default_unit?: IUnitBriefDto;
  has_open_requests?: boolean;
  unit_roles?: { viewer: string[]; recorder: string[]; manager: string[] };
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
 * Represents an MOS and ML dynamic key/values.
 */
type MosAndMl = {
  [key: string]: string | undefined;
};

/**
 * Represents an application user with various personal and organizational details.
 */
export interface IAppUser {
  userId: string;
  rank?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  availabilityStatus: string;
  annualEvaluation?: string;
  evaluationStatus: string;
  arrivalAtUnit?: string;
  primaryMos?: string | IMOSCodeDTO | undefined;
  primaryMl?: string;
  additionalMos: ISoldierAdditionalMOSDTO[];
  allMosAndMl?: MosAndMl;
  pv2Dor?: string | Date;
  pfcDor?: string | Date;
  spcDor?: string | Date;
  sgtDor?: string | Date;
  ssgDor?: string | Date;
  sfcDor?: string | Date;
  unit: IUnitBrief | string;
  unitId?: string;
  unitName: string;
  isAdmin: boolean;
  isMaintainer: boolean;
  dodEmail?: string;
  receiveEmails: boolean;
  birthMonth: string;
  email?: string;
  uic?: string;
  newUser: boolean;
  hasOpenRequests?: boolean;
  unitRoles?: { viewer: string[]; recorder: string[]; manager: string[] };
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
  fullName: dto.first_name + ' ' + dto.last_name,
  rank: dto.rank,
  isAdmin: dto.is_admin,
  initials: dto.first_name?.charAt(0) + dto.last_name?.charAt(0),
  unit: dto.default_unit
    ? mapToIUnitBrief(dto.default_unit)
    : {
        uic: '',
        shortName: '',
        displayName: '',
        echelon: Echelon.UNKNOWN,
        component: '',
        level: 0,
      },
  unitName: dto.default_unit?.display_name as string,
  evaluationStatus: 'Not in Window',
  availabilityStatus: dto.availability_status,
  uic: dto.default_unit?.uic,
  additionalMos: [],
  allMosAndMl: {},
  isMaintainer: false,
  receiveEmails: false,
  birthMonth: '',
  newUser: dto.new_user,
  hasOpenRequests: dto.has_open_requests,
  unitRoles: dto.unit_roles,
});
