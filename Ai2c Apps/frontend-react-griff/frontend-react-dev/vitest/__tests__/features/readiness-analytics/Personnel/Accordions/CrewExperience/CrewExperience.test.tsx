import { Provider } from 'react-redux';
import { useAppSelector } from 'src/store/hooks';
import { describe, expect, it } from 'vitest';
import { mockPalette } from 'vitest/mocks/theme/mockPalette';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';

import CrewExperience from '@features/readiness-analytics/Personnel/Accordions/CrewExperience/CrewExperience';

import { ICrewExperienceSkill } from '@store/griffin_api/personnel/models';
import {
  useGetCrewExperienceReadinessLevelQuery,
  useGetCrewExperienceSkillQuery,
} from '@store/griffin_api/personnel/slices/personnelApi';
import { store } from '@store/store';

// Mock the hooks
vi.mock('src/store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/personnel/slices/personnelApi', () => ({
  useGetCrewExperienceSkillQuery: vi.fn(),
  useGetCrewExperienceReadinessLevelQuery: vi.fn(),
}));

describe('CrewExperience', () => {
  const theme = createTheme({ palette: { ...mockPalette } });

  const CrewExperienceTemplate = () => {
    return (
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <CrewExperience />
        </Provider>
      </ThemeProvider>
    );
  };

  it('renders null state correctly', () => {
    (useAppSelector as unknown as jest.Mock).mockReturnValue('TEST_UIC');
    (useGetCrewExperienceSkillQuery as unknown as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });
    (useGetCrewExperienceReadinessLevelQuery as unknown as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<CrewExperienceTemplate />);

    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('renders toggle correctly', () => {
    (useAppSelector as unknown as jest.Mock).mockReturnValue('TEST_UIC');

    render(<CrewExperienceTemplate />);

    expect(screen.getByText('READINESS LEVEL')).toBeInTheDocument();
    expect(screen.getByText('SKILL')).toBeInTheDocument();
  });

  beforeEach(() => {
    (useGetCrewExperienceSkillQuery as unknown as jest.Mock).mockReturnValue({
      data: [
        {
          model: 'CH-47F',
          actual_skills: [{ skill: 'skill1', count: 5 }],
          authorized_skills: [{ skill: 'skillA', count: 10 }],
        },
        {
          model: 'HH-60M',
          actual_skills: [{ skill: 'skill2', count: 3 }],
          authorized_skills: [{ skill: 'skillB', count: 8 }],
        },
      ] as ICrewExperienceSkill[],
      isLoading: false,
    });

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
      isLoading: false,
    });
  });
});
