import { describe, expect, it } from 'vitest';

import {
  IInspectionType,
  IInspectionTypeDto,
  mapToIInspectionType,
} from '@store/griffin_api/inspections/models/IInspectionType';

describe('IInspectionType Models', () => {
  describe('IInspectionTypeDto interface', () => {
    it('should create a valid IInspectionTypeDto object', () => {
      const dto: IInspectionTypeDto = {
        id: 1,
        code: 'INS001',
        model: 'CH-47F',
        common_name: 'Annual Inspection',
        tracking_type: 'calendar',
        is_phase: false,
      };

      expect(dto.id).toBe(1);
      expect(dto.code).toBe('INS001');
      expect(dto.model).toBe('CH-47F');
      expect(dto.common_name).toBe('Annual Inspection');
      expect(dto.tracking_type).toBe('calendar');
      expect(dto.is_phase).toBe(false);
    });

    it('should handle phase inspections', () => {
      const dto: IInspectionTypeDto = {
        id: 2,
        code: 'PHASE001',
        model: 'UH-60A',
        common_name: 'Phase Check',
        tracking_type: 'hours',
        is_phase: true,
      };

      expect(dto.is_phase).toBe(true);
      expect(dto.tracking_type).toBe('hours');
    });
  });

  describe('IInspectionType interface', () => {
    it('should create a valid IInspectionType object', () => {
      const inspectionType: IInspectionType = {
        id: 1,
        code: 'INS001',
        model: 'CH-47F',
        commonName: 'Annual Inspection',
        trackingType: 'calendar',
        isPhase: false,
      };

      expect(inspectionType.id).toBe(1);
      expect(inspectionType.code).toBe('INS001');
      expect(inspectionType.model).toBe('CH-47F');
      expect(inspectionType.commonName).toBe('Annual Inspection');
      expect(inspectionType.trackingType).toBe('calendar');
      expect(inspectionType.isPhase).toBe(false);
    });

    it('should handle phase inspections', () => {
      const inspectionType: IInspectionType = {
        id: 2,
        code: 'PHASE001',
        model: 'UH-60A',
        commonName: 'Phase Check',
        trackingType: 'hours',
        isPhase: true,
      };

      expect(inspectionType.isPhase).toBe(true);
      expect(inspectionType.trackingType).toBe('hours');
    });
  });

  describe('mapToIInspectionType function', () => {
    it('should correctly map IInspectionTypeDto to IInspectionType', () => {
      const dto: IInspectionTypeDto = {
        id: 1,
        code: 'INS001',
        model: 'CH-47F',
        common_name: 'Annual Inspection',
        tracking_type: 'calendar',
        is_phase: false,
      };

      const result = mapToIInspectionType(dto);

      expect(result).toEqual({
        id: 1,
        code: 'INS001',
        model: 'CH-47F',
        commonName: 'Annual Inspection',
        trackingType: 'calendar',
        isPhase: false,
      });
    });

    it('should handle phase inspections mapping', () => {
      const dto: IInspectionTypeDto = {
        id: 2,
        code: 'PHASE001',
        model: 'UH-60A',
        common_name: 'Phase Maintenance',
        tracking_type: 'hours',
        is_phase: true,
      };

      const result = mapToIInspectionType(dto);

      expect(result.isPhase).toBe(true);
      expect(result.commonName).toBe('Phase Maintenance');
      expect(result.trackingType).toBe('hours');
    });

    it('should handle different tracking types', () => {
      const calendarDto: IInspectionTypeDto = {
        id: 3,
        code: 'CAL001',
        model: 'AH-64D',
        common_name: 'Calendar Inspection',
        tracking_type: 'calendar',
        is_phase: false,
      };

      const hoursDto: IInspectionTypeDto = {
        id: 4,
        code: 'HRS001',
        model: 'AH-64D',
        common_name: 'Hours Inspection',
        tracking_type: 'hours',
        is_phase: false,
      };

      const calendarResult = mapToIInspectionType(calendarDto);
      const hoursResult = mapToIInspectionType(hoursDto);

      expect(calendarResult.trackingType).toBe('calendar');
      expect(hoursResult.trackingType).toBe('hours');
    });

    it('should preserve all numeric and boolean values correctly', () => {
      const dto: IInspectionTypeDto = {
        id: 999,
        code: 'TEST999',
        model: 'TEST_MODEL',
        common_name: 'Test Inspection',
        tracking_type: 'test',
        is_phase: true,
      };

      const result = mapToIInspectionType(dto);

      expect(result.id).toBe(999);
      expect(result.isPhase).toBe(true);
      expect(result.code).toBe('TEST999');
      expect(result.model).toBe('TEST_MODEL');
      expect(result.commonName).toBe('Test Inspection');
      expect(result.trackingType).toBe('test');
    });

    it('should handle empty strings and zero values', () => {
      const dto: IInspectionTypeDto = {
        id: 0,
        code: '',
        model: '',
        common_name: '',
        tracking_type: '',
        is_phase: false,
      };

      const result = mapToIInspectionType(dto);

      expect(result.id).toBe(0);
      expect(result.code).toBe('');
      expect(result.model).toBe('');
      expect(result.commonName).toBe('');
      expect(result.trackingType).toBe('');
      expect(result.isPhase).toBe(false);
    });
  });
});
