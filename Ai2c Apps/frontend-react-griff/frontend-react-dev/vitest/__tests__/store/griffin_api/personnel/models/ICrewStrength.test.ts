import { describe, expect, it } from 'vitest';

import {
  ICrewStrengthArgs,
  ICrewStrengthMosRes,
  ICrewStrengthSkillRes,
} from '@store/griffin_api/personnel/models/ICrewStrength';

describe('ICrewStrength Models', () => {
  describe('ICrewStrengthArgs', () => {
    it('should have uic as string and optional fiscal_year and filter_enlisted', () => {
      const args: ICrewStrengthArgs = {
        uic: 'TEST_UIC',
        fiscal_year: 2023,
        filter_enlisted: true,
      };
      expect(typeof args.uic).toBe('string');
      expect(typeof args.fiscal_year).toBe('number');
      expect(typeof args.filter_enlisted).toBe('boolean');
      expect(args).toHaveProperty('uic');
      expect(args).toHaveProperty('fiscal_year');
      expect(args).toHaveProperty('filter_enlisted');
    });

    it('should allow fiscal_year and filter_enlisted to be undefined', () => {
      const args: ICrewStrengthArgs = {
        uic: 'TEST_UIC',
      };
      expect(typeof args.uic).toBe('string');
      expect(args.fiscal_year).toBeUndefined();
      expect(args.filter_enlisted).toBeUndefined();
    });

    it('should allow filter_enlisted to be null', () => {
      const args: ICrewStrengthArgs = {
        uic: 'TEST_UIC',
        filter_enlisted: null,
      };
      expect(typeof args.uic).toBe('string');
      expect(args.filter_enlisted).toBe(null);
    });
  });

  describe('ICrewStrengthSkillRes', () => {
    it('should extend ICrewStrengthRes and have skill as string', () => {
      const skillRes: ICrewStrengthSkillRes = {
        rank: 'Sergeant',
        actual_count: 10,
        num_authorized: 12,
        skill: 'Pilot',
      };
      expect(typeof skillRes.rank).toBe('string');
      expect(typeof skillRes.actual_count).toBe('number');
      expect(typeof skillRes.num_authorized).toBe('number');
      expect(typeof skillRes.skill).toBe('string');
      expect(skillRes).toHaveProperty('rank');
      expect(skillRes).toHaveProperty('actual_count');
      expect(skillRes).toHaveProperty('num_authorized');
      expect(skillRes).toHaveProperty('skill');
    });
  });

  describe('ICrewStrengthMosRes', () => {
    it('should extend ICrewStrengthRes and have mos as string', () => {
      const mosRes: ICrewStrengthMosRes = {
        rank: 'Captain',
        actual_count: 5,
        num_authorized: 6,
        mos: 'Infantry',
      };
      expect(typeof mosRes.rank).toBe('string');
      expect(typeof mosRes.actual_count).toBe('number');
      expect(typeof mosRes.num_authorized).toBe('number');
      expect(typeof mosRes.mos).toBe('string');
      expect(mosRes).toHaveProperty('rank');
      expect(mosRes).toHaveProperty('actual_count');
      expect(mosRes).toHaveProperty('num_authorized');
      expect(mosRes).toHaveProperty('mos');
    });
  });
});
