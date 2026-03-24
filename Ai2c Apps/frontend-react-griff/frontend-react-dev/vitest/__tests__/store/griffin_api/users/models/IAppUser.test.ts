import { describe, expect, it } from 'vitest';

import { Echelon } from '@ai2c/pmx-mui/models';

import { IUnitBrief, IUnitBriefDto } from '@store/griffin_api/auto_dsr/models';
import { IAppUser, IAppUserDto, ICreateAppUserOut, mapToIAppUser } from '@store/griffin_api/users/models/IAppUser';

describe('IAppUser Models and Mapping', () => {
  // Test data setup
  const mockUnitDto: IUnitBriefDto = {
    uic: 'TEST123',
    short_name: 'Test Unit',
    display_name: 'Test Unit Display',
    nick_name: 'TestU',
    echelon: Echelon.COMPANY,
    level: 3,
    component: 'Army',
    state: 'TX',
    parent_uic: 'PARENT123',
  };

  const mockAppUserDto: IAppUserDto = {
    new_user: false,
    user_id: 'user123',
    rank: 'CPT',
    first_name: 'John',
    last_name: 'Doe',
    is_admin: true,
    default_unit: mockUnitDto,
  };

  const mockCreateAppUserOut: ICreateAppUserOut = {
    user_id: 'user456',
    rank: 'LT',
    first_name: 'Jane',
    last_name: 'Smith',
    unit_uic: 'UNIT789',
  };

  describe('IAppUserDto Interface', () => {
    it('should have the correct interface structure', () => {
      expect(mockAppUserDto).toHaveProperty('new_user');
      expect(mockAppUserDto).toHaveProperty('user_id');
      expect(mockAppUserDto).toHaveProperty('rank');
      expect(mockAppUserDto).toHaveProperty('first_name');
      expect(mockAppUserDto).toHaveProperty('last_name');
      expect(mockAppUserDto).toHaveProperty('is_admin');
      expect(mockAppUserDto).toHaveProperty('default_unit');
    });

    it('should accept valid data types', () => {
      expectTypeOf(mockAppUserDto.new_user).toBeBoolean();
      expectTypeOf(mockAppUserDto.user_id).toBeString();
      expectTypeOf(mockAppUserDto.rank).toBeString();
      expectTypeOf(mockAppUserDto.first_name).toBeString();
      expectTypeOf(mockAppUserDto.last_name).toBeString();
      expectTypeOf(mockAppUserDto.is_admin).toBeBoolean();
      expectTypeOf(mockAppUserDto.default_unit).toEqualTypeOf<IUnitBriefDto | undefined>();
    });

    it('should handle optional default_unit', () => {
      const dtoWithoutUnit: IAppUserDto = {
        new_user: true,
        user_id: 'user789',
        rank: 'SGT',
        first_name: 'Bob',
        last_name: 'Johnson',
        is_admin: false,
      };

      expect(dtoWithoutUnit.default_unit).toBeUndefined();
    });
  });

  describe('ICreateAppUserOut Interface', () => {
    it('should have the correct interface structure', () => {
      expect(mockCreateAppUserOut).toHaveProperty('user_id');
      expect(mockCreateAppUserOut).toHaveProperty('rank');
      expect(mockCreateAppUserOut).toHaveProperty('first_name');
      expect(mockCreateAppUserOut).toHaveProperty('last_name');
      expect(mockCreateAppUserOut).toHaveProperty('unit_uic');
    });

    it('should accept valid data types', () => {
      expectTypeOf(mockCreateAppUserOut.user_id).toBeString();
      expectTypeOf(mockCreateAppUserOut.rank).toBeString();
      expectTypeOf(mockCreateAppUserOut.first_name).toBeString();
      expectTypeOf(mockCreateAppUserOut.last_name).toBeString();
      expectTypeOf(mockCreateAppUserOut.unit_uic).toBeString();
    });
  });

  describe('IAppUser Interface', () => {
    const mockAppUser: IAppUser = {
      userId: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      rank: 'CPT',
      isAdmin: true,
      email: 'john.doe@example.com',
      unit: {
        uic: 'TEST123',
        shortName: 'Test Unit',
        displayName: 'Test Unit Display',
        echelon: Echelon.COMPANY,
        component: 'Army',
        level: 3,
      },
      globalUnit: {
        uic: 'TEST123',
        shortName: 'Test Unit',
        displayName: 'Test Unit Display',
        echelon: Echelon.COMPANY,
        component: 'Army',
        level: 3,
      },
      newUser: false,
      jobDescription: 'An important job',
      lastActive: '01/01/2025',
    };

    it('should have the correct interface structure', () => {
      expect(mockAppUser).toHaveProperty('userId');
      expect(mockAppUser).toHaveProperty('firstName');
      expect(mockAppUser).toHaveProperty('lastName');
      expect(mockAppUser).toHaveProperty('rank');
      expect(mockAppUser).toHaveProperty('isAdmin');
      expect(mockAppUser).toHaveProperty('email');
      expect(mockAppUser).toHaveProperty('unit');
      expect(mockAppUser).toHaveProperty('globalUnit');
      expect(mockAppUser).toHaveProperty('newUser');
      expect(mockAppUser).toHaveProperty('jobDescription');
      expect(mockAppUser).toHaveProperty('lastActive');
    });

    it('should accept valid data types', () => {
      expectTypeOf(mockAppUser.userId).toBeString();
      expectTypeOf(mockAppUser.firstName).toBeString();
      expectTypeOf(mockAppUser.lastName).toBeString();
      expectTypeOf(mockAppUser.rank).toBeString();
      expectTypeOf(mockAppUser.isAdmin).toBeBoolean();
      expectTypeOf(mockAppUser.email).toEqualTypeOf<string | undefined>();
      expectTypeOf(mockAppUser.unit).toBeObject();
      expectTypeOf(mockAppUser.globalUnit).toEqualTypeOf<IUnitBrief | undefined>();
      expectTypeOf(mockAppUser.newUser).toBeBoolean();
      expectTypeOf(mockAppUser.jobDescription).toEqualTypeOf<string | undefined>();
      expectTypeOf(mockAppUser.lastActive).toEqualTypeOf<string | undefined>();
    });
  });

  describe('mapToIAppUser Function', () => {
    it('should correctly map IAppUserDto to IAppUser with complete data', () => {
      const result = mapToIAppUser(mockAppUserDto);

      expect(result).toEqual({
        userId: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        fullname: 'John Doe',
        rank: 'CPT',
        rankAndName: 'CPT John Doe',
        isAdmin: true,
        jobDescription: '',
        lastActive: undefined,
        unit: {
          uic: 'TEST123',
          shortName: 'Test Unit',
          displayName: 'Test Unit Display',
          echelon: Echelon.COMPANY,
          component: 'Army',
          level: 3,
          nickName: 'TestU',
          state: 'TX',
          parentUic: 'PARENT123',
        },
        globalUnit: {
          uic: 'TEST123',
          shortName: 'Test Unit',
          displayName: 'Test Unit Display',
          echelon: Echelon.COMPANY,
          component: 'Army',
          level: 3,
          nickName: 'TestU',
          state: 'TX',
          parentUic: 'PARENT123',
        },
        newUser: false,
      });
    });

    it('should handle missing default_unit by creating default unit', () => {
      const dtoWithoutUnit: IAppUserDto = {
        new_user: true,
        user_id: 'user789',
        rank: 'SGT',
        first_name: 'Bob',
        last_name: 'Johnson',
        is_admin: false,
      };

      const result = mapToIAppUser(dtoWithoutUnit);

      const expectedUnit = {
        uic: '',
        shortName: '',
        displayName: '',
        echelon: Echelon.UNKNOWN,
        component: '',
        level: 0,
        nickName: '',
        parentUic: '',
        state: '',
      };

      expect(result.unit).toEqual(expectedUnit);
      expect(result.globalUnit).toEqual(expectedUnit);
    });

    it('should handle empty names gracefully', () => {
      const emptyNameDto: IAppUserDto = {
        new_user: false,
        user_id: 'user000',
        rank: 'PVT',
        first_name: '',
        last_name: '',
        is_admin: false,
      };

      const result = mapToIAppUser(emptyNameDto);
      expect(result.firstName).toBe('');
      expect(result.lastName).toBe('');
    });

    it('should correctly map snake_case to camelCase properties', () => {
      const result = mapToIAppUser(mockAppUserDto);

      expect(result.userId).toBe(mockAppUserDto.user_id);
      expect(result.firstName).toBe(mockAppUserDto.first_name);
      expect(result.lastName).toBe(mockAppUserDto.last_name);
      expect(result.isAdmin).toBe(mockAppUserDto.is_admin);
      expect(result.newUser).toBe(mockAppUserDto.new_user);
    });

    it('should handle unit with null optional fields', () => {
      const unitWithNulls: IUnitBriefDto = {
        uic: 'NULL123',
        short_name: 'Null Unit',
        display_name: 'Null Unit Display',
        nick_name: null,
        echelon: Echelon.BATTALION,
        level: 4,
        component: 'Navy',
        state: null,
        parent_uic: null,
      };

      const dtoWithNullUnit: IAppUserDto = {
        new_user: false,
        user_id: 'user_null',
        rank: 'MAJ',
        first_name: 'Null',
        last_name: 'Test',
        is_admin: false,
        default_unit: unitWithNulls,
      };

      const result = mapToIAppUser(dtoWithNullUnit);

      expect(result.unit.nickName).toBeUndefined();
      expect(result.unit.state).toBeUndefined();
      expect(result.unit.parentUic).toBeUndefined();
    });

    it('should preserve all required unit properties', () => {
      const result = mapToIAppUser(mockAppUserDto);

      expect(result.unit.uic).toBe('TEST123');
      expect(result.unit.shortName).toBe('Test Unit');
      expect(result.unit.displayName).toBe('Test Unit Display');
      expect(result.unit.echelon).toBe(Echelon.COMPANY);
      expect(result.unit.component).toBe('Army');
      expect(result.unit.level).toBe(3);
    });
  });
});
