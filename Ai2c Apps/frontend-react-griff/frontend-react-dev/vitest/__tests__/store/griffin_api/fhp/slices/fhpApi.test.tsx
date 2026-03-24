import { setupServer } from 'msw/node';
import { Provider } from 'react-redux';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { mapToFhpSummary, mapToIFhpProgress, mapToIFhpProgressMulti } from '@store/griffin_api/fhp/models';
import {
  fhpApi,
  useGetFhpProgressMultipleUnitsQuery,
  useGetFhpProgressQuery,
  useGetFhpSummaryQuery,
} from '@store/griffin_api/fhp/slices';

import { fhpHandlers } from '@vitest/mocks/griffin_api_handlers/fhp/fhpHandlers';
import {
  mockFhpProgressDto,
  mockFhpProgressMultiDtoArray,
  mockFhpSummaryDto,
} from '@vitest/mocks/griffin_api_handlers/fhp/mock_data';

// Setup MSW server
const server = setupServer(...fhpHandlers);

// Setup Redux store for testing
const store = configureStore({
  reducer: {
    [fhpApi.reducerPath]: fhpApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(fhpApi.middleware),
});

const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>;

describe('fhpApi Slice', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('fetches flight hours summary successfully', async () => {
    const { result } = renderHook(
      () =>
        useGetFhpSummaryQuery({
          uic: 'mock-uic',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mapToFhpSummary(mockFhpSummaryDto));
  });

  it('returns an error when uic is missing', async () => {
    const { result } = renderHook(
      () =>
        useGetFhpSummaryQuery({
          uic: '',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });

  it('fetches flight hour progress successfully', async () => {
    const { result } = renderHook(
      () =>
        useGetFhpProgressQuery({
          uic: 'mock-uic',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          year: '2025',
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mapToIFhpProgress(mockFhpProgressDto));
  });

  it('returns an error when uic is missing for progress', async () => {
    const { result } = renderHook(
      () =>
        useGetFhpProgressQuery({
          uic: '',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });

  it('returns an error when server error for progress', async () => {
    const { result } = renderHook(
      () =>
        useGetFhpProgressQuery({
          uic: 'server-error',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });

  it('fetches progress for multiple units successfully', async () => {
    const { result } = renderHook(
      () =>
        useGetFhpProgressMultipleUnitsQuery({
          uic: 'mock-uic',
          uics: ['mock-uic', 'mock-uic-2'],
          startDate: '2023-01-01',
          endDate: '2023-12-31',
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject(mockFhpProgressMultiDtoArray.map(mapToIFhpProgressMulti));
  });

  it('returns an error when similar_units is empty', async () => {
    const { result } = renderHook(
      () =>
        useGetFhpProgressMultipleUnitsQuery({
          uic: 'mock-uic',
          uics: [],
          startDate: '2023-01-01',
          endDate: '2023-12-31',
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });

  it('returns an error when one of the similar_units is not-found', async () => {
    const { result } = renderHook(
      () =>
        useGetFhpProgressMultipleUnitsQuery({
          uic: 'mock-uic',
          uics: ['not-found'],
          startDate: '2023-01-01',
          endDate: '2023-12-31',
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });

  it('returns an error when one of the similar_units is server-error', async () => {
    const { result } = renderHook(
      () =>
        useGetFhpProgressMultipleUnitsQuery({
          uic: 'mock-uic',
          uics: ['server-error'],
          startDate: '2023-01-01',
          endDate: '2023-12-31',
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
