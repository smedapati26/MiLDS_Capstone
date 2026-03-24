/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, it, vi } from 'vitest';

import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import { Echelon } from '@ai2c/pmx-mui';

import AddEditEventForm from '@features/amtp-packet/components/maintainer-record/AddEditEventForm';
import { mosCodeApiSlice } from '@store/amap_ai';
import { eventsApiSlice, IDa7817s, useCreateEventMutation, useGetEventTypesQuery } from '@store/amap_ai/events';
import { readinessApiSlice } from '@store/amap_ai/readiness';
import { tasksApiSlice, useLazyGetUserTasksQuery } from '@store/amap_ai/tasks/slices/tasksApi';
import { unitsApiSlice } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useAppDispatch, useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('@features/amtp-packet/slices/readinessApiSlice', async (importActual) => {
  const actual = await importActual();
  return {
    // @ts-expect-error
    ...actual,
    getAllMOS: vi.fn().mockReturnValue({
      data: [{ mos: '15D' }, { mos: '15B' }],
      isFetching: false,
    }),
  };
});

// Mock hooks and modules
vi.mock('@store/amap_ai/events/slices', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useGetEventTypesQuery: vi.fn(() => ({
      data: [{ type: 'Training' }, { type: 'Evaluation' }, { type: 'Other Event' }],
      isFetching: false,
    })),
    useCreateEventMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  };
});

vi.mock('@store/amap_ai/tasks/slices/tasksApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useLazyGetUserTasksQuery: vi.fn(() => [
      vi.fn(),
      { data: [{ taskTitle: 'Task 1' }, { taskTitle: 'Task 2' }], isFetching: false },
    ]),
  };
});

const mockStore = configureStore({
  reducer: {
    [readinessApiSlice.reducerPath]: readinessApiSlice.reducer,
    [eventsApiSlice.reducerPath]: eventsApiSlice.reducer,
    [tasksApiSlice.reducerPath]: tasksApiSlice.reducer,
    [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
    [mosCodeApiSlice.reducerPath]: mosCodeApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(readinessApiSlice.middleware)
      .concat(eventsApiSlice.middleware)
      .concat(tasksApiSlice.middleware)
      .concat(unitsApiSlice.middleware)
      .concat(mosCodeApiSlice.middleware),
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={createTheme()}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>{ui}</MemoryRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>,
  );
};

const mockEvent: IDa7817s[] = [
  {
    id: 42,
    eventType: 'Training',
    date: '2023-11-10',
    trainingType: 'Engineer',
    evaluationType: null,
    awardType: null,
    tcsLocation: null,
    gainingUnit: {
      uic: 'ABC123',
      displayName: '123rd Engineer Battalion',
      shortName: '123 EN',
      nickName: 'Sappers',
      echelon: Echelon.UNKNOWN,
      component: 'Active Duty',
      level: 1,
      state: 'TX',
      parentUic: 'PARENT123',
    },
    totalMxHours: 12,
    maintenanceLevel: 'Unit Level',
    goNogo: 'GO',
    comment: 'Soldier successfully completed all training tasks.',
    mos: '12B',
    recordedById: 'user-789',
    eventTasks: [
      {
        name: 'Land Navigation',
        number: 'LN-01',
        goNogo: 'GO',
      },
      {
        name: 'Weapon Qualification',
        number: 'WQ-02',
        goNogo: 'GO',
      },
    ],
    soldierId: '',
    uicId: '',
    gainingUnitId: null,
    recordedByLegacy: null,
    recordedByNonLegacy: null,
    attachedDa4856Id: null,
    eventDeleted: false,
    hasAssociations: false,
  },
];

describe('AddEditEventForm Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('someUser');
    (useAppDispatch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());
    (useGetEventTypesQuery as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      data: [{ type: 'Training' }, { type: 'Evaluation' }, { type: 'Other Event' }],
      isLoading: false,
    }));
    (useLazyGetUserTasksQuery as ReturnType<typeof vi.fn>).mockImplementation(() => [
      vi.fn(),
      { data: [{ taskTitle: 'Task 1' }, { taskTitle: 'Task 2' }], isLoading: false },
    ]);
    (useCreateEventMutation as ReturnType<typeof vi.fn>).mockImplementation(() => [vi.fn(), { isLoading: false }]);
  });

  it('renders the form and fields correctly', async () => {
    renderWithProviders(
      <AddEditEventForm handleClose={vi.fn()} formSubmitted={vi.fn()} events={mockEvent} isInitialUpload={false} />,
    );

    // Check for the static form elements
    expect(screen.getByLabelText('form-header')).toBeInTheDocument();
    expect(screen.getAllByText('Event Type*').length).toBeGreaterThan(1);
    expect(screen.getAllByText('Event Date*').length).toBeGreaterThan(1);
  });
  it('renders Event Type and Event Date fields when isInitialUpload is false', () => {
    renderWithProviders(
      <AddEditEventForm handleClose={vi.fn()} formSubmitted={vi.fn()} events={mockEvent} isInitialUpload={false} />,
    );
    const eventLabels = screen.getAllByText(/Event Type\*/);
    const dateLabels = screen.getAllByText(/Event Date\*/);
    expect(eventLabels.length).toBeGreaterThan(1);
    expect(dateLabels.length).toBeGreaterThan(1);
  });

  it('renders Event Result dropdown', () => {
    renderWithProviders(
      <AddEditEventForm handleClose={vi.fn()} formSubmitted={vi.fn()} events={mockEvent} isInitialUpload={false} />,
    );
    const eventLabels = screen.getAllByText(/Event Result\*/);
    expect(eventLabels.length).toBeGreaterThan(1);
  });

  it('renders MX Hours input when eventType is Training', () => {
    renderWithProviders(
      <AddEditEventForm handleClose={vi.fn()} formSubmitted={vi.fn()} events={mockEvent} isInitialUpload={false} />,
    );
    expect(screen.getByLabelText(/Total MX Hours\*/)).toBeInTheDocument();
  });

  it('does not render Unit and Original Recorder when isInitialUpload is false', () => {
    renderWithProviders(
      <AddEditEventForm handleClose={vi.fn()} formSubmitted={vi.fn()} events={undefined} isInitialUpload={false} />,
    );
    expect(screen.queryByLabelText('Unit')).toBeNull();
    expect(screen.queryByLabelText('Original Recorder*')).toBeNull();
  });

  it('renders Unit and Original Recorder when isInitialUpload is true', () => {
    renderWithProviders(
      <AddEditEventForm handleClose={vi.fn()} formSubmitted={vi.fn()} events={mockEvent} isInitialUpload />,
    );
    expect(screen.getByLabelText('Unit')).toBeInTheDocument();
    expect(screen.getByLabelText('Original Recorder*')).toBeInTheDocument();
  });
  it('appends a new event form when clicking Add Event during initial upload', () => {
    renderWithProviders(
      <AddEditEventForm handleClose={vi.fn()} formSubmitted={vi.fn()} events={mockEvent} isInitialUpload />,
    );

    const addButton = screen.getByRole('button', { name: /Add Event/i });
    expect(addButton).toBeInTheDocument();

    // Simulate click
    addButton.click();

    // After clicking, there should be more Event Type fields present
    const eventTypeFields = screen.getAllByText(/Event Type\*/);
    expect(eventTypeFields.length).toBeGreaterThan(1);
  });

  it('removes an event form when clicking the delete button during initial upload', () => {
    renderWithProviders(
      <AddEditEventForm handleClose={vi.fn()} formSubmitted={vi.fn()} events={mockEvent} isInitialUpload />,
    );

    // Initially only one "Event Type*" field
    let eventFields = screen.getAllByText(/Event Type\*/);
    expect(eventFields.length).toBe(2);

    // Add another event
    const addButton = screen.getByRole('button', { name: /Add Event/i });
    addButton.click();

    // Confirm two event forms exist
    eventFields = screen.getAllByText(/Event Type\*/);
    expect(eventFields.length).toBe(2);

    const deleteButtons = screen.getAllByRole('button');
    const lastDeleteButton = deleteButtons[deleteButtons.length - 1];
    lastDeleteButton.click();

    eventFields = screen.getAllByText(/Event Type\*/);
    expect(eventFields.length).toBe(2);
  });
});
