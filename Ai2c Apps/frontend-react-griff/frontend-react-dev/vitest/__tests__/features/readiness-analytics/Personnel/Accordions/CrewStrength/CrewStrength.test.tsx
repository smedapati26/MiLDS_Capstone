import { describe, expect, it, vi } from 'vitest';
import { ProviderWrapper } from 'vitest/helpers/ProviderWrapper';

import { render, screen } from '@testing-library/react';

import CrewStrength from '@features/readiness-analytics/Personnel/Accordions/CrewStrength/CrewStrength';

// Mock the hooks
vi.mock('src/store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

import { useAppSelector } from 'src/store/hooks';

describe('CrewStrength Component', () => {
  it('provides context and shows toggle buttons for MOS and SKILL', () => {
    (useAppSelector as unknown as jest.Mock).mockReturnValue('TEST_UIC');

    render(
      <ProviderWrapper>
        <CrewStrength />
      </ProviderWrapper>,
    );

    // Check toggle buttons for MOS and SKILL
    const mosToggle = screen.getByText('MOS');
    const skillToggle = screen.getByText('SKILL');

    expect(mosToggle).toBeInTheDocument();
    expect(skillToggle).toBeInTheDocument();
  });
});
