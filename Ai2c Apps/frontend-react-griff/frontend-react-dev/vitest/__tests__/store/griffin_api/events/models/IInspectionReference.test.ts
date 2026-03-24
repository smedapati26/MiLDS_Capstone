import { describe, expect, it } from 'vitest';

import {
  IInspectionReference,
  IInspectionReferenceDto,
  mapToInspectionReference,
} from '@store/griffin_api/events/models/IInspectionReference';

describe('IInspectionReference', () => {
  describe('mapToInspectionReference', () => {
    it('should correctly map IInspectionReferenceDto to IInspectionReference', () => {
      const dto: IInspectionReferenceDto = {
        id: 1,
        common_name: 'Test Inspection',
        code: 'TI',
        is_phase: false,
      };

      const expected: IInspectionReference = {
        id: 1,
        commonName: 'Test Inspection',
        code: 'TI',
        isPhase: false,
      };

      const result = mapToInspectionReference(dto);

      expect(result).toEqual(expected);
    });

    it('should handle is_phase true', () => {
      const dto: IInspectionReferenceDto = {
        id: 2,
        common_name: 'Phase Inspection',
        code: 'PI',
        is_phase: true,
      };

      const expected: IInspectionReference = {
        id: 2,
        commonName: 'Phase Inspection',
        code: 'PI',
        isPhase: true,
      };

      const result = mapToInspectionReference(dto);

      expect(result).toEqual(expected);
    });
  });
});
