/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { mockAppUser } from 'vitest/mocks/handlers/app_user/mock_data';

import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';

import { Column } from '@ai2c/pmx-mui';

import { AmtpTable } from '@features/amtp-packet/components/tables/AmtpTable';
import { counselingCols, supportingDocumentsCols } from '@features/amtp-packet/constants';
import { mosCodeApiSlice } from '@store/amap_ai';
import { IDA4856 } from '@store/amap_ai/counselings';
import { ICtlsColumns } from '@store/amap_ai/readiness/models';
import { readinessApiSlice } from '@store/amap_ai/readiness/slices/readinessApi';
import { ISoldierFlag } from '@store/amap_ai/soldier_flag/models';
import { SupportingDocument, supportingDocumentApiSlice } from '@store/amap_ai/supporting_documents';
import { unitsApiSlice } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@utils/helpers/dataTransformer', () => ({
  convertToSnakeCase: (str: string) => str.replace(/\s+/g, '_').toLowerCase(),
}));

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

// Helper function to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={createTheme()}>
        <MemoryRouter>{ui}</MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );
};

describe('AmtpTable Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('someUser');
  });
  const mockTableProps = {
    data: [
      {
        id: 1,
        name: 'John Doe',
        mos: 'MOS1',
        ictlIctlTitle: 'ICTL Title 1',
        taskNumber: '001',
        taskTitle: 'Task Title 1',
        frequency: 'Daily',
      },
      {
        id: 2,
        name: 'Jane Smith',
        mos: 'MOS2',
        ictlIctlTitle: 'ICTL Title 2',
        taskNumber: '002',
        taskTitle: 'Task Title 2',
        frequency: 'Weekly',
      },
      {
        id: 3,
        name: 'Jim Brown',
        mos: 'MOS3',
        ictlIctlTitle: 'ICTL Title 3',
        taskNumber: '003',
        taskTitle: 'Task Title 3',
        frequency: 'Monthly',
      },
    ],
    columns: [
      { field: 'id', header: 'ID' },
      { field: 'name', header: 'Name' },
      { field: 'mos', header: 'MOS' },
      { field: 'ictlIctlTitle', header: 'ICTL Title' },
      { field: 'taskNumber', header: 'Task Number' },
      { field: 'taskTitle', header: 'Task Title' },
      { field: 'frequency', header: 'Frequency' },
    ] as Column<ICtlsColumns>[],
    getRowId: (row: { id: number }) => row.id.toString(),
    tableTitle: 'TestTable',
  };

  const mockSupportingDocumentsTableProps = {
    data: [
      {
        id: 1,
        soldier: mockAppUser,
        uploadedBy: 'CPT Testy MeGee',
        uploadDate: '05/11/2025',
        documentDate: '05/11/2025',
        doucmentTitle: 'Test Doc1',
        documentType: 'Test Type1',
        relatedEvent: { id: 1, date: '05/01/2025', eventType: 'Test Event Type 1' },
        relatedDesignation: 'Test Designation 1',
        visibleToUser: true,
      },
      {
        id: 2,
        soldier: mockAppUser,
        uploadedBy: 'CPT Tester MeGeer',
        uploadDate: '01/01/2025',
        documentDate: '01/01/2025',
        doucmentTitle: 'Test Doc2',
        documentType: 'Test Type2',
        relatedEvent: { id: 2, date: '01/01/2025', eventType: 'Test Event Type 2' },
        relatedDesignation: 'Test Designation 2',
        visibleToUser: true,
      },
    ],
    columns: supportingDocumentsCols() as Column<SupportingDocument>[],
    getRowId: (row: { documentTitle: string }) => row.documentTitle,
    tableTitle: 'TestTable',
  };

  const mockCounselingsTableProps = {
    data: [
      {
        id: 1,
        date: '01/01/2025',
        title: 'Counceling 1',
        uploadedBy: 'CPT Testy MeGee',
        associatedEvent: { id: 1, date: '02/02/2025', eventType: 'Training', eventSubType: 'TCS' },
      },
      {
        id: 1,
        date: '03/03/2025',
        title: 'Counceling 2',
        uploadedBy: 'CPT Tester MeGeer',
        associatedEvent: { id: 2, date: '04/04/2025', eventType: 'Test Event Type 2', eventSubType: 'Sub Type 2' },
      },
    ],
    columns: counselingCols() as Column<IDA4856>[],
    getRowId: (row: { documentTitle: string }) => row.documentTitle,
    tableTitle: 'TestTable',
  };

  const mockSoldierFlagsTableProps = {
    data: [
      {
        id: 1,
        active: true,
        soldierId: 1234567890,
        soldierName: 'Testest MeGeest',
        flagType: 'Flag Type 1',
        flagInfo: 'Flag Info',
        mxAvailability: 'Available',
        flagRemarks: 'Flag Remarks',
        unitName: 'Test Unit',
        unitUic: 'TSTUNIT',
        createdById: '1',
        createdByName: 'CPT Testy MeGee',
        lastModifiedId: '2',
        lastModifiedName: 'Tester MeGeer',
        startDate: '01/01/2025',
        endDate: '02/01/2025',
      },
      {
        id: 2,
        active: true,
        soldierId: 1234567890,
        soldierName: 'Testest MeGeest',
        flagType: 'Flag Type 2',
        flagInfo: 'Flag Info 2',
        mxAvailability: 'Unavailable',
        flagRemarks: 'Flag Remarks 2',
        unitName: 'Test Unit 2',
        unitUic: 'TSTUNIT2',
        createdById: '2',
        createdByName: 'Testeer MeGeer',
        lastModifiedId: '3',
        lastModifiedName: 'Testester MeGeester',
        startDate: '01/01/2024',
        endDate: '02/01/2024',
      },
    ],
    columns: counselingCols() as Column<ISoldierFlag>[],
    getRowId: (row: { documentTitle: string }) => row.documentTitle,
    tableTitle: 'TestTable',
  };

  it('renders the table with all data initially', () => {
    //@ts-expect-error
    renderWithProviders(<AmtpTable tableProps={mockTableProps} />);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4); // Includes header row
  });

  it('filters data based on query', () => {
    //@ts-expect-error
    renderWithProviders(<AmtpTable tableProps={mockTableProps} />);

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  // it('filters data based on selected MOS', async () => {
  //   //@ts-expect-error
  //   renderWithProviders(<AmtpTable tableProps={mockTableProps} />);

  //   const dropdown = screen.getByRole('combobox', { name: /MOS/i });
  //   fireEvent.mouseDown(dropdown);

  //   const mosOption = screen.getByText('MOS1');
  //   fireEvent.click(mosOption);

  //   fireEvent.click(dropdown);

  //   await waitFor(() => {
  //   const rows = screen.getAllByRole('row');
  //   expect(rows).toHaveLength(4);
  //   expect(screen.getByText('John Doe')).toBeInTheDocument();
  //   })
  // });

  it('filters data based on combined query and MOS selection', () => {
    //@ts-expect-error
    renderWithProviders(<AmtpTable tableProps={mockTableProps} />);

    // Search for "Jim"
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Jim' } });

    // Open the dropdown
    const dropdown = screen.getByRole('combobox', { name: /MOS/i });
    fireEvent.mouseDown(dropdown);

    // Select "MOS3"
    const mosOption = screen.getByText('MOS3');
    fireEvent.click(mosOption);

    // Debug the rendered DOM to check if rows are present
    screen.debug();

    // Check the rows
    const rows = screen.getAllByRole('row', { hidden: true }); // Use { hidden: true } to include all rows
    expect(rows).toHaveLength(2); // Includes header row

    expect(screen.getByText('Jim Brown')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('renders filters and passes the correct props to AmtpTableFilters', () => {
    //@ts-expect-error
    renderWithProviders(<AmtpTable tableProps={mockTableProps} />);

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();

    const dropdown = screen.getByRole('combobox', { name: /MOS/i });
    expect(dropdown).toBeInTheDocument();
  });

  it('Suppporting Docs Table filters data based on query', () => {
    renderWithProviders(
      //@ts-expect-error
      <AmtpTable tableProps={mockSupportingDocumentsTableProps} filterType={'supporting_documents'} />,
    );

    // Search for "Testy"
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Testy' } });

    // Debug the rendered DOM to check if rows are present
    screen.debug();

    // Check the rows
    const rows = screen.getAllByRole('row', { hidden: true }); // Use { hidden: true } to include all rows
    expect(rows).toHaveLength(2); // Includes header row

    expect(screen.getByText('CPT Testy MeGee')).toBeInTheDocument();
    expect(screen.queryByText('CPT Tester MeGeer')).not.toBeInTheDocument();
  });

  it('Supporting Docs Table renders filters and passes the correct props to AmtpTableFilters', () => {
    renderWithProviders(
      //@ts-expect-error
      <AmtpTable tableProps={mockSupportingDocumentsTableProps} filterType={'supporting_documents'} />,
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();

    // Supporting Docs do not render MOS dropdown filter
    const dropdown = screen.queryByText(/MOS/i);
    expect(dropdown).not.toBeInTheDocument();
  });

  it('Counseling Table filters data based on query', () => {
    //@ts-expect-error
    renderWithProviders(<AmtpTable tableProps={mockCounselingsTableProps} filterType={'counselings'} />);

    // Search for "Testy"
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Testy' } });

    // Debug the rendered DOM to check if rows are present
    screen.debug();

    // Check the rows
    const rows = screen.getAllByRole('row', { hidden: true }); // Use { hidden: true } to include all rows
    expect(rows).toHaveLength(2); // Includes header row

    expect(screen.getByText('CPT Testy MeGee')).toBeInTheDocument();
    expect(screen.queryByText('CPT Tester MeGeer')).not.toBeInTheDocument();
  });

  it('Counseling Table renders filters and passes the correct props to AmtpTableFilters', () => {
    //@ts-expect-error
    renderWithProviders(<AmtpTable tableProps={mockCounselingsTableProps} filterType={'counselings'} />);

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();

    // Counselings do not render MOS dropdown filter
    const dropdown = screen.queryByText(/MOS/i);
    expect(dropdown).not.toBeInTheDocument();
  });

  it('Counseling Table renders filters and passes the correct props to AmtpTableFilter', () => {
    //@ts-expect-error
    renderWithProviders(<AmtpTable tableProps={mockSoldierFlagsTableProps} filterType={'soldier_flags'} />);

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();

    // Counselings do not render MOS dropdown filter
    const dropdown = screen.queryByText(/MOS/i);
    expect(dropdown).not.toBeInTheDocument();
  });
});
