import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import SavedCOAsTab from '@features/flight-hour-program/saved-coas/SavedCOAsTab';

describe('SaveCOAsTab', () => {
  beforeEach(() => {
    render(<SavedCOAsTab />);
  });

  it('render Saved COAs tab correctly', () => {
    expect(screen.getByTestId('fhp-saved-coas-tab'));
  });
});
