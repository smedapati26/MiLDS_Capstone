import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, it, vi } from 'vitest';

import { Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import { PmxTableProps } from '@components/PmxTable';
import { ITasks } from '@features/task-explorer';
import TaskExplorerTable from '@features/task-explorer/components/TaskExplorerTable';
import { useGetAllMOSQuery } from '@store/amap_ai/mos_code';
import { readinessApiSlice } from '@store/amap_ai/readiness';
import { tasksApiSlice } from '@store/amap_ai/tasks/slices/tasksApi';

// Mock PmxTable to observe props
vi.mock('@components/PmxTable', () => ({
  PmxTable: vi.fn(({ data }) => (
    <Box>
      <div>Mock Table Rendered</div>
      <div>Rows: {data.length}</div>
      {data.map((row: ITasks) => (
        <div key={row.taskNumber}>{row.taskTitle}</div>
      ))}
    </Box>
  )),
}));

vi.mock('@store/amap_ai/mos_code', async () => {
  const actual = await vi.importActual<typeof import('@store/amap_ai/mos_code')>('@store/amap_ai/mos_code');
  return {
    ...actual,
    useGetAllMOSQuery: vi.fn(),
  };
});

const mockStore = configureStore({
  reducer: {
    [tasksApiSlice.reducerPath]: tasksApiSlice.reducer,
    [readinessApiSlice.reducerPath]: readinessApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(readinessApiSlice.middleware).concat(tasksApiSlice.middleware),
});

const renderWithProviders = (ui: React.ReactElement) => {
  render(
    <Provider store={mockStore}>
      <ThemeProvider theme={createTheme()}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>{ui}</MemoryRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>,
  );
};

describe('TaskExplorerTable (Generic)', () => {
  let tableProps: PmxTableProps<ITasks, object>;

  const mockTasks: ITasks[] = [
    {
      taskNumber: '001',
      taskTitle: 'Engine Diagnostics',
      mosCode: '91B',
      ictlId: 1001,
      ictlTitle: 'Powertrain Systems',
      proponent: 'Ordnance',
      unit: 'Alpha Company',
      skillLevel: 'SL3',
      targetAudience: 'Mechanics',
      status: 'Published',
      pdfUrl: 'https://example.com/task001.pdf',
      unitTaskPdf: null,
      trainingLocation: 'Fort Liberty',
      frequency: 'Monthly',
      subjectArea: 'Mechanical',
    },
    {
      taskNumber: '002',
      taskTitle: 'Flight Control Inspection',
      mosCode: '15F',
      ictlId: 1002,
      ictlTitle: 'Avionics Maintenance',
      proponent: 'Aviation Branch',
      unit: 'Bravo Company',
      skillLevel: 'SL2',
      targetAudience: 'Technicians',
      status: 'Draft',
      pdfUrl: 'https://example.com/task002.pdf',
      unitTaskPdf: 'https://example.com/unit-task002.pdf',
      trainingLocation: 'Fort Rucker',
      frequency: 'Weekly',
      subjectArea: 'Aviation',
    },
  ];

  beforeEach(() => {
    tableProps = {
      data: mockTasks,
      columns: [{ field: 'taskTitle', header: 'Task Title' }],
      isLoading: false,
      getRowId: (task) => task.taskNumber,
      tablePage: 0,
      tableRowsPerPage: 10,
      count: mockTasks.length,
      onPageChange: vi.fn(),
      onRowsPerPageChange: vi.fn(),
    };
    (useGetAllMOSQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ mos: 'MOS1' }, { mos: 'MOS2' }],
      isLoading: false,
    });
  });

  it('renders task rows using generic types', () => {
    renderWithProviders(
      <TaskExplorerTable
        tableProps={tableProps}
        query={''}
        setQuery={vi.fn()}
        selectedMOS={[]}
        setSelectedMOS={vi.fn()}
        skillLevel={[]}
        setSkillLevel={vi.fn()}
        proponent={[]}
        setProponent={vi.fn()}
      />,
    );

    expect(screen.getByText('Mock Table Rendered')).toBeInTheDocument();
    expect(screen.getByText('Rows: 2')).toBeInTheDocument();
    expect(screen.getByText('Engine Diagnostics')).toBeInTheDocument();
    expect(screen.getByText('Flight Control Inspection')).toBeInTheDocument();
  });
});
