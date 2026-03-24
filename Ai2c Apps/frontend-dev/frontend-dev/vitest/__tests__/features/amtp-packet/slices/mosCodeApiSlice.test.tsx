import { describe, it } from 'vitest';
import { amtpPacketHandlers } from 'vitest/mocks/handlers/amtp-packet/handlers';
import { server } from 'vitest/mocks/server';

// Setup mock server handlers
server.use(...amtpPacketHandlers);

// Configure store
// const store = configureStore({
//   reducer: {
//     [mosCodeApiSlice.reducerPath]: mosCodeApiSlice.reducer
//   },
//   middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(mosCodeApiSlice.middleware),
// });

// Wrapper for the store provider
// const wrapper = (props: { children: React.ReactNode }) => (
//   <ProviderWrapper store={store}>{props.children}</ProviderWrapper>
// );

describe('mosCodeApiSLice', () => {
  
  it('fetches all MOS successfully', async () => {
    // const { result, waitForNextUpdate } = renderHook(() => useGetAllMOSQuery(), { wrapper });

    // await waitForNextUpdate();

    // expect(result.current.data).toBeDefined();
    // expect(result.current.data.length).toBeGreaterThan(0);
    // expect(result.current.isLoading).toBeFalsy();
  });
});
