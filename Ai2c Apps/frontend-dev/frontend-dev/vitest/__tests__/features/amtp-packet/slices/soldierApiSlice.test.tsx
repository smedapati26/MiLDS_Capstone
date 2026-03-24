import { describe, it } from 'vitest';
import { ProviderWrapper } from 'vitest/helpers';
import { amtpPacketHandlers } from 'vitest/mocks/handlers/amtp-packet/handlers';
import { server } from 'vitest/mocks/server';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';

import { soldierApiSlice, useUpdateSoldierMutation } from '@store/amap_ai/soldier/slices/soldierApi';

// Setup mock server handlers
server.use(...amtpPacketHandlers);

// Configure store
const store = configureStore({
  reducer: {
    [soldierApiSlice.reducerPath]: soldierApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(soldierApiSlice.middleware),
});

// Wrapper for the store provider
const wrapper = (props: { children: React.ReactNode }) => (
  <ProviderWrapper store={store}>{props.children}</ProviderWrapper>
);

describe('readinessApiSlice', () => {
  //   it('fetches all unit soldiers successfully', async () => {
  //     const { result } = renderHook(() => useGetUnitSoldiersQuery({ uic: 'A123', type: 'all_soldiers' }), { wrapper });

  //     await waitFor(() => {
  //       expect(result.current.data).toEqual({ soldiers: [mapResponseData(mockSoldierData)] });
  //       expect(result.current.isLoading).toBeFalsy();
  //     });
  //   });

  it('updates soldier information successfully', async () => {
    const { result } = renderHook(() => useUpdateSoldierMutation(), { wrapper });

    // Define updated soldier data matching IUpdateSoldierOut
    const updatedSoldierData = {
      user_id: '123',
      primary_mos: '11B', // Primary MOS
      additional_mos: ['12B', '13B'], // Additional MOS
      birth_month: 'January',
      pv2_dor: '2023-01-01',
      pfc_dor: '2023-02-01',
      spc_dor: '2023-03-01',
      sgt_dor: '2023-04-01',
      ssg_dor: '2023-05-01',
      sfc_dor: '2023-06-01',
    };

    // Extract mutation trigger function
    const [triggerUpdateSoldier] = result.current;

    // Trigger the mutation and capture the response
    await triggerUpdateSoldier(updatedSoldierData);
  });
});
