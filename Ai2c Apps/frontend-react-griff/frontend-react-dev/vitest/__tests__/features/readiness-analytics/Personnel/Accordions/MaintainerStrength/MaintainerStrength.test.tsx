import { Provider } from 'react-redux';
import { vi } from 'vitest';
import { mockPalette } from 'vitest/mocks/theme/mockPalette';

import { createTheme, ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';

import MaintainerStrength from '@features/readiness-analytics/Personnel/Accordions/MaintainerStrength/MaintainerStrength';
import { MaintainerStrengthContext } from '@features/readiness-analytics/Personnel/Accordions/MaintainerStrength/MaintainerStrengthContext';

import { useGetMaintainerStrengthMosQuery } from '@store/amap_api/personnel/slices';
import { useAppSelector } from '@store/hooks';
import { store } from '@store/store';

vi.mock('@store/amap_api/personnel/slices', () => ({
  useGetMaintainerStrengthMosQuery: vi.fn(),
}));

vi.mock('src/store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

describe('MaintainerStrength', () => {
  const theme = createTheme({ palette: { ...mockPalette } });

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

  const renderComponent = () => {
    const MaintainerStrengthTemplate = () => {
      return (
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <MaintainerStrengthContext.Provider
              value={{
                mosRank: undefined,
                setMosRank: () => {},
              }}
            >
              <MaintainerStrength />
            </MaintainerStrengthContext.Provider>
          </Provider>
        </ThemeProvider>
      );
    };
    return render(<MaintainerStrengthTemplate />);
  };

  it('renders the heading', () => {
    renderComponent();
    expect(screen.getByText('Maintainer Strength')).toBeInTheDocument();
  });
});
