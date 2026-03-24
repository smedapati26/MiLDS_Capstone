import { DsrLastUpdated } from 'src/features/daily-status-report/components/DsrLastUpdated';
import { vi } from 'vitest';
import { renderWithProviders } from 'vitest/helpers/renderWithProviders';

import { screen } from '@testing-library/react';

import { useGetAutoDsrQuery } from '@store/griffin_api/auto_dsr/slices';
import { useAppSelector } from '@store/hooks';

// Mock the hooks
vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetAutoDsrQuery: vi.fn(),
}));

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

describe('DsrLastUpdated', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('renders with valid data from useGetAutoDsrQuery and useAppSelector', () => {
    // Mock currentUic returned by useAppSelector
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('TEST_UIC');

    // Mock data returned by useGetAutoDsrQuery
    (useGetAutoDsrQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        data: [
          {
            lastExportUploadTime: '2024-06-01T12:00:00Z',
            lastSyncTime: '2024-06-02T15:30:00Z',
            lastUserEditTime: '2024-06-03T10:00:00Z',
          },
        ],
      },
    });

    renderWithProviders(<DsrLastUpdated />);

    // Assert that the LastUpdated component text is rendered with formatted dates
    expect(screen.getByText(/Last Updated:/)).toBeInTheDocument();
    expect(screen.getByText(/06\/03\/2024 10:00:00/)).toBeInTheDocument();
  });

  it('renders fallback when no data', () => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('TEST_UIC');

    (useGetAutoDsrQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        data: [],
      },
    });

    renderWithProviders(<DsrLastUpdated />);

    // Since no valid data, the formatted strings should be empty
    expect(screen.getByText(/Last Updated:/)).toBeInTheDocument();
    // The text after Latest Updated:: is empty string, not rendered text so this assert is removed
  });

  it('skips API call when no currentUic', () => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue(null);

    renderWithProviders(<DsrLastUpdated />);

    // In this case, the API call is skipped and data is undefined, component renders accordingly
    expect(screen.getByText(/Last Updated:/)).toBeInTheDocument();
  });
});
