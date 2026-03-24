import { describe, expect, it } from 'vitest';

import { DATE_FORMAT, QUERY_DATE_FORMAT } from '@utils/constants';

describe('Date Format Constants', () => {
  it('should have the correct DATE_FORMAT', () => {
    expect(DATE_FORMAT).toBe('MMDDYYYY');
  });

  it('should have the correct QUERY_DATE_FORMAT', () => {
    expect(QUERY_DATE_FORMAT).toBe('YYYY-MM-DD');
  });
});
