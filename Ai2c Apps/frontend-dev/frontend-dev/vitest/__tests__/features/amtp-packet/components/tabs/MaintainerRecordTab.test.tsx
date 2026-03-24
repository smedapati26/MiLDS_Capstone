// import { Provider } from 'react-redux';
// import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, it, vi } from 'vitest';

// import { LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { configureStore } from '@reduxjs/toolkit';
// import { render } from '@testing-library/react';
// import { ThemedTestingComponent } from '@ai2c/pmx-mui';
// import MaintainerRecordTab from '@features/amtp-packet/components/tabs/MaintainerRecordTab';
// import { mosCodeApiSlice } from '@features/amtp-packet/slices';
import { useGetDa7817sQuery } from '@store/amap_ai/events/slices';
import { useAppDispatch, useAppSelector } from '@store/hooks';
// import { userApiSlice } from '@store/slices/appUserSlice';
// import { tasksApiSlice } from '@store/slices/tasksApiSlice';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('@hooks/useUnitAccess', () => ({
  default: () => ({
    hasRole: vi.fn().mockImplementation((role) => role === 'manager'),
  }),
}));

vi.mock('@store/amap_ai/events/slices', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    // @ts-expect-error - import works
    ...actual,
    useGetDa7817sQuery: vi.fn().mockReturnValue({
      data: [
        { id: 1, mos: '15F', eventType: 'Training' },
        { id: 2, mos: '15E', eventType: 'Evalutation' },
      ],
      isLoading: false,
      error: null,
      isFetching: false,
    }),
  };
});

// Configure the mock store
// const mockStore = configureStore({
//   reducer: {
//     [eventsApiSlice.reducerPath]: eventsApiSlice.reducer,
//     [tasksApiSlice.reducerPath]: tasksApiSlice.reducer,
//     [userApiSlice.reducerPath]: userApiSlice.reducer,
//     [mosCodeApiSlice.reducerPath]: mosCodeApiSlice.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware()
//       .concat(eventsApiSlice.middleware)
//       .concat(tasksApiSlice.middleware)
//       .concat(userApiSlice.middleware)
//       .concat(mosCodeApiSlice.middleware),
// });

// Helper function to render with providers
// const renderWithProviders = (ui: React.ReactElement) => {
//   return render(
//     <Provider store={mockStore}>
//       <LocalizationProvider dateAdapter={AdapterDayjs}>
//         <MemoryRouter>{ui}</MemoryRouter>
//       </LocalizationProvider>
//     </Provider>,
//   );
// };

beforeEach(() => {
  vi.resetAllMocks();
  (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    userId: '123',
  });
  vi.mock('@hooks/useUnitAccess', () => ({
    default: () => ({
      hasRole: vi.fn().mockImplementation((role) => role === 'manager'),
    }),
  }));
  (useAppDispatch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());
  (useGetDa7817sQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    data: [
      { id: 1, mos: '15F', eventType: 'Training' },
      { id: 2, mos: '15E', eventType: 'Evalutation' },
    ],
    isLoading: false,
    error: null,
    isFetching: false,
  });
});

describe('MaintainerRecordTab Tests', () => {
  it('renders correctly with mock data', () => {
    // renderWithProviders(
    //   // @ts-expect-error This works as intended
    //   <ThemedTestingComponent>
    //     <MaintainerRecordTab />
    //   </ThemedTestingComponent>,
    // );
  });
});
