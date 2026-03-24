import { describe, expect, it } from 'vitest';

import { IOptions } from '@models/IOptions';

describe('IOptions', () => {
  it('should have a label and value of type string', () => {
    const option: IOptions = { label: 'Option 1', value: '1' };
    expect(typeof option.label).toBe('string');
    expect(typeof option.value).toBe('string');
  });

  it('should match the IOptions interface structure', () => {
    const option: IOptions = { label: 'Option 2', value: '2' };
    expect(option).toHaveProperty('label');
    expect(option).toHaveProperty('value');
  });
});
