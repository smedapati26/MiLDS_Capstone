import dayjs from 'dayjs';
import { type Mock, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';

import { UpcomingMaintenanceChart } from '@features/component-management/components/Analytics/UpcomingMaintenanceChart';

import { useGetUpcomingMaintenanceQuery } from '@store/griffin_api/events/slices';

import { mockPalette } from '@vitest/mocks/theme/mockPalette';

const mockTheme = createTheme({ palette: { ...mockPalette } });

vi.mock('@store/griffin_api/events/slices');

const startDate = dayjs().subtract(1, 'day').format('DD MMM YY');
const endDate = dayjs().add(7, 'day').format('DD MMM YY');

const mockMaintenanceEvents = [
  {
    id: 1,
    title: 'Test Maintenance',
    eventStart: startDate,
    eventEnd: endDate,
    notes: 'Test notes',
  },
];

describe('UpcomingMaintenanceChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useGetUpcomingMaintenanceQuery as Mock).mockReturnValue({
      data: mockMaintenanceEvents,
      isLoading: false,
      refetch: vi.fn(),
    });
  });

  it('renders loading state', () => {
    (useGetUpcomingMaintenanceQuery as Mock).mockReturnValue({
      isLoading: true,
    });

    render(
      <ThemeProvider theme={mockTheme}>
        <UpcomingMaintenanceChart uic="TEST123" />
      </ThemeProvider>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders maintenance events', () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <UpcomingMaintenanceChart uic="TEST123" />
      </ThemeProvider>,
    );

    expect(screen.getByText(`Test Maintenance, ${startDate} - ${endDate}`)).toBeInTheDocument();
  });

  it('calculates progress correctly', () => {
    const today = new Date();
    vi.useFakeTimers();
    vi.setSystemTime(today);

    render(
      <ThemeProvider theme={mockTheme}>
        <UpcomingMaintenanceChart uic="TEST123" />
      </ThemeProvider>,
    );

    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('opens note dialog', () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <UpcomingMaintenanceChart uic="TEST123" />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getByText('Maintenance Note')).toBeInTheDocument();
  });

  it('displays default note text', () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <UpcomingMaintenanceChart uic="TEST123" />
      </ThemeProvider>,
    );

    expect(screen.getByText('Test notes')).toBeInTheDocument();
  });

  it('displays no maintenance message when there are no events', () => {
    (useGetUpcomingMaintenanceQuery as Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    });

    render(
      <ThemeProvider theme={mockTheme}>
        <UpcomingMaintenanceChart uic="TEST123" />
      </ThemeProvider>,
    );

    expect(screen.getByText('No Upcoming Maintenance')).toBeInTheDocument();
    expect(screen.getByText('No Upcoming Maintenance')).toHaveClass('MuiTypography-h6');
  });
});
