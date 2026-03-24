import { describe, expect, it } from 'vitest';
import { ProviderWrapper } from 'vitest/helpers';
import { amtpPacketHandlers } from 'vitest/mocks/handlers/amtp-packet/handlers';
import { server } from 'vitest/mocks/server';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import {
  readinessApiSlice,
  // useDownloadPacketMutation,
  useGetCtlsQuery,
} from '@store/amap_ai/readiness/slices/readinessApi';

// Setup mock server handlers
server.use(...amtpPacketHandlers);

// Configure store
const store = configureStore({
  reducer: {
    [readinessApiSlice.reducerPath]: readinessApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(readinessApiSlice.middleware),
});

// Wrapper for the store provider
const wrapper = (props: { children: React.ReactNode }) => (
  <ProviderWrapper store={store}>{props.children}</ProviderWrapper>
);

describe('readinessApiSlice', () => {
  it('fetches critical task lists (CTLs) successfully', async () => {
    const { result } = renderHook(() => useGetCtlsQuery({ user_id: 'A123' }), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
      expect(result.current.isLoading).toBeFalsy();
    });
  });

  // it('triggers the download packet mutation successfully', async () => {
  //   const { result } = renderHook(() => useDownloadPacketMutation(), { wrapper });

  //   const mockPacketData = {
  //     soldier_ids: ['123', '456'],
  //     packets: { ictls: true, uctls: true, counseling: true },
  //   };

  //   const [triggerDownloadPacket] = result.current;
  //   await triggerDownloadPacket(mockPacketData);
  // });
});
