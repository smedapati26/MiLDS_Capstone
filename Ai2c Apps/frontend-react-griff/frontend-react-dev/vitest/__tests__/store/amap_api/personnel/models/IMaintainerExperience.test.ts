import { describe, expect, it } from 'vitest';

import {
  IMaintainerExperienceMos,
  IMaintainerExperienceMosCount,
  IMaintainerExperienceMosData,
  IMaintainerStrengthMosAvailability,
} from '@store/amap_api/personnel/models/IMaintainerExperience';
import { ISkillCount } from '@store/griffin_api/personnel/models';

describe('Interface shape validation', () => {
  it('ISkillCount should have skill as string and count as number', () => {
    const example: ISkillCount = { skill: 'JavaScript', count: 10 };
    expect(typeof example.skill).toBe('string');
    expect(typeof example.count).toBe('number');
  });

  it('IMaintainerExperienceMosCount should have level as string and count as number', () => {
    const example: IMaintainerExperienceMosCount = { level: 'Senior', count: 5 };
    expect(typeof example.level).toBe('string');
    expect(typeof example.count).toBe('number');
  });

  it('IMaintainerExperienceMosData should have date as string and counts as array of IMaintainerExperienceMosCount', () => {
    const example: IMaintainerExperienceMosData = {
      date: '2024-06-01',
      counts: [
        { level: 'Junior', count: 3 },
        { level: 'Senior', count: 2 },
      ],
    };
    expect(typeof example.date).toBe('string');
    expect(Array.isArray(example.counts)).toBe(true);
    example.counts.forEach((count) => {
      expect(typeof count.level).toBe('string');
      expect(typeof count.count).toBe('number');
    });
  });

  it('IMaintainerStrengthMosAvailability should have mos as string and available_count and total_count as numbers', () => {
    const example: IMaintainerStrengthMosAvailability = {
      mos: 'MOS123',
      available_count: 7,
      total_count: 10,
    };
    expect(typeof example.mos).toBe('string');
    expect(typeof example.available_count).toBe('number');
    expect(typeof example.total_count).toBe('number');
  });

  it('IMaintainerExperienceMos should have mos as string and data as array of IMaintainerExperienceMosData', () => {
    const example: IMaintainerExperienceMos = {
      mos: 'MOS123',
      data: [
        {
          date: '2024-06-01',
          counts: [
            { level: 'Junior', count: 3 },
            { level: 'Senior', count: 2 },
          ],
        },
      ],
    };
    expect(typeof example.mos).toBe('string');
    expect(Array.isArray(example.data)).toBe(true);
    example.data.forEach((dataItem) => {
      expect(typeof dataItem.date).toBe('string');
      expect(Array.isArray(dataItem.counts)).toBe(true);
      dataItem.counts.forEach((count) => {
        expect(typeof count.level).toBe('string');
        expect(typeof count.count).toBe('number');
      });
    });
  });
});
