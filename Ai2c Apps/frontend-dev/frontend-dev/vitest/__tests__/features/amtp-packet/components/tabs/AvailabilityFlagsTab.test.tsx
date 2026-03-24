import { describe, expect, it } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';

import { screen } from '@testing-library/react';

import AvailabilityFlagsTab from '@features/amtp-packet/components/tabs/AvailabilityFlagsTab';

describe('AvailabilityFlagsTab Tests', () => {
  it('renders inital ui', () => {
    renderWithProviders(<AvailabilityFlagsTab />);

    const divElements = screen.getByLabelText('Availability Flags Table');
    expect(divElements).toBeInTheDocument();
  });
});
