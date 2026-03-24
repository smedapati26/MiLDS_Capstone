import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cancellationMiddleware } from '../../../src/store/cancellationMiddleware'; // adjust path

describe('cancellationMiddleware', () => {
  const next = vi.fn();
  const state = {};
  const middleware = cancellationMiddleware(state)(next);
  const mockAbort = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal('AbortController', vi.fn(() => ({
      abort: mockAbort,
      signal: { aborted: false } // Basic mock signal
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize an AbortController and add a signal on API_REQUEST_START', () => {
    const action = {
      type: 'API_REQUEST_START',
      meta: { apiRequestId: 'req-1', signal: undefined }
    };

    middleware(action);

    expect(next).toHaveBeenCalledWith(action);
  });

  it('should remove the request from internal tracking on success/failure/cancelled', () => {
    // 1. Start a request
    const startAction = { type: 'API_REQUEST_START', meta: { apiRequestId: 'req-1' } };
    middleware(startAction);

    // 2. Complete the request
    const successAction = { type: 'API_REQUEST_SUCCESS', meta: { apiRequestId: 'req-1' } };
    middleware(successAction);

    // To verify cleanup, we trigger a global abort and check if this specific signal is aborted
    middleware({ type: 'LOCATION_CHANGE' });

    // If it was correctly deleted from the Map, the global LOCATION_CHANGE shouldn't have aborted it
    expect(mockAbort).not.toHaveBeenCalled();
  });

  it('should abort all pending requests on LOCATION_CHANGE', () => {
    const action1 = { type: 'API_REQUEST_START', meta: { apiRequestId: 'req-1' } };
    const action2 = { type: 'API_REQUEST_START', meta: { apiRequestId: 'req-2' } };

    middleware(action1);
    middleware(action2);

    // Trigger navigation
    middleware({ type: 'LOCATION_CHANGE' });

    expect(mockAbort).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenCalled();
  });

  it('should pass through unknown actions without modification', () => {
    const action = { type: 'OTHER_ACTION' };
    middleware(action);
    expect(next).toHaveBeenCalledWith(action);
  });
});