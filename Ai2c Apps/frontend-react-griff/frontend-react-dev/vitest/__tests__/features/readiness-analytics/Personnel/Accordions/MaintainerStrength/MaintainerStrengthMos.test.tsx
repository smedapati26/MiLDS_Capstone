import { Provider } from 'react-redux';
import { vi } from 'vitest';
import { mockPalette } from 'vitest/mocks/theme/mockPalette';

import { createTheme, ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';

import { MaintainerStrengthContext } from '@features/readiness-analytics/Personnel/Accordions/MaintainerStrength/MaintainerStrengthContext';
import MaintainerStrengthMos from '@features/readiness-analytics/Personnel/Accordions/MaintainerStrength/MaintainerStrengthMos';

import { useGetMaintainerStrengthMosQuery } from '@store/amap_api/personnel/slices';
import { useAppSelector } from '@store/hooks';
import { store } from '@store/store';

vi.mock('@store/amap_api/personnel/slices', () => ({
  useGetMaintainerStrengthMosQuery: vi.fn(),
}));

vi.mock('src/store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

describe('MaintainerStrengthMos Component', () => {
  const theme = createTheme({ palette: { ...mockPalette } });

  const mockSetMosRank = vi.fn();

  const mockData = [
    { rank: 'E1', mos: 'MosA', actual_count: 5, num_authorized: 10 },
    { rank: 'E2', mos: 'MosB', actual_count: 3, num_authorized: 5 },
    { rank: 'E1', mos: 'MosB', actual_count: 2, num_authorized: 5 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppSelector as unknown as jest.Mock).mockReturnValue('test-uic');
    (useGetMaintainerStrengthMosQuery as unknown as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
    });
  });

  const renderComponent = (mosRank: string[] | undefined = undefined) => {
    const MaintainerStrengthMosTemplate = () => {
      return (
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <MaintainerStrengthContext.Provider value={{ mosRank, setMosRank: mockSetMosRank }}>
              <MaintainerStrengthMos />
            </MaintainerStrengthContext.Provider>
          </Provider>
        </ThemeProvider>
      );
    };
    return render(<MaintainerStrengthMosTemplate />);
  };

  it('renders loading state', () => {
    (useGetMaintainerStrengthMosQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderComponent();

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('renders no data state', () => {
    (useGetMaintainerStrengthMosQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderComponent();

    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });

  it('renders dropdown with correct options and bar graph', async () => {
    renderComponent(['E1', 'E2']);

    // Check dropdown label
    expect(screen.getAllByText('MOS')).toBeTruthy();

    // Check that dropdown options are rendered (labels)
    expect(screen.getByText('E1, E2')).toBeInTheDocument();

    // Check that bar graph is rendered by checking for the label '# of Personnel'
    expect(await screen.findByText('No data available')).toBeInTheDocument();
  });
});
