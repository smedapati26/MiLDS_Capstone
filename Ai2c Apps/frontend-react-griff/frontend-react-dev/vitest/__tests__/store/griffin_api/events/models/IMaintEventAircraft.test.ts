import { describe, expect, it } from 'vitest';

import {
  IMaintEventAircraft,
  IMaintEventAircraftDto,
  mapToIMaintEventAircraft,
} from '@store/griffin_api/events/models/IMaintEventAircraft';

describe('IMaintEventAircraft', () => {
  describe('mapToIMaintEventAircraft', () => {
    it('should correctly map IMaintEventAircraftDto to IMaintEventAircraft', () => {
      const dto: IMaintEventAircraftDto = {
        serial: 'ABC123',
        current_unit: 'UNIT001',
        airframe: {
          model: 'ModelX',
          mds: 'MDS001',
        },
      };

      const expected: IMaintEventAircraft = {
        serialNumber: 'ABC123',
        currentUnitUic: 'UNIT001',
        model: 'ModelX',
        mds: 'MDS001',
      };

      const result = mapToIMaintEventAircraft(dto);

      expect(result).toEqual(expected);
    });

    it('should handle different values correctly', () => {
      const dto: IMaintEventAircraftDto = {
        serial: 'XYZ789',
        current_unit: 'UNIT002',
        airframe: {
          model: 'ModelY',
          mds: 'MDS002',
        },
      };

      const expected: IMaintEventAircraft = {
        serialNumber: 'XYZ789',
        currentUnitUic: 'UNIT002',
        model: 'ModelY',
        mds: 'MDS002',
      };

      const result = mapToIMaintEventAircraft(dto);

      expect(result).toEqual(expected);
    });
  });
});
