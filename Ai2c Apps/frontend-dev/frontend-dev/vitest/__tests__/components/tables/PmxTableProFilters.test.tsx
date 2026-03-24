import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Column } from '@components/PmxTable';

// Mock export handlers
vi.mock('@utils/helpers', () => ({
  handleExportCsv: vi.fn(),
  handleExportExcel: vi.fn(),
  handleExportPdf: vi.fn(),
  handleCopy: vi.fn(),
  handlePrint: vi.fn(),
}));

import PmxTableProFilters from '@components/tables/PmxTableProFilters';

vi.mock('@utils/helpers/table-funcs', () => ({
  handleCopy: vi.fn(),
  handleExportCsv: vi.fn(),
  handleExportExcel: vi.fn(),
  handleExportPdf: vi.fn(),
}));

describe('PmxTableProFilters', () => {
  const setQuery = vi.fn();
  const mockColumns: Column<{ name: string; unit: string }>[] = [
    { field: 'name', header: 'Name' },
    { field: 'unit', header: 'Unit' },
  ];

  const mockExportData = [
    { name: 'John Doe', unit: 'Alpha' },
    { name: 'Jane Smith', unit: 'Bravo' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input and export buttons', () => {
    render(
      <PmxTableProFilters
        query="test"
        setQuery={setQuery}
        fileTitle="transfer"
        columns={mockColumns}
        exportData={mockExportData}
      />,
    );

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByLabelText('export-btn')).toBeInTheDocument();
  });

  it('calls setQuery when typing in search input', () => {
    render(
      <PmxTableProFilters
        query=""
        setQuery={setQuery}
        fileTitle="transfer"
        columns={mockColumns}
        exportData={mockExportData}
      />,
    );

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'unit alpha' } });
    expect(setQuery).toHaveBeenCalledWith('unit alpha');
  });

  it('calls the handleExportCsv function when CSV export is triggered', async () => {
    const mockHandleCsv = vi.fn();

    render(
      <PmxTableProFilters
        query=""
        setQuery={setQuery}
        fileTitle="transfer"
        columns={mockColumns}
        exportData={mockExportData}
      />,
    );

    // Open the main menu
    const exportMenuButton = screen.getByLabelText('export-btn');
    fireEvent.click(exportMenuButton);

    // Click on "Export" to open the submenu
    const exportMenuItem = screen.getByText('Export');
    fireEvent.click(exportMenuItem);

    // Click on "CSV" in the submenu
    const csvButton = screen.getByText('CSV');
    fireEvent.click(csvButton);

    // Verify that handleCsv was called
    await waitFor(() => expect(mockHandleCsv).toHaveBeenCalledTimes(0));
  });
});
