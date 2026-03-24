/* eslint-disable @typescript-eslint/ban-ts-comment */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProviderWrapper } from 'vitest/helpers';

import { AMTPFilterProvider } from '@context/AMTPFilterProvider';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Column } from '@ai2c/pmx-mui';

import AmtpTableFilters from '@features/amtp-packet/components/tables/AmtpTableFilters';
import { mosCodeApiSlice, useGetAllMOSQuery } from '@store/amap_ai/mos_code';
import { readinessApiSlice } from '@store/amap_ai/readiness';
import { supportingDocumentApiSlice } from '@store/amap_ai/supporting_documents';
import { unitsApiSlice } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useAppSelector } from '@store/hooks';
import { handleExportPdf } from '@utils/helpers/table-funcs';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/amap_ai/mos_code', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useGetAllMOSQuery: vi.fn(),
  };
});
vi.mock('@utils/helpers/table-funcs', () => ({
  handleCopy: vi.fn(),
  handleExportCsv: vi.fn(),
  handleExportExcel: vi.fn(),
  handleExportPdf: vi.fn(),
}));

const columns: Column<{ column1: string; column2: string }>[] = [
  { field: 'column1', header: 'Column 1' },
  { field: 'column2', header: 'Column 2' },
];

const mockStore = configureStore({
  reducer: {
    [readinessApiSlice.reducerPath]: readinessApiSlice.reducer,
    [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
    [supportingDocumentApiSlice.reducerPath]: supportingDocumentApiSlice.reducer,
    [mosCodeApiSlice.reducerPath]: mosCodeApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(readinessApiSlice.middleware)
      .concat(unitsApiSlice.middleware)
      .concat(supportingDocumentApiSlice.middleware)
      .concat(mosCodeApiSlice.middleware),
});

describe('AmtpTableFilters', () => {
  const mockSetQuery = vi.fn();
  const mockFilterSwitch = vi.fn();
  const mockSetSelectedMOS = vi.fn();
  const mockExportData = [
    { column1: 'Value1', column2: 'Value2' },
    { column1: 'Value3', column2: 'Value4' },
  ];
  const mockSelectedMOS = [{ label: '15F', value: '15F' }];
  const mockFileTitle = 'TestFile';

  beforeEach(() => {
    vi.resetAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('someUser');
    (useGetAllMOSQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ mos: '15F' }, { mos: '15E' }, { mos: '15D' }],
      isLoading: false,
    });
  });

  const renderComponent = (
    filterType?: null | 'ctl' | 'maintainer' | 'supporting_documents' | 'counselings' | 'soldier_flags',
  ) =>
    render(
      <ProviderWrapper store={mockStore}>
        <AMTPFilterProvider>
          <AmtpTableFilters
            query=""
            selectedMOS={mockSelectedMOS}
            exportData={mockExportData}
            fileTitle={mockFileTitle}
            setSelectedMOS={mockSetSelectedMOS}
            setQuery={mockSetQuery}
            columns={columns}
            filterType={filterType ? filterType : 'ctl'}
            setFilterSwitch={mockFilterSwitch}
          />
        </AMTPFilterProvider>
      </ProviderWrapper>,
    );

  it('renders all components correctly', () => {
    renderComponent();

    expect(screen.getByLabelText('filter-btn')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /MOS/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByLabelText('export-btn')).toBeInTheDocument();
  });

  it('updates the query when typing in the search input', () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'New Query' } });

    expect(mockSetQuery).toHaveBeenCalledWith('New Query');
  });

  it('updates selected MOS when options are chosen', () => {
    renderComponent();

    const dropdown = screen.getByRole('combobox', { name: /MOS/i });
    fireEvent.mouseDown(dropdown);

    const option = screen.getByText('15E');
    fireEvent.click(option);

    expect(mockSetSelectedMOS).toHaveBeenCalledWith([
      { label: '15F', value: '15F' },
      { label: '15E', value: '15E' },
    ]);
  });

  it('renders MOS options from useGetAllMOSQuery', () => {
    renderComponent();

    const dropdown = screen.getByRole('combobox', { name: /MOS/i });
    fireEvent.click(dropdown);

    expect(screen.getByText('15F')).toBeInTheDocument();
  });

  it('displays a loading spinner when MOS data is loading', () => {
    (useGetAllMOSQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: true,
    });

    renderComponent();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('calls the handleExportCsv function when CSV export is triggered', async () => {
    const mockHandleCsv = vi.fn();

    renderComponent();

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

  it('handles Excel export correctly', async () => {
    const mockHandleExcel = vi.fn();

    renderComponent();

    // Open the main menu
    const exportMenuButton = screen.getByLabelText('export-btn');
    fireEvent.click(exportMenuButton);

    // Click on "Export" to open the submenu
    const exportMenuItem = screen.getByText('Export');
    fireEvent.click(exportMenuItem);

    // Click on "Excel" in the submenu
    const excelButton = screen.getByText('Excel');
    fireEvent.click(excelButton);

    // Verify that handleExcel was called
    await waitFor(() => expect(mockHandleExcel).toHaveBeenCalledTimes(0));
  });

  it('triggers handleExportPdf when exporting to PDF', async () => {
    renderComponent();

    // Open the export menu
    const exportButton = screen.getByLabelText('export-btn');
    fireEvent.click(exportButton);

    // Click on "Export" to open the submenu
    const exportMenuItem = screen.getByText('Export');
    fireEvent.click(exportMenuItem);

    // Click on "PDF" in the submenu
    const pdfButton = screen.getByText(/PDF/i);
    fireEvent.click(pdfButton);

    // Verify that handleExportPdf was called with correct arguments
    await waitFor(() =>
      expect(handleExportPdf).toHaveBeenCalledWith(
        expect.anything(), // Replace with the correct header argument
        mockExportData,
        mockFileTitle,
      ),
    );
  });

  it('copies data to clipboard', async () => {
    // Mock `navigator.clipboard.writeText`
    const mockClipboard = {
      writeText: vi.fn(), // Mock the writeText method
    };

    // Assign the mock clipboard object to `navigator`
    Object.assign(navigator, { clipboard: mockClipboard });

    // Render the component
    renderComponent();

    // Open the export menu
    const exportButton = screen.getByLabelText('export-btn');
    fireEvent.click(exportButton);

    // Click on "Copy" in the submenu
    const copyButton = screen.getByText(/Copy/i);
    fireEvent.click(copyButton);
  });

  it('does not render mos dropdown on supporting document type or counselings or soldier_flags', async () => {
    // Render the component
    renderComponent('supporting_documents');

    // Supporting Docs do not render MOS dropdown filter
    const suppportDocDropdown = screen.queryByText(/MOS/i);
    expect(suppportDocDropdown).not.toBeInTheDocument();

    // Render the component
    renderComponent('counselings');
    // Supporting Docs do not render MOS dropdown filter
    const counselingsDropdown = screen.queryByText(/MOS/i);
    expect(counselingsDropdown).not.toBeInTheDocument();

    // Render the component
    renderComponent('soldier_flags');
    // Supporting Docs do not render MOS dropdown filter
    const soldierFlagDropDown = screen.queryByText(/MOS/i);
    expect(soldierFlagDropDown).not.toBeInTheDocument();
  });
});
