/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';

import TaskExplorerFilters from '@features/task-explorer/components/TaskExplorerFilters';
import { useGetAllMOSQuery } from '@store/amap_ai/mos_code';
import { readinessApiSlice } from '@store/amap_ai/readiness';

vi.mock('@store/amap_ai/mos_code', async () => {
  const actual = await vi.importActual<typeof import('@store/amap_ai/mos_code')>('@store/amap_ai/mos_code');
  return {
    ...actual,
    useGetAllMOSQuery: vi.fn(),
  };
});

const mockStore = configureStore({
  reducer: {
    [readinessApiSlice.reducerPath]: readinessApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(readinessApiSlice.middleware),
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

const mockColumns = [
  { field: 'taskNumber', header: 'Task #' },
  { field: 'taskTitle', header: 'Task Title' },
  { field: 'trainingLocation', header: 'Training Location' },
  { field: 'frequency', header: 'Frequency' },
  { field: 'subjectArea', header: 'Subject Area' },
  { field: 'proponent', header: 'Proponent' },
  { field: 'skillLevel', header: 'SL' },
  { field: 'mosCode', header: 'MOS' },
  { field: 'unit', header: 'Unit' },
];

describe('TaskExplorerFilters Component', () => {
  const setQuery = vi.fn();
  const setSelectedMOS = vi.fn();
  const setSkillLevel = vi.fn();
  const setProponent = vi.fn();

  const mockExportData = [{ taskTitle: 'Engine Diagnostics' }];

  beforeEach(() => {
    (useGetAllMOSQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ mos: '91B' }, { mos: '15F' }],
      isLoading: false,
    });
  });

  it('renders all components correctly', () => {
    renderWithProviders(
      <TaskExplorerFilters
        query="initial"
        setQuery={setQuery}
        selectedMOS={[]}
        setSelectedMOS={setSelectedMOS}
        skillLevel={[]}
        setSkillLevel={setSkillLevel}
        proponent={[]}
        setProponent={setProponent}
        fileTitle="tasks"
        // @ts-expect-error
        columns={mockColumns}
        exportData={mockExportData}
      />,
    );

    const mosLabel = screen.getAllByLabelText(/MOS/i);
    expect(mosLabel.length).toBeGreaterThan(0);

    const skillLabel = screen.getAllByLabelText(/Skill Level/i);
    expect(skillLabel.length).toBeGreaterThan(0);

    const proponentLabel = screen.getAllByLabelText(/Proponent/i);
    expect(proponentLabel.length).toBeGreaterThan(0);

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByLabelText('export-btn')).toBeInTheDocument();
  });

  it('updates the query when typing in the search input', () => {
    renderWithProviders(
      <TaskExplorerFilters
        query="initial"
        setQuery={setQuery}
        selectedMOS={[]}
        setSelectedMOS={setSelectedMOS}
        skillLevel={[]}
        setSkillLevel={setSkillLevel}
        proponent={[]}
        setProponent={setProponent}
        fileTitle="tasks"
        // @ts-expect-error
        columns={mockColumns}
        exportData={mockExportData}
      />,
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'New Query' } });
  });
});
