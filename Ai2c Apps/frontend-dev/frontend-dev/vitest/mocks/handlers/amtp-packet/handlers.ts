/* eslint-disable @typescript-eslint/ban-ts-comment */
import { http, HttpResponse } from 'msw';

import { readinessApiBaseUrl } from '@store/amap_ai/readiness/slices/readinessApi';

import { mockCtlsData, mockMOSData } from './mock_data';

/**
 * An array of request handlers for soldier-related API endpoints.
 */
export const amtpPacketHandlers = [
  http.post(`${readinessApiBaseUrl}/amap-packet`, async (req) => {
    // @ts-expect-error
    const { soldier_ids, packets } = await req.json();

    if (!soldier_ids || soldier_ids.length === 0 || !packets) {
      return HttpResponse.json(
        { error: 'Invalid request. Soldier IDs and packet data are required.' },
        { status: 400 },
      );
    }

    // Simulate generating a ZIP file
    const zipContent = new Blob([`Mock ZIP content for soldiers: ${soldier_ids.join(', ')}`], {
      type: 'application/zip',
    });

    return new HttpResponse(zipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="mock_packet.zip"',
      },
    });
  }),

  // Intercept "GET" critical task lists (ICTL and UCTL)
  http.get(`${readinessApiBaseUrl}/:user_id/ctls`, (req) => {
    const { user_id } = req.params;

    // @ts-expect-error
    const ctlsData = mockCtlsData[user_id as string];
    if (!ctlsData) {
      return HttpResponse.json({ error: 'CTLs not found' }, { status: 404 });
    }

    return HttpResponse.json(ctlsData);
  }),

  // Intercept "GET" all MOS
  http.get(`${readinessApiBaseUrl}/mos/all`, () => {
    if (!mockMOSData || mockMOSData.length === 0) {
      return HttpResponse.json({ error: 'No MOS data found' }, { status: 404 });
    }

    return HttpResponse.json(mockMOSData);
  }),
];
