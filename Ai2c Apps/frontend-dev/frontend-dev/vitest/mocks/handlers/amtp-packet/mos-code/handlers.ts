import { http, HttpResponse } from 'msw';

import { mosCodeBaseUrl } from '@store/amap_ai/mos_code/slices/mosCodeApi';

import { mockMOSData } from './mock_data';

/**
 * An array of request handlers for soldier-related API endpoints.
 */
export const mosCodeHandlers = [
  // Intercept "GET" all MOS
  http.get(`${mosCodeBaseUrl}/all`, () => {
    if (!mockMOSData || mockMOSData.length === 0) {
      return HttpResponse.json({ error: 'No MOS data found' }, { status: 404 });
    }

    return HttpResponse.json(mockMOSData);
  }),
];
