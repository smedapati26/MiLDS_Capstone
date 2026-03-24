import { http, HttpResponse } from 'msw';

import { IEventReportSoldierDTO, IUnitMOSMLReportDTO, unitHealthApiBaseUrl } from '@store/amap_ai/unit_health';

import { mockEventReportSoldierData, mockUnitMOSMLReport } from './mock_data';

export const unitReportDataHandlers = [
  // Handler for getting a unit's mos ml report data
  http.get(`${unitHealthApiBaseUrl}/unit/:unit_uic/mos_ml_report`, () => {
    return HttpResponse.json<IUnitMOSMLReportDTO>(mockUnitMOSMLReport, { status: 200 });
  }),
  // Handler for getting a unit's event's report data
  http.post(`${unitHealthApiBaseUrl}/unit/:unit_uic/event_report`, () => {
    return HttpResponse.json<IEventReportSoldierDTO[]>(mockEventReportSoldierData, { status: 200 });
  }),
];
