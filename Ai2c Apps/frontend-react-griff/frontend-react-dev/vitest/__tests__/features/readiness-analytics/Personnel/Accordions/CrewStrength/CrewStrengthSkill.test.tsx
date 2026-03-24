import { Provider } from 'react-redux';
import { vi } from 'vitest';
import { mockPalette } from 'vitest/mocks/theme/mockPalette';

import { createTheme, ThemeProvider } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';

import { CrewStrengthContext } from '@features/readiness-analytics/Personnel/Accordions/CrewStrength/CrewStrengthContext';
import CrewStrengthSkill from '@features/readiness-analytics/Personnel/Accordions/CrewStrength/CrewStrengthSkill';

import { useGetCrewStrengthSkillsQuery } from '@store/griffin_api/personnel/slices/personnelApi';
import { useAppSelector } from '@store/hooks';
import { store } from '@store/store';

// Mock the hooks and context
vi.mock('@store/griffin_api/personnel/slices/personnelApi', () => ({
  useGetCrewStrengthSkillsQuery: vi.fn(),
}));

vi.mock('src/store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

describe('CrewStrengthSkill Component', () => {
  const theme = createTheme({ palette: { ...mockPalette } });

  const mockSetSkillRank = vi.fn();

  const mockData = [
    { rank: 'CW2', skill: 'Pilot', actual_count: 3, num_authorized: 4 },
    { rank: 'CW3', skill: 'Co-Pilot', actual_count: 2, num_authorized: 3 },
    { rank: 'CW2', skill: 'Crew Chief', actual_count: 1, num_authorized: 2 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppSelector as unknown as jest.Mock).mockReturnValue('test-uic');
    (useGetCrewStrengthSkillsQuery as unknown as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
    });
  });

  const renderComponent = (skillRank: string[] | undefined = undefined) => {
    const CrewStrengthSkillTemplate = () => {
      return (
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <CrewStrengthContext.Provider
              value={{ skillRank, setSkillRank: mockSetSkillRank, mosRank: undefined, setMosRank: () => {} }}
            >
              <CrewStrengthSkill />
            </CrewStrengthContext.Provider>
          </Provider>
        </ThemeProvider>
      );
    };
    return render(<CrewStrengthSkillTemplate />);
  };

  it('renders loading state', () => {
    (useGetCrewStrengthSkillsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderComponent();

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('renders no data state', () => {
    (useGetCrewStrengthSkillsQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderComponent();

    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });

  it('renders dropdown with correct options and bar graph', async () => {
    renderComponent(['CW2', 'CW3']);

    // Check dropdown label
    expect(screen.getAllByText(/Rank/i)).toBeTruthy();

    // Check that dropdown options are rendered (labels)
    expect(screen.getByText('CW2, CW3')).toBeInTheDocument();

    // Check that bar graph is rendered by checking for the label '# of Personnel'
    expect(await screen.findByText('Plot Component')).toBeInTheDocument();
  });

  it('handles rank selection change', async () => {
    renderComponent([]);

    const dropDownButton = screen.getByRole('combobox');

    // Open the dropdown
    fireEvent.mouseDown(dropDownButton);

    const cw2Option = await screen.findByText('CW2');
    fireEvent.click(cw2Option);

    // Verify callback was called
    expect(mockSetSkillRank).toHaveBeenCalledWith(['CW2']);
  });
});
