import { describe, expect, it, vi } from 'vitest';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ExportReports from '@features/daily-status-report/components/ExportReports/ExportReport';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

// Mock RTK Query hooks
vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetAutoDsrQuery: vi.fn(),
}));

vi.mock('@store/griffin_api/reports/slices', () => ({
  useExportDsrPDFMutation: vi.fn(() => [vi.fn(), { isError: false }]),
  useLazyExportDsrCSVQuery: vi.fn(() => [vi.fn(), { isError: false }]),
}));

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@utils/helpers/downloadFileExport', () => ({
  downloadFileExport: vi.fn(),
}));

// Import the mocked hooks
import { useGetAutoDsrQuery } from '@store/griffin_api/auto_dsr/slices';
import { useAppSelector } from '@store/hooks';

describe('ExportReports', () => {
  const mockUseAppSelector = vi.mocked(useAppSelector);
  const mockUseGetAutoDsrQuery = vi.mocked(useGetAutoDsrQuery);

  beforeEach(() => {
    mockUseAppSelector.mockReturnValue('123');
    mockUseGetAutoDsrQuery.mockReturnValue({
      data: [],
      isError: false,
      isFetching: false,
      isUninitialized: false,
      isSuccess: true,
      refetch: vi.fn(),
    });
  });

  it('renders the export button', () => {
    renderWithProviders(<ExportReports />);

    expect(screen.getByRole('button', { name: /export reports/i })).toBeInTheDocument();
  });

  it('opens popover on button click', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ExportReports />);

    const button = screen.getByRole('button', { name: /export reports/i });
    await user.click(button);

    expect(screen.getByText('Select export file type.')).toBeInTheDocument();
  });

  it('renders PDF and CSV options', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ExportReports />);

    const button = screen.getByRole('button', { name: /export reports/i });
    await user.click(button);

    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
  });
});
