import { describe, expect, it } from 'vitest';

import { ILocationDto } from '@store/griffin_api/events/models/ILocation';
import { IMaintenanceLane, IMaintenanceLaneDto, mapToILane } from '@store/griffin_api/events/models/IMaintenanceLane';

describe('IMaintenanceLane', () => {
  describe('mapToILane', () => {
    it('should correctly map IMaintenanceLaneDto to IMaintenanceLane with all fields', () => {
      const locationDto: ILocationDto = {
        name: 'Test Location',
        short_name: 'TL',
        code: 'TLC',
      };

      const dto: IMaintenanceLaneDto = {
        id: 1,
        name: 'Test Lane',
        unit: '12345',
        airframe_families: ['F-35', 'F-22'],
        subordinate_units: ['Unit1', 'Unit2'],
        location: locationDto,
        contractor: true,
        internal: false,
      };

      const expected: IMaintenanceLane = {
        id: 1,
        name: 'Test Lane',
        unitUic: '12345',
        airframeFamilies: ['F-35', 'F-22'],
        subordinateUnits: ['Unit1', 'Unit2'],
        location: {
          name: 'Test Location',
          shortName: 'TL',
          code: 'TLC',
        },
        isContractor: true,
        isInternal: false,
      };

      const result = mapToILane(dto);

      expect(result).toEqual(expected);
    });

    it('should handle location as null', () => {
      const dto: IMaintenanceLaneDto = {
        id: 2,
        name: 'Test Lane 2',
        unit: '67890',
        airframe_families: ['A-10'],
        subordinate_units: ['Unit3'],
        location: null,
        contractor: false,
        internal: true,
      };

      const expected: IMaintenanceLane = {
        id: 2,
        name: 'Test Lane 2',
        unitUic: '67890',
        airframeFamilies: ['A-10'],
        subordinateUnits: ['Unit3'],
        location: null,
        isContractor: false,
        isInternal: true,
      };

      const result = mapToILane(dto);

      expect(result).toEqual(expected);
    });

    it('should default contractor and internal to false when undefined', () => {
      const dto: IMaintenanceLaneDto = {
        id: 3,
        name: 'Test Lane 3',
        unit: '11111',
        airframe_families: [],
        subordinate_units: [],
        location: null,
      };

      const expected: IMaintenanceLane = {
        id: 3,
        name: 'Test Lane 3',
        unitUic: '11111',
        airframeFamilies: [],
        subordinateUnits: [],
        location: null,
        isContractor: false,
        isInternal: false,
      };

      const result = mapToILane(dto);

      expect(result).toEqual(expected);
    });

    it('should handle empty arrays for airframe_families and subordinate_units', () => {
      const dto: IMaintenanceLaneDto = {
        id: 4,
        name: 'Test Lane 4',
        unit: '22222',
        airframe_families: [],
        subordinate_units: [],
        location: null,
        contractor: true,
        internal: true,
      };

      const expected: IMaintenanceLane = {
        id: 4,
        name: 'Test Lane 4',
        unitUic: '22222',
        airframeFamilies: [],
        subordinateUnits: [],
        location: null,
        isContractor: true,
        isInternal: true,
      };

      const result = mapToILane(dto);

      expect(result).toEqual(expected);
    });
  });
});
