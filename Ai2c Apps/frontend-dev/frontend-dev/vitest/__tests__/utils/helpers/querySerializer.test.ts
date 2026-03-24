import { describe, expect, it } from 'vitest';

import { createQueryString } from '@utils/helpers';

describe('createQueryString', () => {
  it('serializes single values correctly', () => {
    const params = {
      limit: 10,
      offset: 0,
      query: 'task',
      active: true,
    };
    const result = createQueryString(params);
    expect(result).toBe('limit=10&offset=0&query=task&active=true');
  });

  it('handles repeated parameters for arrays', () => {
    const params = {
      skill_level: ['SL1', 'SL2'],
      proponent: ['army', 'navy'],
    };
    const result = createQueryString(params);
    expect(result).toBe('skill_level=SL1&skill_level=SL2&proponent=army&proponent=navy');
  });

  it('ignores null and undefined values', () => {
    const params = {
      limit: 10,
      offset: undefined,
      query: null,
      status: 'open',
    };
    const result = createQueryString(params);
    expect(result).toBe('limit=10&status=open');
  });

  it('handles a mix of arrays and primitives', () => {
    const params = {
      limit: 5,
      tags: ['urgent', 'research'],
      assigned: 'john',
    };
    const result = createQueryString(params);
    expect(result).toBe('limit=5&tags=urgent&tags=research&assigned=john');
  });
});
