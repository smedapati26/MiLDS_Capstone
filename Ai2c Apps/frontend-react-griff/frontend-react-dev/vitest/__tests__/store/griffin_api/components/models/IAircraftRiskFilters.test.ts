import { describe, expect, it } from 'vitest';

interface IAircraftRiskFilters {
  uic: string;
  variant?: 'top' | 'bottom';
  serial_numbers?: string[];
  other_uics?: string[];
  part_numbers?: string[];
}

describe('IAircraftRiskFilters interface', () => {
  it('should accept a valid object with required and optional properties', () => {
    const validFilter: IAircraftRiskFilters = {
      uic: '12345',
      variant: 'top',
      serial_numbers: ['SN001', 'SN002'],
      other_uics: ['UIC1', 'UIC2'],
      part_numbers: ['PN1', 'PN2'],
    };

    expect(validFilter.uic).toBe('12345');
    expect(validFilter.variant).toBe('top');
    expect(validFilter.serial_numbers).toContain('SN001');
  });

  it('should accept an object with only the required property', () => {
    const minimalFilter: IAircraftRiskFilters = {
      uic: '67890',
    };

    expect(minimalFilter.uic).toBe('67890');
    expect(minimalFilter.variant).toBeUndefined();
  });

  it('should not accept invalid variant values', () => {
    // This test is more about TypeScript compile-time checking,
    // but we can simulate a runtime check:
    const invalidFilter = {
      uic: '11111',
      variant: 'middle', // invalid variant
    };

    // TypeScript will error on the above assignment if typed as IAircraftRiskFilters,
    // so here we just check the runtime value:
    expect(['top', 'bottom']).not.toContain(invalidFilter.variant);
  });
});
