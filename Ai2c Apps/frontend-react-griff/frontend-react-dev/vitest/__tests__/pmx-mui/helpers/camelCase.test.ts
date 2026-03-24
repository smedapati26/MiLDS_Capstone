import { expect } from 'vitest';

import { camelCase } from '@ai2c/pmx-mui';

/* Camel Case Test */
describe('camelCaseTest', () => {
  it('test camelCase', () => {
    const result = camelCase('test_pass');
    expect(result).toEqual('testPass');
  });
});
