import React from 'react';
import { describe, expect, it } from 'vitest';
import { ProviderWrapper } from 'vitest/helpers';
import { unitHandlers } from 'vitest/mocks/handlers/units/handlers';
import { mockTestUic, mockTestUnit } from 'vitest/mocks/handlers/units/mock_data';
import { server } from 'vitest/mocks/server';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { mapToIUnitBrief } from '@store/amap_ai/units/models';
import { unitsApiSlice, useGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';

server.use(...unitHandlers);

const store = configureStore({
  reducer: {
    [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(unitsApiSlice.middleware),
});

const wrapper = (props: { children: React.ReactNode }) => (
  <ProviderWrapper store={store}>{props.children}</ProviderWrapper>
);

describe('unitsApiSlice', () => {
  it('fetches all units successfully', async () => {
    const { result } = renderHook(() => useGetUnitsQuery({}), { wrapper });

    await waitFor(
      () => {
        expect(result.current.data).toEqual([mapToIUnitBrief(mockTestUnit)]);
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 10000 },
    );
  });

  it('fetches units by UIC successfully', async () => {
    const { result } = renderHook(() => useGetUnitsQuery({ topLevelUic: mockTestUic }), { wrapper });

    await waitFor(
      () => {
        expect(result.current.data).toEqual([mapToIUnitBrief(mockTestUnit)]);
        expect(result.current.isLoading).toBeFalsy();
      },
      { timeout: 10000 },
    );
  });
});
