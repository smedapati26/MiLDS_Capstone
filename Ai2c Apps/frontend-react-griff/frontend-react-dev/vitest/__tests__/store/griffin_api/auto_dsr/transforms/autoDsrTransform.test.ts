import { describe, expect, it } from 'vitest';

import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { IAutoDsrDto } from '@store/griffin_api/auto_dsr/models';
import { NMCM_STATUSES, transformAutoDsr } from '@store/griffin_api/auto_dsr/transforms/autoDsrTransform';

describe('autoDsrTransform', () => {
  describe('NMCM_STATUSES', () => {
    it('should include the correct statuses', () => {
      expect(NMCM_STATUSES).toEqual([
        OperationalReadinessStatusEnum.NMC,
        OperationalReadinessStatusEnum.NMCM,
        OperationalReadinessStatusEnum.SUST,
        OperationalReadinessStatusEnum.FIELD,
        OperationalReadinessStatusEnum.MOC, // Added MOC
      ]);
    });
  });

  describe('transformAutoDsr', () => {
    it('should transform data correctly', () => {
      const mockData: IAutoDsrDto[] = [
        {
          serial_number: 'SN001',
          owning_unit_uic: 'UIC1',
          owning_unit_name: 'Unit 1',
          current_unit_uic: 'UIC1',
          current_unit_name: 'Unit 1',
          location: { mgrs: 'Loc1' },
          model: 'Model1',
          status: OperationalReadinessStatusEnum.FMC,
          rtl: 'RTL',
          remarks: '',
          date_down: '2023-01-01',
          ecd: '2023-12-31',
          hours_to_phase: 100,
          flying_hours: 200,
          last_sync_time: '2023-01-01T00:00:00Z',
          last_export_upload_time: '2023-01-01T00:00:00Z',
          last_user_edit_time: '2023-01-01T00:00:00Z',
          data_update_time: '2023-01-01T00:00:00Z',
          modifications: [],
        },
        {
          serial_number: 'SN002',
          owning_unit_uic: 'UIC1',
          owning_unit_name: 'Unit 1',
          current_unit_uic: 'UIC1',
          current_unit_name: 'Unit 1',
          location: { mgrs: 'Loc1' },
          model: 'Model1',
          status: OperationalReadinessStatusEnum.PMCS,
          rtl: 'NRTL',
          remarks: '',
          date_down: '2023-01-02',
          ecd: '2023-12-31',
          hours_to_phase: 150,
          flying_hours: 250,
          last_sync_time: '2023-01-02T00:00:00Z',
          last_export_upload_time: '2023-01-02T00:00:00Z',
          last_user_edit_time: '2023-01-02T00:00:00Z',
          data_update_time: '2023-01-02T00:00:00Z',
          modifications: [],
        },
        {
          serial_number: 'SN003',
          owning_unit_uic: 'UIC2',
          owning_unit_name: 'Unit 2',
          current_unit_uic: 'UIC2',
          current_unit_name: 'Unit 2',
          location: { mgrs: 'Loc2' },
          model: 'Model2',
          status: OperationalReadinessStatusEnum.NMCM,
          rtl: 'RTL',
          remarks: '',
          date_down: '2023-01-03',
          ecd: '2023-12-31',
          hours_to_phase: 200,
          flying_hours: 300,
          last_sync_time: '2023-01-03T00:00:00Z',
          last_export_upload_time: '2023-01-03T00:00:00Z',
          last_user_edit_time: '2023-01-03T00:00:00Z',
          data_update_time: '2023-01-03T00:00:00Z',
          modifications: [],
        },
        {
          serial_number: 'SN004',
          owning_unit_uic: 'UIC2',
          owning_unit_name: 'Unit 2',
          current_unit_uic: 'UIC2',
          current_unit_name: 'Unit 2',
          location: { mgrs: 'Loc2' },
          model: 'Model2',
          status: OperationalReadinessStatusEnum.NMC,
          rtl: 'NRTL',
          remarks: '',
          date_down: '2023-01-04',
          ecd: '2023-12-31',
          hours_to_phase: 250,
          flying_hours: 350,
          last_sync_time: '2023-01-04T00:00:00Z',
          last_export_upload_time: '2023-01-04T00:00:00Z',
          last_user_edit_time: '2023-01-04T00:00:00Z',
          data_update_time: '2023-01-04T00:00:00Z',
          modifications: [],
        },
      ];

      const result = transformAutoDsr(mockData);

      expect(result.totalAircraft).toBe(4);
      expect(result.rtl).toBe(2);
      expect(result.nrtl).toBe(2);
      expect(result.units).toHaveLength(2);
      expect(result.units[0].uic).toBe('UIC1');
      expect(result.units[1].uic).toBe('UIC2');
      expect(result.aircraftStatusStats).toHaveLength(6); // FMC, PMCS, PMCM, NMCS, NMCM, DADE
      const fmcStat = result.aircraftStatusStats.find((s) => s.status === OperationalReadinessStatusEnum.FMC);
      expect(fmcStat?.count).toBe(1);
      expect(fmcStat?.percentage).toBe(0.25);
      const nmcmStat = result.aircraftStatusStats.find((s) => s.status === OperationalReadinessStatusEnum.NMCM);
      expect(nmcmStat?.count).toBe(2); // NMCM and NMC
      expect(nmcmStat?.percentage).toBe(0.5);
    });

    it('should handle empty array', () => {
      const result = transformAutoDsr([]);
      expect(result.totalAircraft).toBe(0);
      expect(result.rtl).toBe(0);
      expect(result.nrtl).toBe(0);
      expect(result.units).toHaveLength(0);
      expect(result.aircraftStatusStats).toHaveLength(6);
      result.aircraftStatusStats.forEach((stat) => {
        expect(stat.count).toBe(0);
        expect(stat.percentage).toBe(0);
      });
    });
  });
});