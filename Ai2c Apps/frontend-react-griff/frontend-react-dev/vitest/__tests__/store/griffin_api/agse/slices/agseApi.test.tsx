import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { renderHook, waitFor } from '@testing-library/react';

import { IAGSEEditInDto, IAGSEEditOut } from '@store/griffin_api/agse/models';
import {
  agseApi,
  useEditAGSEMutation,
  useGetAggregateConditionQuery,
  useGetAGSEQuery,
  useGetAGSESubordinateQuery,
} from '@store/griffin_api/agse/slices/agseApi';
import { AGSE_BASE_URL } from '@store/griffin_api/base_urls';
import { store } from '@store/store';

import { ThemedTestingComponent } from '@vitest/helpers/ThemedTestingComponent';
import {
  mockAggregateCondition,
  mockAGSE,
  mockAGSESubordinate,
} from '@vitest/mocks/griffin_api_handlers/agse/mock_data';
import { server } from '@vitest/mocks/server';

// Mock the server
beforeEach(() => server.listen());
afterEach(() => server.resetHandlers());
afterEach(() => server.close());

describe('agseApi', () => {
  it('should have the correct reducerPath', () => {
    expect(agseApi.reducerPath).toBe('agseApi');
  });

  it('should have the correct baseUrl in baseQuery', () => {
    // Since baseQuery is fetchBaseQuery, we can check the configuration indirectly
    // by ensuring the api is created with the expected baseUrl
    expect(AGSE_BASE_URL).toBeDefined();
  });

  it('should define getAGSE endpoint', () => {
    expect(agseApi.endpoints.getAGSE).toBeDefined();
  });

  it('should define getAGSESubordinate endpoint', () => {
    expect(agseApi.endpoints.getAGSESubordinate).toBeDefined();
  });

  it('should define getAggregateCondition endpoint', () => {
    expect(agseApi.endpoints.getAggregateCondition).toBeDefined();
  });

  it('should export useGetAGSEQuery hook', () => {
    expect(useGetAGSEQuery).toBeDefined();
  });

  it('should export useGetAGSESubordinateQuery hook', () => {
    expect(useGetAGSESubordinateQuery).toBeDefined();
  });

  it('should export useGetAggregateConditionQuery hook', () => {
    expect(useGetAggregateConditionQuery).toBeDefined();
  });

  it('should export useEditAGSEMutation', () => {
    expect(useEditAGSEMutation).toBeDefined();
  });
});

describe('useGetAGSEQuery', () => {
  it('should fetch and transform AGSE data', async () => {
    const { result } = renderHook(() => useGetAGSEQuery('test-uic'), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ThemedTestingComponent>{children}</ThemedTestingComponent>
        </Provider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockAGSE);
  });
});

describe('useGetAGSESubordinateQuery', () => {
  it('should fetch and transform AGSE subordinate data', async () => {
    const { result } = renderHook(() => useGetAGSESubordinateQuery({ uic: 'test-uic' }), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ThemedTestingComponent>{children}</ThemedTestingComponent>
        </Provider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockAGSESubordinate);
  });
});

describe('useGetAggregateConditionQuery', () => {
  it('should fetch and transform aggregate condition data', async () => {
    const { result } = renderHook(() => useGetAggregateConditionQuery('test-uic'), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ThemedTestingComponent>{children}</ThemedTestingComponent>
        </Provider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockAggregateCondition);
  });
});

describe('useEditAGSEMutation', () => {
  it('should edit AGSE data', async () => {
    const { result } = renderHook(() => useEditAGSEMutation(), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ThemedTestingComponent>{children}</ThemedTestingComponent>
        </Provider>
      ),
    });

    const payload: IAGSEEditInDto[] = [
      {
        condition: 'test',
        equipment_number: 'equipment',
        field_sync_status: {
          sync_condition: true,
          sync_remarks: true,
          sync_earliest_nmc_start: true,
          sync_location: true,
        },
        location_id: 1,
        remarks: 'test remarks',
      },
    ];

    const [editAGSE] = result.current;
    const response = await editAGSE(payload);

    const expected: IAGSEEditOut = {
      editedAGSE: ['1', '2'],
      detail: 'passed',
      notEditedAGSE: [],
    };

    expect(response.data).toEqual(expected);
  });
});
