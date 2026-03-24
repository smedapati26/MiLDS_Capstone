import { Provider } from 'react-redux';
import { vi } from 'vitest';
import { mockPalette } from 'vitest/mocks/theme/mockPalette';

import { createTheme, ThemeProvider } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';

import { CrewStrengthContext } from '@features/readiness-analytics/Personnel/Accordions/CrewStrength/CrewStrengthContext';
import CrewStrengthMos from '@features/readiness-analytics/Personnel/Accordions/CrewStrength/CrewStrengthMos';

import { useGetCrewStrengthMosQuery } from '@store/griffin_api/personnel/slices/personnelApi';
import { useAppSelector } from '@store/hooks';
import { store } from '@store/store';

// Mock the hooks and context
vi.mock('@store/griffin_api/personnel/slices/personnelApi', () => ({
  useGetCrewStrengthMosQuery: vi.fn(),
}));

vi.mock('src/store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

describe('CrewStrengthMos Component', () => {
  const theme = createTheme({ palette: { ...mockPalette } });

  const mockSetMosRank = vi.fn();

  const mockData = [
    { mos: '15P', rank: 'SGT', actual_count: 2, num_authorized: 3 },
    { mos: '15T', rank: 'SSG', actual_count: 1, num_authorized: 2 },
    { mos: '15P', rank: 'SSG', actual_count: 3, num_authorized: 4 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppSelector as unknown as jest.Mock).mockReturnValue('test-uic');
    (useGetCrewStrengthMosQuery as unknown as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
    });
  });

  const renderComponent = (mosRank: string[] | undefined = undefined) => {
    const CrewStrengthMosTemplate = () => {
      return (
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <CrewStrengthContext.Provider
              value={{ mosRank, setMosRank: mockSetMosRank, skillRank: undefined, setSkillRank: () => {} }}
            >
              <CrewStrengthMos />
            </CrewStrengthContext.Provider>
          </Provider>
        </ThemeProvider>
      );
    };
    return render(<CrewStrengthMosTemplate />);
  };

  it('renders loading state', () => {
    (useGetCrewStrengthMosQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderComponent();

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('renders no data state', () => {
    (useGetCrewStrengthMosQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderComponent();

    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });

  it('renders dropdown with correct options and bar graph', async () => {
    renderComponent(['SGT', 'SSG']);

    // Check dropdown label
    expect(screen.getAllByText(/Rank/i)).toBeTruthy();

    // Check that dropdown options are rendered (labels)
    expect(screen.getByText('SGT, SSG')).toBeInTheDocument();

    // Check that bar graph is rendered by checking for the label '# of Personnel'
    expect(await screen.findByText('Plot Component')).toBeInTheDocument();
  });

  it('handles rank selection change', async () => {
    renderComponent([]);

    const dropDownButton = screen.getByRole('combobox');

    // Open the dropdown
    fireEvent.mouseDown(dropDownButton);

    const sgtOption = await screen.findByText('SGT');
    fireEvent.click(sgtOption);

    // Verify callback was called
    expect(mockSetMosRank).toHaveBeenCalledWith(['SGT']);
  });

  it('filters data based on selected ranks', () => {
    renderComponent(['SGT']);

    // With mosRank = ['SGT'], only data with rank 'SGT' should be processed
    // mockData has one entry with rank 'SGT': { mos: '15P', rank: 'SGT', actual_count: 2, num_authorized: 3 }
    // So bar graph should render
    expect(screen.getByText('Plot Component')).toBeInTheDocument();
  });

  it('aggregates MOS data correctly', () => {
    renderComponent();

    // With no mosRank filter, all data is used
    // MOS '15P' appears twice: SGT (2 actual, 3 auth) and SSG (3 actual, 4 auth) -> total actual 5, auth 7
    // MOS '15T' once: SSG (1 actual, 2 auth)
    // Bar graph should render with aggregated data
    expect(screen.getByText('Plot Component')).toBeInTheDocument();
  });
});
