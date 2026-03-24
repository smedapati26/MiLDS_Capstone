import { Echelon } from '@ai2c/pmx-mui';

import { IAppUser, IAppUserDto } from '@store/amap_ai/user/models';

export const mockAppUserDto: IAppUserDto = {
  user_id: '0123456789',
  first_name: 'Testy',
  last_name: 'McGee',
  rank: 'CTR',
  is_admin: true,
  new_user: false,
  availability_status: 'Available',
  default_unit: {
    uic: 'WCLMAA',
    short_name: '3-25 GSAB',
    display_name: '3rd Battalion, 25th Aviation Regiment',
    echelon: Echelon.BATTALION,
    level: 3,
    component: '1',
    nick_name: '',
    state: '',
    parent_unit: '',
  },
};

export const mockAppUser: IAppUser = {
  userId: '0123456789',
  firstName: 'Testy',
  lastName: 'McGee',
  fullName: 'Testy McGee',
  initials: 'TM',
  email: 'testy.mcgee.ctr@army.mil',
  rank: 'CTR',
  isAdmin: true,
  uic: 'WCLMAA',
  newUser: false,
  unit: {
    uic: 'WCLMAA',
    shortName: '3-25 GSAB',
    displayName: '3rd Battalion, 25th Aviation Regiment',
    echelon: Echelon.BATTALION,
    level: 3,
    component: '1',
  },
  isMaintainer: true,
  receiveEmails: false,
  birthMonth: 'n/a',
  availabilityStatus: '',
  additionalMos: [],
  evaluationStatus: '',
  unitName: '',
};
