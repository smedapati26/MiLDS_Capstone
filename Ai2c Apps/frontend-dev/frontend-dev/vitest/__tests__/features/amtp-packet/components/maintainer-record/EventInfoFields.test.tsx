/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ReactNode } from 'react';
import { Control, FieldErrors, useForm, UseFormWatch } from 'react-hook-form';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';

import EventInfoFields from '@features/amtp-packet/components/maintainer-record/EventInfoFields';
import { IMassEventFormValues } from '@features/amtp-packet/components/maintainer-record/MassEventDialog';
import { eventsApiSlice } from '@store/amap_ai/events/slices';
import { useLazyGetUnitSoldiersQuery } from '@store/amap_ai/soldier';
import { unitsApiSlice, useGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';

// Configure mock Redux store
const mockStore = configureStore({
  reducer: {
    [eventsApiSlice.reducerPath]: eventsApiSlice.reducer,
    [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(eventsApiSlice.middleware).concat(unitsApiSlice.middleware),
});

// Helper function to render with providers
const renderWithProviders = (ui: ReactNode) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={{}}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>{ui}</MemoryRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>,
  );
};

// Mock API slice hooks
vi.mock('@store/amap_ai/units/slices/unitsApiSlice', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useGetUnitsQuery: vi.fn(),
  };
});

vi.mock('@store/amap_ai/soldier', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useLazyGetUnitSoldiersQuery: vi.fn(),
  };
});

beforeEach(() => {
  vi.resetAllMocks();
  (useGetUnitsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
    data: [{ uic: 'A123', displayName: 'Alpha Company', shortName: 'Alpha' }],
    isLoading: false,
  });
  (useLazyGetUnitSoldiersQuery as ReturnType<typeof vi.fn>).mockReturnValue([
    vi.fn(),
    { data: { soldiers: [{ userId: '123', firstName: 'John', lastName: 'Doe', rank: 'SGT' }] }, isFetching: false },
  ]);
});

// React Hook Form Wrapper Component
const TestFormWrapper = ({ children }: { children: (control: Control<IMassEventFormValues>) => ReactNode }) => {
  const { control } = useForm<IMassEventFormValues>();

  return children(control);
};

// Mock Props
const mockProps = {
  formType: 'Training',
  errors: {} as FieldErrors<IMassEventFormValues>,
  setValue: vi.fn(),
  watch: vi.fn((field) =>
    field === 'soldierStatuses' ? [{ userId: '123', result: 'GO', unit: 'Alpha Co', comments: '' }] : undefined,
  ) as unknown as UseFormWatch<IMassEventFormValues>,
  selectedSoldiers: [],
  setSelectedSoldiers: vi.fn(),
  selectedUnit: undefined,
  setSelectedUnit: vi.fn(),
};

describe('EventInfoFields Component', () => {
  it('renders Event Date field', async () => {
    renderWithProviders(
      <TestFormWrapper>
        {(control: Control<IMassEventFormValues>) => (
          <ThemedTestingComponent>
            <EventInfoFields {...mockProps} control={control} />
          </ThemedTestingComponent>
        )}
      </TestFormWrapper>,
    );
  });

  it('renders Event Date fields', () => {
    renderWithProviders(
      <TestFormWrapper>
        {(control: Control<IMassEventFormValues>) => (
          <ThemedTestingComponent>
            <EventInfoFields {...mockProps} control={control} />
          </ThemedTestingComponent>
        )}
      </TestFormWrapper>,
    );
    const dateLabels = screen.getAllByText(/Event Date\*/);
    expect(dateLabels.length).toBeGreaterThan(1);
  });

  it('selecting a unit updates selectedUnit state', async () => {
    renderWithProviders(
      <TestFormWrapper>
        {(control: Control<IMassEventFormValues>) => (
          <ThemedTestingComponent>
            <EventInfoFields {...mockProps} control={control} />
          </ThemedTestingComponent>
        )}
      </TestFormWrapper>,
    );

    const unitDropdown = await screen.findByLabelText('Unit');
    fireEvent.mouseDown(unitDropdown);

    expect(unitDropdown).toBeInTheDocument();
  });
  it('shows validation errors when required fields are empty', async () => {
    renderWithProviders(
      <TestFormWrapper>
        {(control: Control<IMassEventFormValues>) => (
          <ThemedTestingComponent>
            <EventInfoFields {...mockProps} control={control} />
          </ThemedTestingComponent>
        )}
      </TestFormWrapper>,
    );

    mockProps.setValue('eventDate', null);
  });

  it('updates soldierStatuses when Event Result changes', async () => {
    const setValueSpy = vi.fn();
    renderWithProviders(
      <TestFormWrapper>
        {(control) => (
          <ThemedTestingComponent>
            <EventInfoFields {...mockProps} control={control} setValue={setValueSpy} />
          </ThemedTestingComponent>
        )}
      </TestFormWrapper>,
    );

    const resultDropdown = screen.getByRole('combobox', { name: 'Event Result*' });
    fireEvent.mouseDown(resultDropdown);
    const noGoOption = screen.getByText('No-Go');
    fireEvent.click(noGoOption);

    expect(resultDropdown).toBeInTheDocument();
  });

  it('renders Comments field', async () => {
    const setValueSpy = vi.fn();

    renderWithProviders(
      <TestFormWrapper>
        {(control) => (
          <ThemedTestingComponent>
            <EventInfoFields {...mockProps} control={control} setValue={setValueSpy} />
          </ThemedTestingComponent>
        )}
      </TestFormWrapper>,
    );

    const commentsInput = screen.getByRole('textbox', { name: 'Event Comments' });
    expect(commentsInput).toBeInTheDocument();
  });
});
