import { generateTestId } from '@utils/helpers/generateTestId';

import '@testing-library/jest-dom';

/* generateTestId Tests */
describe('generateTestIdTest', () => {
  const expected = 'basic-label';

  it('returns null', () => {
    const result = generateTestId(undefined);
    expect(result).toEqual(null);
  });

  it('generates basic test id', () => {
    const result = generateTestId(expected);
    expect(result).toEqual(expected);
  });

  it('generates test id with spacing', () => {
    const result = generateTestId(' basic label ');
    expect(result).toEqual(expected);
  });

  it('generates test id with Capital letters', () => {
    const result = generateTestId('Basic-LABEL');
    expect(result).toEqual(expected);
  });

  it('generates test id as postfix', () => {
    const result = generateTestId('basic', 'label');
    expect(result).toEqual(expected);
  });

  it('generates test id as prefix', () => {
    const result = generateTestId('basic', 'label', true);
    expect(result).toEqual('label-basic');
  });
});
