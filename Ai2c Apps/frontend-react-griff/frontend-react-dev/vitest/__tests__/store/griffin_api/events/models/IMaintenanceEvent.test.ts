import { describe, expect, it } from 'vitest';

import {
  IMaintenanceEvent,
  IMaintenanceEventDto,
  IUpcomingMaintenance,
  IUpcomingMaintenanceDto,
  mapToIMaintenanceEvent,
  mapToIUpcomingMaintenance,
} from '@store/griffin_api/events/models/IMaintenanceEvent';

describe('IMaintenanceEvent', () => {
  describe('mapToIMaintenanceEvent', () => {
    it('should correctly map IMaintenanceEventDto to IMaintenanceEvent', () => {
      const dto: IMaintenanceEventDto = {
        id: 1,
        event_start: '2023-01-01T00:00:00Z',
        event_end: '2023-01-02T00:00:00Z',
        aircraft: {
          serial: 'ABC123',
          current_unit: 'UNIT001',
          airframe: {
            model: 'ModelX',
            mds: 'MDS001',
          },
        },
        lane: 1,
        maintenance_type: 'insp',
        is_phase: false,
        inspection_reference: {
          id: 1,
          common_name: 'Test Inspection',
          code: 'TI',
          is_phase: false,
        },
        inspection: 123,
        notes: 'Some notes',
        poc: 'POC Name',
        alt_poc: 'Alt POC Name',
      };

      const expected: IMaintenanceEvent = {
        id: 1,
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-01-02T00:00:00Z',
        laneId: 1,
        maintenanceType: 'insp',
        aircraft: {
          serialNumber: 'ABC123',
          currentUnitUic: 'UNIT001',
          model: 'ModelX',
          mds: 'MDS001',
        },
        notes: 'Some notes',
        poc: 'POC Name',
        altPoc: 'Alt POC Name',
        inspection: 123,
        inspectionReference: {
          id: 1,
          commonName: 'Test Inspection',
          code: 'TI',
          isPhase: false,
        },
        isPhase: false,
      };

      const result = mapToIMaintenanceEvent(dto);

      expect(result).toEqual(expected);
    });

    it('should handle null inspection_reference', () => {
      const dto: IMaintenanceEventDto = {
        id: 2,
        event_start: '2023-01-01T00:00:00Z',
        event_end: '2023-01-02T00:00:00Z',
        aircraft: {
          serial: 'DEF456',
          current_unit: 'UNIT002',
          airframe: {
            model: 'ModelY',
            mds: 'MDS002',
          },
        },
        lane: 2,
        maintenance_type: 'other',
        is_phase: true,
        inspection_reference: null,
        inspection: null,
        notes: null,
        poc: null,
        alt_poc: null,
      };

      const expected: IMaintenanceEvent = {
        id: 2,
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-01-02T00:00:00Z',
        laneId: 2,
        maintenanceType: 'other',
        aircraft: {
          serialNumber: 'DEF456',
          currentUnitUic: 'UNIT002',
          model: 'ModelY',
          mds: 'MDS002',
        },
        notes: null,
        poc: null,
        altPoc: null,
        inspection: null,
        inspectionReference: null,
        isPhase: true,
      };

      const result = mapToIMaintenanceEvent(dto);

      expect(result).toEqual(expected);
    });

    it('should handle undefined optional fields', () => {
      const dto: IMaintenanceEventDto = {
        id: 3,
        event_start: '2023-01-01T00:00:00Z',
        event_end: '2023-01-02T00:00:00Z',
        aircraft: {
          serial: 'GHI789',
          current_unit: 'UNIT003',
          airframe: {
            model: 'ModelZ',
            mds: 'MDS003',
          },
        },
        lane: 3,
        maintenance_type: 'insp',
        is_phase: false,
        // inspection_reference, inspection, notes, poc, alt_poc are undefined
      };

      const expected: IMaintenanceEvent = {
        id: 3,
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-01-02T00:00:00Z',
        laneId: 3,
        maintenanceType: 'insp',
        aircraft: {
          serialNumber: 'GHI789',
          currentUnitUic: 'UNIT003',
          model: 'ModelZ',
          mds: 'MDS003',
        },
        notes: null,
        poc: null,
        altPoc: null,
        inspection: null,
        inspectionReference: null,
        isPhase: false,
      };

      const result = mapToIMaintenanceEvent(dto);

      expect(result).toEqual(expected);
    });
  });

  describe('mapToIUpcomingMaintenance', () => {
    it('should correctly map IUpcomingMaintenanceDto to IUpcomingMaintenance', () => {
      const dto: IUpcomingMaintenanceDto = {
        id: 1,
        event_start: '2023-01-01T00:00:00Z',
        event_end: '2023-01-02T00:00:00Z',
        aircraft: {
          serial: 'ABC123',
          current_unit: 'UNIT001',
          airframe: {
            model: 'ModelX',
            mds: 'MDS001',
          },
        },
        lane: 1,
        maintenance_type: 'insp',
        is_phase: false,
        inspection_reference: {
          id: 1,
          common_name: 'Test Inspection',
          code: 'TI',
          is_phase: false,
        },
        inspection: '123',
        notes: 'Some notes',
        poc: 'POC Name',
        alt_poc: 'Alt POC Name',
      };

      const expected: IUpcomingMaintenance = {
        id: 1,
        title: 'ABC123, Test Inspection',
        progress: 0,
        notes: 'Some notes',
        status: 'In Progress',
        eventStart: '2023-01-01T00:00:00Z',
        eventEnd: '2023-01-02T00:00:00Z',
        serialNumber: 'ABC123',
        lane: 1,
        inspectionName: 'Test Inspection',
        aircraftModel: 'ModelX',
      };

      const result = mapToIUpcomingMaintenance(dto);

      expect(result).toEqual(expected);
    });

    it('should handle null inspection_reference in title', () => {
      const dto: IUpcomingMaintenanceDto = {
        id: 2,
        event_start: '2023-01-01T00:00:00Z',
        event_end: '2023-01-02T00:00:00Z',
        aircraft: {
          serial: 'DEF456',
          current_unit: 'UNIT002',
          airframe: {
            model: 'ModelY',
            mds: 'MDS002',
          },
        },
        lane: 2,
        maintenance_type: 'other',
        is_phase: true,
        inspection_reference: null,
        inspection: null,
        notes: null,
        poc: null,
        alt_poc: null,
      };

      const expected: IUpcomingMaintenance = {
        id: 2,
        title: 'DEF456, other',
        progress: 0,
        notes: null,
        status: 'In Progress',
        eventStart: '2023-01-01T00:00:00Z',
        eventEnd: '2023-01-02T00:00:00Z',
        serialNumber: 'DEF456',
        lane: 2,
        inspectionName: 'other',
        aircraftModel: 'ModelY',
      };

      const result = mapToIUpcomingMaintenance(dto);

      expect(result).toEqual(expected);
    });
  });
});
