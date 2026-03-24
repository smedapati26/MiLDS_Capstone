import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import CalculatorTab from '@features/flight-hour-program/calculator/CalculatorTab';

describe('CalculatorTab', () => {
  beforeEach(() => {
    render(<CalculatorTab />);
  });

  it('render Calculator tab correctly', () => {
    expect(screen.getByTestId('fhp-calculator-tab'));
  });
});
