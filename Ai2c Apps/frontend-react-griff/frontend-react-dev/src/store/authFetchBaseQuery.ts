import { BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
const { VITE_KEYCLOAK_URL, VITE_KEYCLOAK_REALM, VITE_KEYCLOAK_CLIENT } = import.meta.env;
import { v4 as uuidv4 } from 'uuid';

// Define an interface for the config you want to pass
interface BaseQueryConfig {
  baseUrl: string;
}

// Factory function that returns the custom baseQuery
export const authFetchBaseQuery =
  (config: BaseQueryConfig): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =>
  async (args, api, extraOptions) => {
    const { baseUrl } = config;

    // Create a custom fetch function to intercept the response
    const authRefreshFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const apiRequestId = uuidv4();
      api.dispatch({ type: 'API_REQUEST_START', meta: { apiRequestId } });
      const response = await fetch(input, { ...init, redirect: 'manual' as RequestRedirect });

      if (response.status === 0 && response.type === 'opaqueredirect') {
        // Delete cache on redirect
        if (window.caches) {
          // List all cache names (keys)
          const names = await caches.keys();

          // Delete each cache
          await Promise.all(names.map((name) => caches.delete(name)));
        }
        api.dispatch({ type: 'LOCATION_CHANGE', meta: { apiRequestId } });

        // Setting response URL to be just the base url as SSO sometimes add additional parameters
        const currentLoc = window.location.origin;
        window.location.replace(
          VITE_KEYCLOAK_URL +
          '/realms/' +
          VITE_KEYCLOAK_REALM +
          '/protocol/openid-connect/auth?client_id=' +
          VITE_KEYCLOAK_CLIENT +
          '&redirect_uri=' +
          currentLoc +
          '&response_type=code');
      }

      api.dispatch({ type: 'API_REQUEST_SUCCESS', meta: { apiRequestId } });

      return response;
    };

    // Use fetchBaseQuery with the passed baseUrl and custom fetch
    const baseQuery = fetchBaseQuery({
      baseUrl, // Use the passed baseUrl
      fetchFn: authRefreshFetch,
    });

    // Execute the query
    const result = await baseQuery(args, api, extraOptions);
    return result;
  };
