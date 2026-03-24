import React from 'react';
import dayjs from 'dayjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { ColumnConfig, PmxTable } from '@components/data-tables/PmxTable';

import { IAircraftDto } from '@store/griffin_api/aircraft/models';

import { ThemedTestingComponent } from '@vitest/helpers/ThemedTestingComponent';

export const rows: IAircraftDto[] = [
  { aircraft_model: 'Model A', aircraft_family: 'Family 2', serial: 'SN152', aircraft_mds: 'mds two' },
  { aircraft_model: 'Model A', aircraft_family: 'Family 3', serial: 'SN346', aircraft_mds: 'mds three' },
  { aircraft_model: 'Model A', aircraft_family: 'BLACK HAWK', serial: 'SN123', aircraft_mds: 'mds one' },
  { aircraft_model: 'Model B', aircraft_family: 'BLACK HAWK', serial: 'SN456', aircraft_mds: 'mds four' },
  { aircraft_model: 'Model B', aircraft_family: 'Family 2', serial: 'SN623', aircraft_mds: 'mds five' },
  { aircraft_model: 'Model C', aircraft_family: 'BLACK HAWK', serial: 'SN196', aircraft_mds: 'mds six' },
  { aircraft_model: 'Model C', aircraft_family: 'Family 3', serial: 'SN964', aircraft_mds: 'mds seven' },
];

const columns: ColumnConfig<IAircraftDto>[] = [
  { key: 'serial', label: 'Serial', sortable: true },
  { key: 'aircraft_model', label: 'Model', sortable: false },
  { key: 'aircraft_family', label: 'Family', sortable: true, renderHeader: () => <strong>Aircraft Family</strong> },
  { key: 'aircraft_mds', label: 'MDS', sortable: false, render: (value) => value.toUpperCase() },
];

// Helper function to render component with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemedTestingComponent>{component}</ThemedTestingComponent>);
};

describe('PmxTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the table with correct headers', () => {
      renderWithTheme(<PmxTable rows={rows} columns={columns} />);

      // Check if all column headers are rendered
      expect(screen.getByText('Serial')).toBeInTheDocument();
      expect(screen.getByText('Model')).toBeInTheDocument();
      expect(screen.getByText('Aircraft Family')).toBeInTheDocument();
      expect(screen.getByText('MDS')).toBeInTheDocument();
    });

    it('should render custom header when renderHeader is provided', () => {
      renderWithTheme(<PmxTable rows={rows} columns={columns} />);

      // Check if custom header is rendered
      const customHeader = screen.getByText('Aircraft Family');
      expect(customHeader.tagName).toBe('STRONG');
    });

    it('should render table data correctly', () => {
      renderWithTheme(<PmxTable rows={rows} columns={columns} />);

      // Check if data is rendered
      expect(screen.getAllByText('Model A')[0]).toBeInTheDocument();
      expect(screen.getAllByText('BLACK HAWK')[0]).toBeInTheDocument();
      expect(screen.getByText('SN123')).toBeInTheDocument();
    });

    it('should apply custom styles when sx prop is provided', () => {
      const customStyles = { backgroundColor: 'red' };

      renderWithTheme(<PmxTable rows={rows} columns={columns} sx={customStyles} />);

      // The sx prop should be applied to the TableContainer
      const tableContainer = screen.getByRole('table').closest('.MuiPaper-root');
      expect(tableContainer).toBeInTheDocument();
    });
  });

  describe('Custom Rendering', () => {
    it('should use custom render function for cells', () => {
      renderWithTheme(<PmxTable rows={rows} columns={columns} />);

      // Check if custom date rendering works
      expect(screen.getByText('MDS ONE')).toBeInTheDocument();
    });
  });

  describe('Sorting Functionality', async () => {
    it('should show sort controls for sortable columns', () => {
      renderWithTheme(<PmxTable rows={rows} columns={columns} />);

      // Check if sortable columns have sort buttons
      const serialHeader = screen.getByText('Serial').closest('span');
      const modelHeader = screen.getByText('Model');

      expect(serialHeader?.closest('.MuiTableSortLabel-root')).toBeInTheDocument();
      expect(modelHeader.closest('.MuiTableSortLabel-root')).not.toBeInTheDocument();
    });
  });

  describe('Pagination Functionality', () => {
    it('should render pagination controls', () => {
      renderWithTheme(<PmxTable paginate rows={rows} columns={columns} />);

      // Check if pagination is rendered
      expect(screen.getByText('Rows per page:')).toBeInTheDocument();
    });

    it('should show correct number of rows per page', () => {
      renderWithTheme(<PmxTable rows={rows} columns={columns} />);

      // With 5 and default 10 rows per page, all should be visible
      const tableRows = screen.getAllByRole('row');
      // 1 header row + 7 data rows = 6 total
      expect(tableRows).toHaveLength(8);
    });

    it('should paginate when there are more rows than rows per page', () => {
      // Create more test data
      const factoryRows = Array.from({ length: 25 }, (_, i) => ({
        aircraft_model: `Model ${i + 1}`,
        aircraft_family: `Family ${i + 1}`,
        serial: `SN${(i + 1).toString().padStart(3, '0')}`,
        aircraft_mds: `MDS ${i + 1}`,
      }));

      renderWithTheme(<PmxTable paginate rows={factoryRows} columns={columns} limit={10} />);

      // Should show 10 rows + 1 header = 11 total
      const tableRows = screen.getAllByRole('row');
      expect(tableRows).toHaveLength(11);

      // Should show pagination info
      expect(screen.getByText('1–10 of 25')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data gracefully', () => {
      renderWithTheme(<PmxTable paginate rows={[]} columns={columns} />);

      // Should still render headers
      expect(screen.getByText('Model')).toBeInTheDocument();

      // Should show 0 rows in pagination
      expect(screen.getByText('0–0 of 0')).toBeInTheDocument();
    });

    it('should handle mixed data types in sorting', () => {
      const mixedData = [
        { id: 1, value: 'string' },
        { id: 2, value: 42 },
        { id: 3, value: dayjs() },
      ];

      const mixedColumns: ColumnConfig<(typeof mixedData)[0]>[] = [
        { key: 'value', label: 'Mixed Value', sortable: true },
      ];

      renderWithTheme(<PmxTable rows={mixedData} columns={mixedColumns} />);

      // Should render without crashing
      expect(screen.getByText('string')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render no columns when columns array is empty', () => {
      renderWithTheme(<PmxTable rows={rows} columns={[]} />);

      // Table should render with no headers or data
      expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should render skeleton loaders when isLoading is true', () => {
      const { container } = renderWithTheme(<PmxTable rows={rows} columns={columns} isLoading={true} />);

      // Check if skeletons are rendered
      const skeletons = container.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not render data rows when isLoading is true', () => {
      renderWithTheme(<PmxTable rows={rows} columns={columns} isLoading={true} />);

      // Data should not be visible
      expect(screen.queryByText('SN123')).not.toBeInTheDocument();
    });

    it('should render data rows when isLoading is false', () => {
      renderWithTheme(<PmxTable rows={rows} columns={columns} isLoading={false} />);

      // Data should be visible
      expect(screen.getByText('SN123')).toBeInTheDocument();
    });

    it('should render "No data" when rows are empty and not loading', () => {
      renderWithTheme(<PmxTable rows={[]} columns={columns} isLoading={false} />);

      expect(screen.getByText('No data')).toBeInTheDocument();
    });

    it('should not render "No data" when isLoading is true even if rows are empty', () => {
      renderWithTheme(<PmxTable rows={[]} columns={columns} isLoading={true} />);

      expect(screen.queryByText('No data')).not.toBeInTheDocument();
    });

    it('should transition from loading to loaded state', () => {
      const { rerender } = renderWithTheme(<PmxTable rows={[]} columns={columns} limit={10} isLoading={true} />);

      // Initially, skeletons should be visible
      expect(screen.getAllByRole('row')).toHaveLength(11); // Skeleton rows

      // Transition to loaded state
      rerender(<PmxTable rows={rows} columns={columns} isLoading={false} />);

      // Skeletons should disappear, and data rows should be visible
      expect(screen.getByText('SN123')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for sorting', () => {
      renderWithTheme(<PmxTable rows={rows} columns={columns} />);

      // Check if sortable columns have proper ARIA attributes
      const serialHeader = screen.getByText('Serial').closest('.MuiTableSortLabel-root');
      expect(serialHeader).toHaveAttribute('role', 'button');
    });

    it('should have proper table structure', () => {
      renderWithTheme(<PmxTable rows={rows} columns={columns} />);

      // Check table structure
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(4);
      expect(screen.getAllByRole('row')).toHaveLength(8); // 1 header + 7 data rows
    });
  });
});

describe('Pagination Functionality', () => {
  it('should render pagination controls', () => {
    renderWithTheme(<PmxTable paginate rows={rows} columns={columns} />);

    // Check if pagination is rendered
    expect(screen.getByText('Rows per page:')).toBeInTheDocument();
  });

  it('should show correct number of rows per page', () => {
    renderWithTheme(<PmxTable rows={rows} columns={columns} />);

    // With 5 and default 10 rows per page, all should be visible
    const tableRows = screen.getAllByRole('row');
    // 1 header row + 7 data rows = 6 total
    expect(tableRows).toHaveLength(8);
  });

  it('should paginate when there are more rows than rows per page', () => {
    // Create more test data
    const factoryRows = Array.from({ length: 25 }, (_, i) => ({
      aircraft_model: `Model ${i + 1}`,
      aircraft_family: `Family ${i + 1}`,
      serial: `SN${(i + 1).toString().padStart(3, '0')}`,
      aircraft_mds: `MDS ${i + 1}`,
    }));

    renderWithTheme(<PmxTable paginate rows={factoryRows} columns={columns} limit={10} />);

    // Should show 10 rows + 1 header = 11 total
    const tableRows = screen.getAllByRole('row');
    expect(tableRows).toHaveLength(11);

    // Should show pagination info
    expect(screen.getByText('1–10 of 25')).toBeInTheDocument();
  });
});

describe('Dynamic Updates', () => {
  it('should update the table when rows are updated dynamically', () => {
    const { rerender } = renderWithTheme(<PmxTable rows={rows.slice(0, 3)} columns={columns} />);

    // Initially, only 3 rows should be rendered
    expect(screen.getAllByRole('row')).toHaveLength(4); // 1 header + 3 data rows

    // Update rows dynamically
    rerender(<PmxTable rows={rows} columns={columns} />);

    // Now, all rows should be rendered
    expect(screen.getAllByRole('row')).toHaveLength(8); // 1 header + 7 data rows
  });
});
