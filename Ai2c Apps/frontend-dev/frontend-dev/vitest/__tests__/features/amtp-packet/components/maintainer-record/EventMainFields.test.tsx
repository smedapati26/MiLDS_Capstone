/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useForm } from 'react-hook-form';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import { IMultiEventForm } from '@features/amtp-packet/components/maintainer-record/AddEditEventForm';
import EventMainFields from '@features/amtp-packet/components/maintainer-record/EventMainFields';
import { EventType } from '@store/amap_ai/events';
import { eventsApiSlice, useGetEventTypesQuery } from '@store/amap_ai/events/slices';
import { tasksApiSlice } from '@store/amap_ai/tasks/slices/tasksApi';
import { unitsApiSlice } from '@store/amap_ai/units/slices/unitsApiSlice';
import { userApiSlice } from '@store/amap_ai/user/slices/userApi';
import { useAppSelector } from '@store/hooks';

// 🧪 Mock Redux selector
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

// 🧪 Mock the event types query
vi.mock('@store/amap_ai/events/slices', async (importActual) => {
  const actual = await importActual();
  return {
    // @ts-expect-error
    ...actual,
    useGetEventTypesQuery: vi.fn().mockReturnValue({
      data: [{ type: 'Training' }, { type: 'Evaluation' }],
      isFetching: false,
    }),
  };
});

// 🏪 Create Redux store
const mockStore = configureStore({
  reducer: {
    [userApiSlice.reducerPath]: userApiSlice.reducer,
    [eventsApiSlice.reducerPath]: eventsApiSlice.reducer,
    [tasksApiSlice.reducerPath]: tasksApiSlice.reducer,
    [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(eventsApiSlice.middleware)
      .concat(tasksApiSlice.middleware)
      .concat(userApiSlice.middleware)
      .concat(unitsApiSlice.middleware),
});

// 🧩 Providers wrapper
const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <Provider store={mockStore}>
      <ThemeProvider theme={createTheme()}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>{ui}</MemoryRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>,
  );

// 🧪 Functional test wrapper to respect hook rules
const TestWrapper = ({ isInitialUpload = false }: { isInitialUpload: boolean }) => {
  const {
    control,
    watch,
    formState: { errors, isDirty },
    setValue,
  } = useForm<IMultiEventForm>({
    defaultValues: {
      events: [
        {
          eventType: 'Training' as EventType,
          eventDate: null,
          comments: '',
        },
      ],
    },
  });

  return (
    <EventMainFields
      control={control}
      errors={errors}
      isDirty={isDirty}
      watch={watch}
      index={0}
      event={undefined}
      signature={{ signatureOne: false, signatureTwo: false }}
      setSignature={vi.fn()}
      isAcknowledged={false}
      setIsAcknowledged={vi.fn()}
      tableData={[]}
      setTableData={vi.fn()}
      isTaskCheckboxChecked={false}
      setIsTaskCheckboxChecked={vi.fn()}
      taskType=""
      setTaskType={vi.fn()}
      fetchingTasks={false}
      userTasks={[]}
      isInitialUpload={isInitialUpload}
      setValue={setValue}
    />
  );
};

// 🧪 Setup before each test
beforeEach(() => {
  vi.resetAllMocks();
  (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    userId: '123',
  });
  (useGetEventTypesQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    data: [{ type: 'Training' }, { type: 'Evaluation' }],
    isFetching: false,
  });
});

describe('EventMainFields rendering with form context', () => {
  it('renders Event Type and Event Date fields when isInitialUpload is false', () => {
    renderWithProviders(<TestWrapper isInitialUpload={false} />);
    const eventLabels = screen.getAllByText(/Event Type\*/);
    const dateLabels = screen.getAllByText(/Event Date\*/);
    expect(eventLabels.length).toBeGreaterThan(1);
    expect(dateLabels.length).toBeGreaterThan(1);
  });

  it('renders Event Result dropdown', () => {
    renderWithProviders(<TestWrapper isInitialUpload={false} />);
    const eventLabels = screen.getAllByText(/Event Result\*/);
    expect(eventLabels.length).toBeGreaterThan(1);
  });

  it('renders MX Hours input when eventType is Training', () => {
    renderWithProviders(<TestWrapper isInitialUpload={false} />);
    expect(screen.getByLabelText(/Total MX Hours\*/)).toBeInTheDocument();
  });

  it('does not render Unit and Original Recorder when isInitialUpload is false', () => {
    renderWithProviders(<TestWrapper isInitialUpload={false} />);
    expect(screen.queryByLabelText('Unit')).toBeNull();
    expect(screen.queryByLabelText('Original Recorder*')).toBeNull();
  });

  it('renders Unit and Original Recorder when isInitialUpload is true', () => {
    renderWithProviders(<TestWrapper isInitialUpload />);
    expect(screen.getByLabelText('Unit')).toBeInTheDocument();
    expect(screen.getByLabelText('Original Recorder*')).toBeInTheDocument();
  });
});
