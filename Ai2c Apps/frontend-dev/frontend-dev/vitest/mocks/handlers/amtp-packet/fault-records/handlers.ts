import { http, HttpResponse } from 'msw';

import { IFaultActionDto } from '@store/amap_ai/faults/models';
import { faultRecordsBaseUrl } from '@store/amap_ai/faults/slices/faultsApi';

// Mock data
const mockFaultActions: IFaultActionDto[] = [
  {
    fault_action_id: 'FA001',
    sequence_number: 1,
    closer_name: 'test',
    action_status: 'CLOSED',
    inspector_name: 'Inspector Gomez',
    maintainers: [],
    role: 'maintainer',
    discovered_on: '2025-08-01',
    closed_on: '2025-08-03',
    maintenance_action: 'Replaced hydraulic pump',
    status_code: 'CLOSED',
    corrective_action: 'Installed new part and tested system',
    fault_work_unit_code: 'WU123',
    man_hours: 5,
    fault_details: {
      fault_id: 'F001',
      aircraft: 'F-16',
      unit: 'Alpha',
      discovered_on: '2025-03-04',
      discoverer_name: 'Test Gomez',
      discoverer: 'Tech Sgt. Ray',
      discover_date: '2025-08-01',
      corrective_date: '2025-08-03',
      fault_work_unit_code: 'WU123',
      total_man_hours: 5,
      inspector: 'Lt. Gomez',
      closer: 'Capt. Lee',
      remarks: 'Resolved without incident',
      unit_name: 'Unit A',
      corrected_on: '2025-03-09',
      fault_actions: [],
    },
  },
];

// Handler for fetching soldier fault history
export const faultRecordsHandlers = [
  http.get(`${faultRecordsBaseUrl}/:soldier_id/fault_history`, ({ params }) => {
    const { soldier_id } = params;

    const filtered = mockFaultActions.filter((action) => action.fault_details.fault_id.includes(soldier_id as string));

    if (filtered.length === 0) {
      return HttpResponse.json({ error: 'No fault history found' }, { status: 404 });
    }

    return HttpResponse.json({ fault_actions: filtered }, { status: 200 });
  }),
];
