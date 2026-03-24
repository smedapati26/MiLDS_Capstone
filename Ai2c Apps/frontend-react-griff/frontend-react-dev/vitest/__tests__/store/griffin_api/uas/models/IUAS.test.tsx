/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import {
  isSyncKey,
  IUasDto,
  IUASIn,
  mapIUasInToDto,
  mapToUas,
  UAC_EQUIPMENT_DETAILS_COLUMNS,
  UAV_EQUIPMENT_DETAILS_COLUMNS,
} from '@store/griffin_api/uas/models/IUAS';

describe('mapToUas', () => {
  const baseDto: IUasDto = {
    location_code: 'LOC1',
    location_name: 'Location Name',
    id: '123',
    serial_number: 'SN001',
    model: 'ModelX',
    status: 'FMC',
    rtl: 'RTL1',
    current_unit: 'Unit1',
    short_name: 'Shorty',
    remarks: 'Some remarks',
    date_down: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
    ecd: '2024-01-01',
    last_sync_time: '2024-01-02',
    last_update_time: '2024-01-03',
    should_sync: true,
    field_sync_status: { foo_bar: true, baz_qux: false },
    total_airframe_hours: 100,
    flight_hours: 50,
  };

  it('maps fields correctly and applies camelCase to field_sync_status keys', () => {
    const result = mapToUas(baseDto);

    expect(result.locationCode).toBe(baseDto.location_code);
    expect(result.locationName).toBe(baseDto.location_name);
    expect(result.serialNumber).toBe(baseDto.serial_number);
    expect(result.model).toBe(baseDto.model);
    expect(result.status).toBe(baseDto.status);
    expect(result.rtl).toBe(baseDto.rtl);
    expect(result.currentUnit).toBe(baseDto.current_unit);
    expect(result.shortName).toBe(baseDto.short_name);
    expect(result.totalAirframeHours).toBe(baseDto.total_airframe_hours);
    expect(result.flightHours).toBe(baseDto.flight_hours);
    expect(result.remarks).toBe(baseDto.remarks);
    expect(result.dateDown).toBe(baseDto.date_down);
    expect(result.ecd).toBe(baseDto.ecd);
    expect(result.lastSyncTime).toBe(baseDto.last_sync_time);
    expect(result.lastUpdateTime).toBe(baseDto.last_update_time);
    expect(result.shouldSync).toBe(baseDto.should_sync);

    // Derived fields
    expect(result.dateDownCount).toBe(dayjs().diff(baseDto.date_down, 'day'));
    expect(result.displayStatus).toBe(baseDto.status);

    // camelCase keys
    expect(result.fieldSyncStatus).toEqual({
      fooBar: true,
      bazQux: false,
    });
  });

  it('defaults totalAirframeHours and flightHours to 0 if undefined', () => {
    const dto = { ...baseDto, total_airframe_hours: undefined, flight_hours: undefined };
    const result = mapToUas(dto);
    expect(result.totalAirframeHours).toBe(0);
    expect(result.flightHours).toBe(0);
  });
});

describe('UAS_EQUIPMENT_DETAILS_COLUMNS', () => {
  it('has expected columns and keys', () => {
    expect(UAV_EQUIPMENT_DETAILS_COLUMNS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'SN', key: 'serialNumber', width: '10%', sortable: true }),
        expect.objectContaining({ label: 'Status', key: 'rtl', width: '10%' }),
        expect.objectContaining({ label: 'OR Status', key: 'displayStatus', width: '10%' }),
        expect.objectContaining({ label: 'Remarks', key: 'remarks', width: '30%' }),
        expect.objectContaining({ label: 'ECD', key: 'ecd', width: '10%' }),
        expect.objectContaining({ label: 'Airframe Hrs', key: 'totalAirframeHours', width: '10%' }),
        expect.objectContaining({ label: 'Period Hrs', key: 'flightHours', width: '10%' }),
        expect.objectContaining({ label: 'Location', key: 'locationCode', width: '10%' }),
        expect.objectContaining({ label: 'Actions', key: 'actions', width: '5%' }),
      ]),
    );
  });
});

describe('UAC_EQUIPMENT_DETAILS_COLUMNS', () => {
  it('has expected columns and keys', () => {
    expect(UAC_EQUIPMENT_DETAILS_COLUMNS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'SN', key: 'serialNumber', width: '10%', sortable: true }),
        expect.objectContaining({ label: 'OR Status', key: 'displayStatus', width: '10%' }),
        expect.objectContaining({ label: 'Remarks', key: 'remarks', width: '40%' }),
        expect.objectContaining({ label: 'ECD', key: 'ecd', width: '10%' }),
        expect.objectContaining({ label: 'Location', key: 'locationCode', width: '10%' }),
        expect.objectContaining({ label: 'Actions', key: 'actions', width: '5%' }),
      ]),
    );
  });
});

describe('mapIUasInToDto', () => {
  it('maps basic fields correctly', () => {
    const input: IUASIn = {
      locationId: 123,
      status: 'FMC',
      rtl: 'RTL1',
      remarks: 'Test remarks',
      flightHours: '50',
    };

    const result = mapIUasInToDto(input);

    expect(result.location_id).toBe(123);
    expect(result.status).toBe('FMC');
    expect(result.rtl).toBe('RTL1');
    expect(result.remarks).toBe('Test remarks');
    expect(result.flight_hours).toBe('50');
  });

  it('handles null locationId', () => {
    const input: IUASIn = {
      locationId: null,
      status: 'FMC',
      rtl: 'RTL1',
      remarks: 'Test remarks',
    };

    const result = mapIUasInToDto(input);

    expect(result.location_id).toBeNull();
  });

  it('handles undefined locationId', () => {
    const input: IUASIn = {
      status: 'FMC',
      rtl: 'RTL1',
      remarks: 'Test remarks',
    };

    const result = mapIUasInToDto(input);

    expect(result.location_id).toBeUndefined();
  });

  it('handles undefined flightHours', () => {
    const input: IUASIn = {
      locationId: 123,
      status: 'FMC',
      rtl: 'RTL1',
      remarks: 'Test remarks',
    };

    const result = mapIUasInToDto(input);

    expect(result.flight_hours).toBeUndefined();
  });

  it('maps fieldSyncStatus to sync_* keys correctly', () => {
    const input: IUASIn = {
      locationId: 123,
      status: 'FMC',
      rtl: 'RTL1',
      remarks: 'Test remarks',
      fieldSyncStatus: {
        serialNumber: true,
        ecd: false,
        equipmentNumber: true,
        model: false,
        status: true,
        rtl: false,
        totalAirframeHours: true,
        remarks: false,
        dateDown: true,
        location: false,
      },
    };

    const result = mapIUasInToDto(input);

    expect(result.sync_serial_number).toBe(true);
    expect(result.sync_ecd).toBe(false);
    expect(result.sync_equipment_number).toBe(true);
    expect(result.sync_model).toBe(false);
    expect(result.sync_status).toBe(true);
    expect(result.sync_rtl).toBe(false);
    expect(result.sync_total_airframe_hours).toBe(true);
    expect(result.sync_remarks).toBe(false);
    expect(result.sync_date_down).toBe(true);
    expect(result.sync_location).toBe(false);
  });

  it('handles undefined fieldSyncStatus', () => {
    const input: IUASIn = {
      locationId: 123,
      status: 'FMC',
      rtl: 'RTL1',
      remarks: 'Test remarks',
    };

    const result = mapIUasInToDto(input);

    expect(result.sync_serial_number).toBeUndefined();
    expect(result.sync_ecd).toBeUndefined();
    expect(result.sync_model).toBeUndefined();
  });

  it('handles empty fieldSyncStatus object', () => {
    const input: IUASIn = {
      locationId: 123,
      status: 'FMC',
      rtl: 'RTL1',
      remarks: 'Test remarks',
      fieldSyncStatus: {},
    };

    const result = mapIUasInToDto(input);

    expect(result.sync_serial_number).toBeUndefined();
    expect(result.sync_ecd).toBeUndefined();
  });

  it('ignores invalid sync keys in fieldSyncStatus', () => {
    const input: IUASIn = {
      locationId: 123,
      status: 'FMC',
      rtl: 'RTL1',
      remarks: 'Test remarks',
      fieldSyncStatus: {
        serialNumber: true,
        invalidKey: true, // This should be ignored
        anotherInvalidKey: false, // This should be ignored
      },
    };

    const result = mapIUasInToDto(input);

    expect(result.sync_serial_number).toBe(true);
    expect((result as any).sync_invalid_key).toBeUndefined();
    expect((result as any).sync_another_invalid_key).toBeUndefined();
  });

  it('handles mixed valid and invalid keys in fieldSyncStatus', () => {
    const input: IUASIn = {
      locationId: 123,
      status: 'FMC',
      rtl: 'RTL1',
      remarks: 'Test remarks',
      fieldSyncStatus: {
        serialNumber: true,
        invalidKey: true,
        ecd: false,
        anotherInvalid: true,
        model: true,
      },
    };

    const result = mapIUasInToDto(input);

    expect(result.sync_serial_number).toBe(true);
    expect(result.sync_ecd).toBe(false);
    expect(result.sync_model).toBe(true);
    expect((result as any).sync_invalid_key).toBeUndefined();
    expect((result as any).sync_another_invalid).toBeUndefined();
  });
});

describe('isSyncKey', () => {
  it('returns true for valid sync keys', () => {
    expect(isSyncKey('sync_serial_number')).toBe(true);
    expect(isSyncKey('sync_ecd')).toBe(true);
    expect(isSyncKey('sync_equipment_number')).toBe(true);
    expect(isSyncKey('sync_model')).toBe(true);
    expect(isSyncKey('sync_status')).toBe(true);
    expect(isSyncKey('sync_rtl')).toBe(true);
    expect(isSyncKey('sync_total_airframe_hours')).toBe(true);
    expect(isSyncKey('sync_flight_hours')).toBe(true);
    expect(isSyncKey('sync_remarks')).toBe(true);
    expect(isSyncKey('sync_date_down')).toBe(true);
    expect(isSyncKey('sync_location')).toBe(true);
  });

  it('returns false for invalid sync keys', () => {
    expect(isSyncKey('sync_invalid')).toBe(false);
    expect(isSyncKey('invalid_key')).toBe(false);
    expect(isSyncKey('serial_number')).toBe(false);
    expect(isSyncKey('sync_')).toBe(false);
    expect(isSyncKey('')).toBe(false);
    expect(isSyncKey('SYNC_SERIAL_NUMBER')).toBe(false);
  });
});

describe('mapToUas - edge cases', () => {
  it('handles empty field_sync_status object', () => {
    const dto: IUasDto = {
      id: '123',
      serial_number: 'SN001',
      model: 'ModelX',
      status: 'FMC',
      rtl: 'RTL1',
      current_unit: 'Unit1',
      short_name: 'Shorty',
      remarks: 'Some remarks',
      date_down: dayjs().format('YYYY-MM-DD'),
      ecd: '2024-01-01',
      last_sync_time: '2024-01-02',
      last_update_time: '2024-01-03',
      should_sync: true,
      field_sync_status: {},
    };

    const result = mapToUas(dto);

    expect(result.fieldSyncStatus).toEqual({});
  });

  it('handles numeric id', () => {
    const dto: IUasDto = {
      id: 456,
      serial_number: 'SN001',
      model: 'ModelX',
      status: 'FMC',
      rtl: 'RTL1',
      current_unit: 'Unit1',
      short_name: 'Shorty',
      remarks: 'Some remarks',
      date_down: dayjs().format('YYYY-MM-DD'),
      ecd: '2024-01-01',
      last_sync_time: '2024-01-02',
      last_update_time: '2024-01-03',
      should_sync: true,
      field_sync_status: {},
    };

    const result = mapToUas(dto);

    expect(result.id).toBe(456);
  });

  it('handles undefined optional fields', () => {
    const dto: IUasDto = {
      id: '123',
      serial_number: 'SN001',
      model: 'ModelX',
      status: 'FMC',
      rtl: 'RTL1',
      current_unit: 'Unit1',
      short_name: 'Shorty',
      remarks: 'Some remarks',
      date_down: dayjs().format('YYYY-MM-DD'),
      ecd: '2024-01-01',
      last_sync_time: '2024-01-02',
      last_update_time: '2024-01-03',
      should_sync: true,
      field_sync_status: {},
    };

    const result = mapToUas(dto);

    expect(result.locationCode).toBeUndefined();
    expect(result.locationName).toBeUndefined();
    expect(result.locationId).toBeUndefined();
  });

  it('calculates dateDownCount correctly for different dates', () => {
    const testDate = dayjs().subtract(10, 'day').format('YYYY-MM-DD');
    const dto: IUasDto = {
      id: '123',
      serial_number: 'SN001',
      model: 'ModelX',
      status: 'FMC',
      rtl: 'RTL1',
      current_unit: 'Unit1',
      short_name: 'Shorty',
      remarks: 'Some remarks',
      date_down: testDate,
      ecd: '2024-01-01',
      last_sync_time: '2024-01-02',
      last_update_time: '2024-01-03',
      should_sync: true,
      field_sync_status: {},
    };

    const result = mapToUas(dto);

    expect(result.dateDownCount).toBe(10);
  });

  it('handles should_sync false', () => {
    const dto: IUasDto = {
      id: '123',
      serial_number: 'SN001',
      model: 'ModelX',
      status: 'FMC',
      rtl: 'RTL1',
      current_unit: 'Unit1',
      short_name: 'Shorty',
      remarks: 'Some remarks',
      date_down: dayjs().format('YYYY-MM-DD'),
      ecd: '2024-01-01',
      last_sync_time: '2024-01-02',
      last_update_time: '2024-01-03',
      should_sync: false,
      field_sync_status: {},
    };

    const result = mapToUas(dto);

    expect(result.shouldSync).toBe(false);
  });
});

describe('Column configurations', () => {
  it('UAV_EQUIPMENT_DETAILS_COLUMNS has correct number of columns', () => {
    expect(UAV_EQUIPMENT_DETAILS_COLUMNS).toHaveLength(9);
  });

  it('UAC_EQUIPMENT_DETAILS_COLUMNS has correct number of columns', () => {
    expect(UAC_EQUIPMENT_DETAILS_COLUMNS).toHaveLength(6);
  });

  it('all UAV columns have required properties', () => {
    UAV_EQUIPMENT_DETAILS_COLUMNS.forEach((column) => {
      expect(column).toHaveProperty('label');
      expect(column).toHaveProperty('key');
      expect(column).toHaveProperty('width');
      expect(typeof column.label).toBe('string');
      expect(typeof column.key).toBe('string');
    });
  });

  it('all UAC columns have required properties', () => {
    UAC_EQUIPMENT_DETAILS_COLUMNS.forEach((column) => {
      expect(column).toHaveProperty('label');
      expect(column).toHaveProperty('key');
      expect(column).toHaveProperty('width');
      expect(typeof column.label).toBe('string');
      expect(typeof column.key).toBe('string');
    });
  });
});