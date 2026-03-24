import React from 'react';
import { describe, it } from 'vitest';
import { ProviderWrapper } from 'vitest/helpers';
import { server } from 'vitest/mocks/server';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { equipmentApi, useGetAircraftModelStatusQuery } from '@store/griffin_api/equipment/slices/equipmentApi';

import { equipmentManagerHandlers } from '@vitest/mocks/griffin_api_handlers/equipment/handler';
import { mockAircraftModelStatus } from '@vitest/mocks/griffin_api_handlers/equipment/mock_data';

server.use(...equipmentManagerHandlers);

const store = configureStore({
  reducer: {
    [equipmentApi.reducerPath]: equipmentApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(equipmentApi.middleware),
});

const wrapper = (props: { children: React.ReactNode }) => (
  <ProviderWrapper store={store}>{props.children}</ProviderWrapper>
);

describe('equipmentApiSlice', () => {
  it('fetches aircraft model status successfully', async () => {
    const { result } = renderHook(() => useGetAircraftModelStatusQuery('test_uic'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([...mockAircraftModelStatus]);
  });
});
