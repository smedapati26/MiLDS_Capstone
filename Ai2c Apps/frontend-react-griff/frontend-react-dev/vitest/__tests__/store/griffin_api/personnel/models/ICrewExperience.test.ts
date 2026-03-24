import { describe, expect, it } from 'vitest';

import {
  ICrewExperienceReadinessLevel,
  ICrewExperienceReadinessLevelArgs,
  ICrewExperienceReadinessLevelTransformedData,
  ICrewExperienceSkill,
  ICrewExperienceSkillArgs,
  ISkillCount,
} from '@store/griffin_api/personnel/models/ICrewExperience';

describe('ICrewExperience Models', () => {
  describe('ISkillCount', () => {
    it('should have skill as string and count as number', () => {
      const skillCount: ISkillCount = { skill: 'Pilot', count: 5 };
      expect(typeof skillCount.skill).toBe('string');
      expect(typeof skillCount.count).toBe('number');
      expect(skillCount).toHaveProperty('skill');
      expect(skillCount).toHaveProperty('count');
    });
  });

  describe('ICrewExperienceSkill', () => {
    it('should have model as string and arrays of ISkillCount', () => {
      const crewSkill: ICrewExperienceSkill = {
        model: 'CH-47F',
        actual_skills: [{ skill: 'Pilot', count: 3 }],
        authorized_skills: [{ skill: 'Co-Pilot', count: 2 }],
      };
      expect(typeof crewSkill.model).toBe('string');
      expect(Array.isArray(crewSkill.actual_skills)).toBe(true);
      expect(Array.isArray(crewSkill.authorized_skills)).toBe(true);
      expect(crewSkill.actual_skills[0]).toHaveProperty('skill');
      expect(crewSkill.actual_skills[0]).toHaveProperty('count');
      expect(crewSkill.authorized_skills[0]).toHaveProperty('skill');
      expect(crewSkill.authorized_skills[0]).toHaveProperty('count');
    });
  });

  describe('ICrewExperienceReadinessLevel', () => {
    it('should have model, count, rl_type, and readiness_level as strings or number', () => {
      const readinessLevel: ICrewExperienceReadinessLevel = {
        model: 'CH-47F',
        count: 10,
        rl_type: 'Type A',
        readiness_level: 'High',
      };
      expect(typeof readinessLevel.model).toBe('string');
      expect(typeof readinessLevel.count).toBe('number');
      expect(typeof readinessLevel.rl_type).toBe('string');
      expect(typeof readinessLevel.readiness_level).toBe('string');
      expect(readinessLevel).toHaveProperty('model');
      expect(readinessLevel).toHaveProperty('count');
      expect(readinessLevel).toHaveProperty('rl_type');
      expect(readinessLevel).toHaveProperty('readiness_level');
    });
  });

  describe('ICrewExperienceReadinessLevelTransformedData', () => {
    it('should be an object with nested structure', () => {
      const transformedData: ICrewExperienceReadinessLevelTransformedData = {
        'CH-47F': {
          High: {
            'Type A': 5,
          },
        },
      };
      expect(typeof transformedData).toBe('object');
      expect(transformedData).toHaveProperty('CH-47F');
      expect(transformedData['CH-47F']).toHaveProperty('High');
      expect(transformedData['CH-47F']['High']).toHaveProperty('Type A');
      expect(typeof transformedData['CH-47F']['High']['Type A']).toBe('number');
    });
  });

  describe('ICrewExperienceReadinessLevelArgs', () => {
    it('should have uic as string and optional models as array of strings', () => {
      const args: ICrewExperienceReadinessLevelArgs = {
        uic: 'TEST_UIC',
        models: ['CH-47F', 'UH-60'],
      };
      expect(typeof args.uic).toBe('string');
      expect(Array.isArray(args.models)).toBe(true);
      expect(args.models?.every((model) => typeof model === 'string')).toBe(true);
    });

    it('should allow models to be undefined', () => {
      const args: ICrewExperienceReadinessLevelArgs = {
        uic: 'TEST_UIC',
      };
      expect(typeof args.uic).toBe('string');
      expect(args.models).toBeUndefined();
    });
  });

  describe('ICrewExperienceSkillArgs', () => {
    it('should extend ICrewExperienceReadinessLevelArgs and add optional skills', () => {
      const args: ICrewExperienceSkillArgs = {
        uic: 'TEST_UIC',
        models: ['CH-47F'],
        skills: ['Pilot', 'Co-Pilot'],
      };
      expect(typeof args.uic).toBe('string');
      expect(Array.isArray(args.models)).toBe(true);
      expect(Array.isArray(args.skills)).toBe(true);
      expect(args.skills?.every((skill) => typeof skill === 'string')).toBe(true);
    });

    it('should allow skills to be undefined', () => {
      const args: ICrewExperienceSkillArgs = {
        uic: 'TEST_UIC',
      };
      expect(typeof args.uic).toBe('string');
      expect(args.models).toBeUndefined();
      expect(args.skills).toBeUndefined();
    });
  });
});
