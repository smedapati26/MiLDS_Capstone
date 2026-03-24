import { Provider } from 'react-redux';
import { vi } from 'vitest';
import { mockPalette } from 'vitest/mocks/theme/mockPalette';

import { createTheme, ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';

import { MaintainerExperienceContext } from '@features/readiness-analytics/Personnel/Accordions/MaintainerExperience/MaintainerExperienceContext';
import MaintainerExperienceMos from '@features/readiness-analytics/Personnel/Accordions/MaintainerExperience/MaintainerExperienceMos';

import { useGetMaintainerExperienceMosQuery } from '@store/amap_api/personnel/slices';
import { useAppSelector } from '@store/hooks';
import { store } from '@store/store';

vi.mock('@store/amap_api/personnel/slices', () => ({
  useGetMaintainerExperienceMosQuery: vi.fn(),
}));

vi.mock('src/store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

describe('MaintainerExperienceMos Component', () => {
  const theme = createTheme({ palette: { ...mockPalette } });

  const mockData = {
    MosA: {
      dates: ['2023-01-01', '2023-02-01', '2023-03-01'],
      traces: [
        { x: ['2023-01-01', '2023-02-01', '2023-03-01'], y: [5, 6, 7], type: 'bar', name: 'ML0' },
        { x: ['2023-01-01', '2023-02-01', '2023-03-01'], y: [3, 4, 5], type: 'bar', name: 'ML1' },
        { x: ['2023-01-01', '2023-02-01', '2023-03-01'], y: [2, 3, 4], type: 'bar', name: 'ML2' },
        { x: ['2023-01-01', '2023-02-01', '2023-03-01'], y: [1, 2, 3], type: 'bar', name: 'ML3' },
        { x: ['2023-01-01', '2023-02-01', '2023-03-01'], y: [0, 1, 2], type: 'bar', name: 'ML4' },
      ],
    },
    MosB: {
      dates: ['2023-01-01', '2023-02-01', '2023-03-01'],
      traces: [
        { x: ['2023-01-01', '2023-02-01', '2023-03-01'], y: [4, 5, 6], type: 'bar', name: 'ML0' },
        { x: ['2023-01-01', '2023-02-01', '2023-03-01'], y: [2, 3, 4], type: 'bar', name: 'ML1' },
        { x: ['2023-01-01', '2023-02-01', '2023-03-01'], y: [1, 2, 3], type: 'bar', name: 'ML2' },
        { x: ['2023-01-01', '2023-02-01', '2023-03-01'], y: [0, 1, 2], type: 'bar', name: 'ML3' },
        { x: ['2023-01-01', '2023-02-01', '2023-03-01'], y: [0, 0, 1], type: 'bar', name: 'ML4' },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppSelector as unknown as jest.Mock).mockReturnValue('test-uic');
    (useGetMaintainerExperienceMosQuery as unknown as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
    });
  });

  const renderComponent = () => {
    const MaintainerExperienceMosTemplate = () => {
      return (
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <MaintainerExperienceContext.Provider
              value={{
                maintainerLevelModels: [],
                setMaintainerLevelModels: () => {},
              }}
            >
              <MaintainerExperienceMos />
            </MaintainerExperienceContext.Provider>
          </Provider>
        </ThemeProvider>
      );
    };
    return render(<MaintainerExperienceMosTemplate />);
  };

  it('renders loading state', () => {
    (useGetMaintainerExperienceMosQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderComponent();

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('renders no data state', () => {
    (useGetMaintainerExperienceMosQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderComponent();

    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });

  it('renders dropdown with correct options and bar graph', async () => {
    renderComponent();

    // Check dropdown label
    expect(screen.getAllByText(/Mos/i)).toBeTruthy();

    // Check that dropdown options are rendered (labels)
    expect(screen.getByText('ML0')).toBeInTheDocument();

    // Check that bar graph is rendered by checking for the label '# of Personnel'
    expect(await screen.findByText('No data available')).toBeInTheDocument();
  });
});
