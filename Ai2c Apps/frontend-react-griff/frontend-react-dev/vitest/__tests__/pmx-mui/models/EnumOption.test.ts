import { describe, expect, it } from 'vitest';

import { EnumOption } from '@ai2c/pmx-mui/models/EnumOption';

describe('EnumOption', () => {
  it('should allow creating an object with all properties', () => {
    const option: EnumOption = {
      key: 1,
      label: 'Option 1',
      value: 'option1',
    };

    expect(option.key).toBe(1);
    expect(option.label).toBe('Option 1');
    expect(option.value).toBe('option1');
  });

  it('should allow creating an object without the key property', () => {
    const option: EnumOption = {
      label: 'Option 2',
      value: 'option2',
    };

    expect(option.key).toBeUndefined();
    expect(option.label).toBe('Option 2');
    expect(option.value).toBe('option2');
  });

  it('should allow key to be a string', () => {
    const option: EnumOption = {
      key: 'key1',
      label: 'Option 3',
      value: 'option3',
    };

    expect(option.key).toBe('key1');
    expect(option.label).toBe('Option 3');
    expect(option.value).toBe('option3');
  });
});
