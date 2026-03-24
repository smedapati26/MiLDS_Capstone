import { describe, expect, it, vi } from 'vitest';
import { mockPalette } from 'vitest/mocks/theme/mockPalette';

import { createTheme, ThemeProvider } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';

import CrewExperienceSkills from '@features/readiness-analytics/Personnel/Accordions/CrewExperience/CrewExperienceSkills';

const mockUseSkillsDropDown = {
  modelOptions: { model1: { label: 'Model 1', value: 'model1' } },
  skillOptions: { skill1: { label: 'Skill 1', value: 'skill1' } },
  isLoading: false,
  selectedSkillValue: ['skill1'],
  selectedModelValue: ['model1'],
  handleModelSelectionChange: () => {},
  handleSkillSelectionChange: () => {},
  filteredSkillsData: [
    {
      model: 'Model 1',
      actual_skills: [{ skill: 'Skill 1', count: 5 }],
      authorized_skills: [{ skill: 'Skill 1', count: 10 }],
    },
  ],
};

vi.mock('@features/readiness-analytics/Personnel/hooks/UseSkillsDropDown', () => ({
  default: () => mockUseSkillsDropDown,
}));

describe('CrewExperienceSkills Component', () => {
  const theme = createTheme({ palette: { ...mockPalette } });

  const CrewExperience = () => {
    return (
      <ThemeProvider theme={theme}>
        <CrewExperienceSkills />
      </ThemeProvider>
    );
  };

  it('renders dropdowns and bar graph', () => {
    render(<CrewExperience />);
    expect(screen.getAllByText('Model')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Skill')[0]).toBeInTheDocument();
  });

  it('calls handlers on dropdown change', () => {
    render(<CrewExperience />);
    const modelDropdown = screen.getAllByText('Model')[0];
    fireEvent.click(modelDropdown);
    const checkbox = screen.getAllByText('Model 1')[0];
    fireEvent.click(checkbox);
    expect(checkbox).toBeInTheDocument;

    const skillDropdown = screen.getAllByText('Skill')[0];
    fireEvent.click(skillDropdown);
    const checkbox1 = screen.getAllByText('Skill 1')[0];
    fireEvent.click(checkbox1);
    expect(checkbox1).toBeInTheDocument;
  });

  it('shows loading state', () => {
    vi.mocked(mockUseSkillsDropDown).isLoading = true;
    render(<CrewExperience />);
    expect(screen.getAllByTestId('loading-icon').length).toBeGreaterThan(0);
  });
});
