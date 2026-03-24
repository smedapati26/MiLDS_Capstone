import { describe, expect, it } from 'vitest';
import { mockPalette } from 'vitest/mocks/theme/mockPalette';

import { createTheme, ThemeProvider } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';

import CrewExperienceReadinessLevel from '@features/readiness-analytics/Personnel/Accordions/CrewExperience/CrewExperienceReadinessLevel';

import { useGetCrewExperienceReadinessLevelQuery } from '@store/griffin_api/personnel/slices/personnelApi';

vi.mock('src/store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/personnel/slices/personnelApi', () => ({
  useGetCrewExperienceReadinessLevelQuery: vi.fn(),
}));

describe('CrewExperience Component', () => {
  const theme = createTheme({ palette: { ...mockPalette } });

  const CrewExperienceRL = () => {
    return (
      <ThemeProvider theme={theme}>
        <CrewExperienceReadinessLevel />
      </ThemeProvider>
    );
  };

  it('renders dropdowns and bar graph', () => {
    (useGetCrewExperienceReadinessLevelQuery as unknown as jest.Mock).mockReturnValue({
      data: [
        {
          model: 'HH-60M',
          count: 180,
          type: 'DN',
          readiness_level: 0,
        },
        {
          model: 'UH-60L',
          count: 160,
          type: 'DN',
          readiness_level: 0,
        },
      ],
      isLoading: true,
    });
    render(<CrewExperienceRL />);
    expect(screen.getAllByText('Model')[0]).toBeInTheDocument();
  });

  it('calls handlers on dropdown change', () => {
    (useGetCrewExperienceReadinessLevelQuery as unknown as jest.Mock).mockReturnValue({
      data: [
        {
          model: 'HH-60M',
          count: 180,
          type: 'DN',
          readiness_level: 0,
        },
        {
          model: 'UH-60L',
          count: 160,
          type: 'DN',
          readiness_level: 0,
        },
      ],
      isLoading: true,
    });
    render(<CrewExperienceRL />);
    const modelDropdown = screen.getAllByText('Model')[0];
    fireEvent.click(modelDropdown);
    const checkbox = screen.getAllByText('0')[0];
    fireEvent.click(checkbox);
    expect(checkbox).toBeInTheDocument;
  });

  it('shows loading state', () => {
    (useGetCrewExperienceReadinessLevelQuery as unknown as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });
    render(<CrewExperienceRL />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});
