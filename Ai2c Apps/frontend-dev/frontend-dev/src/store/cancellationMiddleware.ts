const pendingRequests = new Map();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cancellationMiddleware = (_state: any | undefined) => (next: any) => (action: any) => {
  // Check if the action is a navigation action (adjust 'LOCATION_CHANGE' as per your router setup)
  if (action.type === 'LOCATION_CHANGE' || action.type === 'USER_LOGOUT') {
    // Abort all pending requests
    pendingRequests.forEach((controller) => {
      controller.abort();
    });
    pendingRequests.clear();
  }

  // Check if the action is the start of an API request
  if (action.type === 'API_REQUEST_START') {
    const controller = new AbortController();
    pendingRequests.set(action.meta.apiRequestId, controller);
    // Pass the signal to the action payload or meta for use in the actual API call
    action.meta.signal = controller.signal;
  }

  // Check if the action indicates a request is complete
  if (
    action.type === 'API_REQUEST_SUCCESS' ||
    action.type === 'API_REQUEST_FAILURE' ||
    action.type === 'API_REQUEST_CANCELLED'
  ) {
    if (pendingRequests.has(action.meta.apiRequestId)) {
      pendingRequests.delete(action.meta.apiRequestId);
    }
  }

  return next(action);
};
