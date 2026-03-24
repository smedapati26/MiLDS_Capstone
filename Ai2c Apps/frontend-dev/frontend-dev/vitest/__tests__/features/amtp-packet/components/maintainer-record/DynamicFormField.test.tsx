/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useForm } from 'react-hook-form';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, it, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import { Echelon } from '@ai2c/pmx-mui';

import { IEventFormValues, IMultiEventForm } from '@features/amtp-packet/components/maintainer-record/AddEditEventForm';
import DynamicFormField from '@features/amtp-packet/components/maintainer-record/DynamicFormField';
import { IMassEventFormValues } from '@features/amtp-packet/components/maintainer-record/MassEventDialog';
import { eventsApiSlice } from '@store/amap_ai/events/slices';
import { unitsApiSlice, useLazyGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';

type ProgressionControlType = IMultiEventForm | IEventFormValues | IMassEventFormValues;

vi.mock('@store/amap_ai/events/slices', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useLazyGetTrainingTypesQuery: () => [vi.fn(), { data: [{ type: 'Engineer' }], isFetching: false }],
    useLazyGetEvaluationTypesQuery: () => [vi.fn(), { data: [{ type: 'Mock Evaluation' }], isFetching: false }],
    useLazyGetAwardTypesQuery: () => [vi.fn(), { data: [{ type: 'Mock Award' }], isFetching: false }],
    useLazyGetTCSLocationsQuery: () => [vi.fn(), { data: [{ location: 'Mock TCS Location' }], isFetching: false }],
  };
});

vi.mock('@store/amap_ai/units/slices/unitsApiSlice', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useLazyGetUnitsQuery: vi.fn(),
  };
});

const mockStore = configureStore({
  reducer: {
    [eventsApiSlice.reducerPath]: eventsApiSlice.reducer,
    [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(eventsApiSlice.middleware, unitsApiSlice.middleware),
});

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

const TestWrapper = ({ formType }: { formType: string }) => {
  const {
    control,
    formState: { errors },
  } = useForm<ProgressionControlType>({
    defaultValues: {
      events: [
        {
          trainingType: '',
          evaluationType: '',
          awardType: '',
          tcsLocation: '',
          gainingUnit: {},
        },
      ],
    },
  });

  return <DynamicFormField formType={formType} control={control} errors={errors} />;
};

beforeEach(() => {
  vi.resetAllMocks();
  (useLazyGetUnitsQuery as ReturnType<typeof vi.fn>).mockImplementation(() => [
    vi.fn(),
    {
      data: [
        {
          uic: '123XYZ',
          echelon: Echelon.UNKNOWN,
          component: 'Army National Guard',
          level: 1,
          displayName: '1st Battalion, 123rd Infantry Regiment',
          shortName: '1-123 IN',
          nickName: 'The Guardians',
          state: 'CA',
          parentUic: '456ABC',
        },
      ],
      isSuccess: true,
      isLoading: false,
    },
  ]);
});

describe('DynamicFormField Component', () => {
  it('renders Training Type field if present', () => {
    renderWithProviders(<TestWrapper formType="Training" />);
    const trainingLabels = screen.getAllByText(/Training Type\*/);
    expect(trainingLabels.length).toBeGreaterThan(1);
  });

  it('renders Evaluation Type field', () => {
    renderWithProviders(<TestWrapper formType="Evaluation" />);
    const evaluationLabels = screen.getAllByText(/Evaluation Type\*/);
    expect(evaluationLabels.length).toBeGreaterThan(1);
  });

  it('renders Award Type field', () => {
    renderWithProviders(<TestWrapper formType="Award" />);
    const awardLabels = screen.getAllByText(/Award Type\*/);
    expect(awardLabels.length).toBeGreaterThan(1);
  });

  it('renders TCS Location field', () => {
    renderWithProviders(<TestWrapper formType="TCS" />);
    const tcsLabels = screen.getAllByText(/TCS Location\*/);
    expect(tcsLabels.length).toBeGreaterThan(1);
  });

  it('renders Gaining Unit field for PCS/ETS', () => {
    renderWithProviders(<TestWrapper formType="PCS/ETS" />);
    const unitLabels = screen.getAllByText(/Gaining Unit\*/);
    expect(unitLabels.length).toBeGreaterThan(1);
  });

  it('renders Gaining Unit field for In-Unit Transfer', () => {
    renderWithProviders(<TestWrapper formType="In-Unit Transfer" />);
    const unitLabels = screen.getAllByText(/Gaining Unit\*/);
    expect(unitLabels.length).toBeGreaterThan(1);
  });

  it('renders nothing when formType is undefined', () => {
    renderWithProviders(<TestWrapper formType={undefined as unknown as string} />);
    expect(screen.queryByText(/Training Type\*/)).toBeNull();
    expect(screen.queryByText(/Evaluation Type\*/)).toBeNull();
  });
});
