/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AcdHistory from '@features/equipment-manager/components/AcdHistory';

import { useDownloadAcdFileMutation, useGetAcdUploadHistoryQuery } from '@store/griffin_api/auto_dsr/slices';
import { useAppSelector } from '@store/hooks';

import { ThemedTestingComponent } from '@vitest/helpers';
import { mockAcdUploadHistoryData } from '@vitest/mocks/griffin_api_handlers/auto_dsr/mock_data';

// Mock dependencies
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetAcdUploadHistoryQuery: vi.fn(),
  useDownloadAcdFileMutation: vi.fn(),
}));

vi.mock('@components/data-tables', () => ({
  PmxTable: ({ rows, columns, isLoading }: any) => (
    <div
      data-testid="pmx-table"
      data-rows={rows?.length || 0}
      data-columns={columns?.length || 0}
      data-loading={isLoading}
    >
      {rows?.map((row: any, index: number) => (
        <div key={index} data-testid={`table-row-${index}`}>
          {columns.map((col: any) => (
            <div key={col.key} data-testid={`cell-${col.key}-${index}`}>
              {col.render ? col.render(row[col.key], row) : row[col.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  PmxTableWrapper: ({ leftControls, rightControls, table }: any) => (
    <div data-testid="pmx-table-wrapper">
      <div data-testid="left-controls">{leftControls}</div>
      <div data-testid="right-controls">{rightControls}</div>
      <div data-testid="table">{table}</div>
    </div>
  ),
}));

vi.mock('@components/inputs/PmxSearchBar', () => ({
  default: ({ value, onChange, placeholder, sx }: any) => (
    <input
      data-testid="search-bar"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={sx}
    />
  ),
}));

vi.mock('@features/equipment-manager/components/AcdUploadStatusChip', () => ({
  default: ({ status, succeeded }: any) => (
    <div data-testid="status-chip" data-status={status} data-succeeded={succeeded}>
      {status}
    </div>
  ),
}));

describe('AcdHistory', () => {
  const mockCurrentUic = 'TEST_UIC';
  const mockTriggerDownload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useAppSelector as any).mockReturnValue(mockCurrentUic);
    (useGetAcdUploadHistoryQuery as any).mockReturnValue({
      data: { items: mockAcdUploadHistoryData },
      isLoading: false,
      isError: false,
    });
    (useDownloadAcdFileMutation as any).mockReturnValue([
      mockTriggerDownload,
      { isLoading: false, isSuccess: false, isError: false },
    ]);

    mockTriggerDownload.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue(undefined),
    });
  });

  describe('Rendering', () => {
    it('renders the component with table wrapper', () => {
      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      expect(screen.getByTestId('pmx-table-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('left-controls')).toBeInTheDocument();
      expect(screen.getByTestId('right-controls')).toBeInTheDocument();
      expect(screen.getByTestId('table')).toBeInTheDocument();
    });

    it('renders left controls with correct text', () => {
      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('All ACDs uploaded for the global unit are listed below')).toBeInTheDocument();
    });

    it('renders search bar in right controls', () => {
      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toBeInTheDocument();
      expect(searchBar).toHaveAttribute('placeholder', 'Search...');
    });

    it('renders table with correct number of rows', () => {
      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      const table = screen.getByTestId('pmx-table');
      expect(table).toHaveAttribute('data-rows', '3');
    });

    it('renders table with correct number of columns', () => {
      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      const table = screen.getByTestId('pmx-table');
      expect(table).toHaveAttribute('data-columns', '4');
    });

    it('renders in dark mode', () => {
      const { container } = render(
        <ThemedTestingComponent mode="dark">
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByTestId('pmx-table-wrapper')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('renders skeleton when loading', () => {
      (useGetAcdUploadHistoryQuery as any).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      expect(screen.getByTestId('loading-acd-history')).toBeInTheDocument();
      expect(screen.queryByTestId('pmx-table-wrapper')).not.toBeInTheDocument();
    });

    it('does not render table when loading', () => {
      (useGetAcdUploadHistoryQuery as any).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      expect(screen.queryByTestId('pmx-table')).not.toBeInTheDocument();
    });

    it('renders skeleton in dark mode when loading', () => {
      (useGetAcdUploadHistoryQuery as any).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      render(
        <ThemedTestingComponent mode="dark">
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      expect(screen.getByTestId('loading-acd-history')).toBeInTheDocument();
    });
  });

  describe('Data Filtering', () => {
    it('filters out Cancelled status items', () => {
      const dataWithCancelled = [
        ...mockAcdUploadHistoryData,
        {
          id: 4,
          fileName: 'ACD_cancelled.txt',
          uploadedAt: '2026-02-01T10:00:00Z',
          status: 'Cancelled',
          succeeded: false,
          user: { firstName: 'Test', lastName: 'User' },
        },
      ];

      (useGetAcdUploadHistoryQuery as any).mockReturnValue({
        data: { items: dataWithCancelled },
        isLoading: false,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      const table = screen.getByTestId('pmx-table');
      expect(table).toHaveAttribute('data-rows', '3');
    });

    it('filters out Transmitting status items', () => {
      const dataWithTransmitting = [
        ...mockAcdUploadHistoryData,
        {
          id: 5,
          fileName: 'ACD_transmitting.txt',
          uploadedAt: '2026-02-01T10:00:00Z',
          status: 'Transmitting',
          succeeded: false,
          user: { firstName: 'Test', lastName: 'User' },
        },
      ];

      (useGetAcdUploadHistoryQuery as any).mockReturnValue({
        data: { items: dataWithTransmitting },
        isLoading: false,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      const table = screen.getByTestId('pmx-table');
      expect(table).toHaveAttribute('data-rows', '3');
    });
  });

  describe('Column Rendering', () => {
    it('renders file name as clickable link', () => {
      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      const fileName = screen.getByText('ACD_2026_02_04.txt');
      expect(fileName).toBeInTheDocument();
      expect(fileName.closest('button')).toBeInTheDocument();
    });

    it('renders "--" when file name is missing', () => {
      const dataWithoutFileName = [
        {
          id: 1,
          fileName: null,
          uploadedAt: '2026-02-04T10:30:00Z',
          status: 'Completed',
          succeeded: true,
          user: { firstName: 'John', lastName: 'Doe' },
        },
      ];

      (useGetAcdUploadHistoryQuery as any).mockReturnValue({
        data: { items: dataWithoutFileName },
        isLoading: false,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('renders user full name', () => {
      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('renders "--" when user is missing', () => {
      const dataWithoutUser = [
        {
          id: 1,
          fileName: 'test.txt',
          uploadedAt: '2026-02-04T10:30:00Z',
          status: 'Completed',
          succeeded: true,
          user: null,
        },
      ];

      (useGetAcdUploadHistoryQuery as any).mockReturnValue({
        data: { items: dataWithoutUser },
        isLoading: false,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      const cells = screen.getAllByText('--');
      expect(cells.length).toBeGreaterThan(0);
    });

    it('renders upload date in correct format', () => {
      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('02/04/2026')).toBeInTheDocument();
      expect(screen.getByText('02/03/2026')).toBeInTheDocument();
      expect(screen.getByText('02/02/2026')).toBeInTheDocument();
    });

    it('renders "--" when upload date is missing', () => {
      const dataWithoutDate = [
        {
          id: 1,
          fileName: 'test.txt',
          uploadedAt: null,
          status: 'Completed',
          succeeded: true,
          user: { firstName: 'John', lastName: 'Doe' },
        },
      ];

      (useGetAcdUploadHistoryQuery as any).mockReturnValue({
        data: { items: dataWithoutDate },
        isLoading: false,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      const cells = screen.getAllByText('--');
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  describe('Search Functionality', () => {
    it('updates search query on input change', async () => {
      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      const searchBar = screen.getByTestId('search-bar');
      fireEvent.change(searchBar, { target: { value: 'ACD_2026' } });

      await waitFor(() => {
        expect(searchBar).toHaveValue('ACD_2026');
      });
    });

    it('calls useGetAcdUploadHistoryQuery with search parameter', async () => {
      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      const searchBar = screen.getByTestId('search-bar');
      fireEvent.change(searchBar, { target: { value: 'test' } });

      await waitFor(() => {
        expect(useGetAcdUploadHistoryQuery).toHaveBeenCalledWith({
          uic: mockCurrentUic,
          search: 'test',
        });
      });
    });

    it('calls useGetAcdUploadHistoryQuery without search when empty', () => {
      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      expect(useGetAcdUploadHistoryQuery).toHaveBeenCalledWith({
        uic: mockCurrentUic,
        search: undefined,
      });
    });
  });

  describe('Download Functionality', () => {
    it('triggers download when file name link is clicked', async () => {
      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      const fileName = screen.getByText('ACD_2026_02_04.txt');
      fireEvent.click(fileName);

      await waitFor(() => {
        expect(mockTriggerDownload).toHaveBeenCalledWith({
          id: 1,
          fileName: 'ACD_2026_02_04.txt',
        });
      });
    });

    it('prevents default link behavior on click', async () => {
      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      const fileName = screen.getByText('ACD_2026_02_04.txt');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

      fileName.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('handles download error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Download failed');

      mockTriggerDownload.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue(mockError),
      });

      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      const fileName = screen.getByText('ACD_2026_02_04.txt');
      fireEvent.click(fileName);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Download failed:', mockError);
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Query Hook Integration', () => {
    it('calls useAppSelector to get current UIC', () => {
      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      expect(useAppSelector).toHaveBeenCalled();
    });

    it('calls useGetAcdUploadHistoryQuery with current UIC', () => {
      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      expect(useGetAcdUploadHistoryQuery).toHaveBeenCalledWith({
        uic: mockCurrentUic,
        search: undefined,
      });
    });

    it('calls useDownloadAcdFileMutation', () => {
      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      expect(useDownloadAcdFileMutation).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('renders empty table when no data', () => {
      (useGetAcdUploadHistoryQuery as any).mockReturnValue({
        data: { items: [] },
        isLoading: false,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      const table = screen.getByTestId('pmx-table');
      expect(table).toHaveAttribute('data-rows', '0');
    });

    it('renders table when data is undefined', () => {
      (useGetAcdUploadHistoryQuery as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdHistory />
        </ThemedTestingComponent>,
      );

      expect(screen.getByTestId('pmx-table-wrapper')).toBeInTheDocument();
    });
  });
});
