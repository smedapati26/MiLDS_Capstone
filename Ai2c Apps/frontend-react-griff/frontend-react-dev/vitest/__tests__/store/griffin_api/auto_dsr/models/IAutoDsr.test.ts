/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

import {
  AcdUploadStatus,
  IAcdHistoryOutDto,
  IAcdProcessMessagesOutDto,
  IAutoDsrDto,
  IAutoDsrLocation,
  IAutoDsrLocationDto,
  IAutoDsrSimilarUnitsDto,
  IAutoDsrSingleUnitInfoDto,
  ILocationDto,
  mapToAcdHistoryOut,
  mapToAutoDsrSimilarUnits,
  mapToAutoDsrSingleUnitInfo,
  mapToIAutoDsr,
  mapToIAutoDsrLocation,
  mapToIAutoDsrLocationDto,
  mapToILocation,
} from '@store/griffin_api/auto_dsr/models';
import { IAppUserDto } from '@store/griffin_api/users/models';

vi.mock('dayjs', () => ({
  default: vi.fn(() => ({
    diff: vi.fn(() => 10),
  })),
}));

describe('mapToILocation', () => {
  it('should map ILocationDto to ILocation with all fields present', () => {
    const dto: ILocationDto = {
      abbreviation: 'ABBR',
      code: 'CODE',
      mgrs: 'MGRS123',
      name: 'Location Name',
      short_name: 'Short Name',
    };

    const result = mapToILocation(dto);

    expect(result.abbreviation).toBe('ABBR');
    expect(result.code).toBe('CODE');
    expect(result.mgrs).toBe('MGRS123');
    expect(result.name).toBe('Location Name');
    expect(result.shortName).toBe('Short Name');
  });

  it('should map optional fields to undefined when not provided', () => {
    const dto: ILocationDto = {
      mgrs: 'MGRS123',
    };

    const result = mapToILocation(dto);

    expect(result.abbreviation).toBeUndefined();
    expect(result.code).toBeUndefined();
    expect(result.mgrs).toBe('MGRS123');
    expect(result.name).toBeUndefined();
    expect(result.shortName).toBeUndefined();
  });

  it('should handle partial optional fields', () => {
    const dto: ILocationDto = {
      abbreviation: 'ABBR',
      mgrs: 'MGRS123',
      name: 'Location Name',
    };

    const result = mapToILocation(dto);

    expect(result.abbreviation).toBe('ABBR');
    expect(result.code).toBeUndefined();
    expect(result.mgrs).toBe('MGRS123');
    expect(result.name).toBe('Location Name');
    expect(result.shortName).toBeUndefined();
  });
});

describe('mapToIAutoDsr', () => {
  it('should map IAutoDsrDto to IAutoDsr correctly', () => {
    const dto: IAutoDsrDto = {
      serial_number: 'SN001',
      owning_unit_uic: 'UIC1',
      owning_unit_name: 'Unit 1',
      current_unit_uic: 'UIC1',
      current_unit_name: 'Unit 1',
      location: { mgrs: 'Loc1' },
      model: 'Model1',
      status: 'FMC',
      rtl: 'RTL',
      remarks: 'Remarks',
      date_down: '2023-01-01',
      ecd: '2023-12-31',
      hours_to_phase: 100,
      flying_hours: 200,
      last_sync_time: '2023-01-01T00:00:00Z',
      last_export_upload_time: '2023-01-01T00:00:00Z',
      last_user_edit_time: '2023-01-01T00:00:00Z',
      data_update_time: '2023-01-01T00:00:00Z',
      modifications: [],
    };

    const result = mapToIAutoDsr(dto);

    expect(result.serialNumber).toBe('SN001');
    expect(result.owningUnitUic).toBe('UIC1');
    expect(result.owningUnitName).toBe('Unit 1');
    expect(result.currentUnitUic).toBe('UIC1');
    expect(result.currentUnitName).toBe('Unit 1');
    expect(result.location.mgrs).toBe('Loc1');
    expect(result.location.abbreviation).toBeUndefined();
    expect(result.location.code).toBeUndefined();
    expect(result.location.name).toBeUndefined();
    expect(result.location.shortName).toBeUndefined();
    expect(result.model).toBe('Model1');
    expect(result.status).toBe('FMC');
    expect(result.rtl).toBe('RTL');
    expect(result.remarks).toBe('Remarks');
    expect(result.dateDown).toBe('2023-01-01');
    expect(result.dateDownCount).toBeGreaterThan(1); // Counts how many days since down date
    expect(result.ecd).toBe('2023-12-31');
    expect(result.hoursToPhase).toBe(100);
    expect(result.flyingHours).toBe('200.0');
    expect(result.lastSyncTime).toBe('2023-01-01T00:00:00Z');
    expect(result.lastExportUploadTime).toBe('2023-01-01T00:00:00Z');
    expect(result.lastUserEditTime).toBe('2023-01-01T00:00:00Z');
    expect(result.dataUpdateTime).toBe('2023-01-01T00:00:00Z');
    expect(result.modifications).toEqual([]);
  });

  it('should handle different values', () => {
    const dto: IAutoDsrDto = {
      serial_number: 'SN002',
      owning_unit_uic: 'UIC2',
      owning_unit_name: 'Unit 2',
      current_unit_uic: 'UIC2',
      current_unit_name: 'Unit 2',
      location: { mgrs: 'Loc2' },
      model: 'Model2',
      status: 'NMC',
      rtl: 'NRTL',
      remarks: '',
      date_down: '2023-01-02',
      ecd: '2023-12-30',
      hours_to_phase: 150,
      flying_hours: 250,
      last_sync_time: '2023-01-02T00:00:00Z',
      last_export_upload_time: '2023-01-02T00:00:00Z',
      last_user_edit_time: '2023-01-02T00:00:00Z',
      data_update_time: '2023-01-02T00:00:00Z',
      modifications: [],
    };

    const result = mapToIAutoDsr(dto);

    expect(result.serialNumber).toBe('SN002');
    expect(result.owningUnitUic).toBe('UIC2');
    expect(result.owningUnitName).toBe('Unit 2');
    expect(result.location.mgrs).toBe('Loc2');
    expect(result.location.abbreviation).toBeUndefined();
    expect(result.location.code).toBeUndefined();
    expect(result.location.name).toBeUndefined();
    expect(result.location.shortName).toBeUndefined();
    expect(result.model).toBe('Model2');
    expect(result.status).toBe('NMC');
    expect(result.rtl).toBe('NRTL');
    expect(result.remarks).toBe('');
    expect(result.dateDown).toBe('2023-01-02');
    expect(result.dateDownCount).toBeGreaterThan(1); // Counts how many days since down date
    expect(result.ecd).toBe('2023-12-30');
    expect(result.hoursToPhase).toBe(150);
    expect(result.flyingHours).toBe('250.0');
    expect(result.lastSyncTime).toBe('2023-01-02T00:00:00Z');
    expect(result.lastExportUploadTime).toBe('2023-01-02T00:00:00Z');
    expect(result.lastUserEditTime).toBe('2023-01-02T00:00:00Z');
    expect(result.dataUpdateTime).toBe('2023-01-02T00:00:00Z');
    expect(result.modifications).toEqual([]);
  });

  it('should test I auto_dsr location', () => {
    const dto: IAutoDsrLocationDto = {
      id: 1,
      name: 'test',
      code: 'test',
    };

    const expected: IAutoDsrLocation = {
      id: 1,
      name: 'test',
      code: 'test',
    };

    const result = mapToIAutoDsrLocation(dto);
    expect(result).toEqual(expected);

    const reverse = mapToIAutoDsrLocationDto(expected);
    expect(reverse).toEqual(dto);
  });
});

describe('mapToAutoDsrSimilarUnits', () => {
  it('should map IAutoDsrSimilarUnitsDto to IAutoDsrSimilarUnits', () => {
    const dto: IAutoDsrSimilarUnitsDto = {
      uic: 'UIC123',
      short_name: 'ShortName123',
    };

    const result = mapToAutoDsrSimilarUnits(dto);

    expect(result.uic).toBe('UIC123');
    expect(result.shortName).toBe('ShortName123');
  });

  it('should handle missing short_name', () => {
    const dto: IAutoDsrSimilarUnitsDto = {
      uic: 'UIC456',
      short_name: undefined as any,
    };

    const result = mapToAutoDsrSimilarUnits(dto);

    expect(result.uic).toBe('UIC456');
    expect(result.shortName).toBeUndefined();
  });
});

describe('mapToAutoDsrSingleUnitInfo', () => {
  it('should map IAutoDsrSingleUnitInfoDto to IAutoDsrSingleUnitInfo', () => {
    const dto: IAutoDsrSingleUnitInfoDto = {
      uic: 'UIC789',
      short_name: 'ShortName789',
      display_name: 'DisplayName789',
      nick_name: 'NickName789',
      echelon: 'Echelon789',
      parent_uic: 'ParentUIC789',
      level: 2,
      similar_units: [
        { uic: 'UIC1', short_name: 'Short1' },
        { uic: 'UIC2', short_name: 'Short2' },
      ],
    };

    const result = mapToAutoDsrSingleUnitInfo(dto);

    expect(result.uic).toBe('UIC789');
    expect(result.shortName).toBe('ShortName789');
    expect(result.displayName).toBe('DisplayName789');
    expect(result.nickName).toBe('NickName789');
    expect(result.echelon).toBe('Echelon789');
    expect(result.parentUic).toBe('ParentUIC789');
    expect(result.level).toBe(2);
    expect(result.similarUnits).toEqual([
      { uic: 'UIC1', shortName: 'Short1' },
      { uic: 'UIC2', shortName: 'Short2' },
    ]);
  });

  it('should handle empty similar_units array', () => {
    const dto: IAutoDsrSingleUnitInfoDto = {
      uic: 'UIC000',
      short_name: 'ShortName000',
      display_name: 'DisplayName000',
      nick_name: 'NickName000',
      echelon: 'Echelon000',
      parent_uic: 'ParentUIC000',
      level: 0,
      similar_units: [],
    };

    const result = mapToAutoDsrSingleUnitInfo(dto);

    expect(result.similarUnits).toEqual([]);
  });

  it('should handle missing optional fields', () => {
    const dto: IAutoDsrSingleUnitInfoDto = {
      uic: 'UIC111',
      short_name: undefined as any,
      display_name: undefined as any,
      nick_name: undefined as any,
      echelon: undefined as any,
      parent_uic: undefined as any,
      level: 1,
      similar_units: [],
    };

    const result = mapToAutoDsrSingleUnitInfo(dto);

    expect(result.uic).toBe('UIC111');
    expect(result.shortName).toBeUndefined();
    expect(result.displayName).toBeUndefined();
    expect(result.nickName).toBeUndefined();
    expect(result.echelon).toBeUndefined();
    expect(result.parentUic).toBeUndefined();
    expect(result.level).toBe(1);
    expect(result.similarUnits).toEqual([]);
  });
});

describe('mapToAcdProcessMessagesOut', () => {
  it('should map IAcdProcessMessagesOutDto to IAcdProcessMessagesOut', () => {
    const dto: IAcdProcessMessagesOutDto = {
      message: 'Test message',
      message_dt: new Date('2023-01-01T12:00:00Z'),
    };

    // Since mapToAcdProcessMessagesOut is not exported, we test it through mapToAcdHistoryOut
    const historyDto: IAcdHistoryOutDto = {
      id: 1,
      user: {
        new_user: false,
        user_id: 'user123',
        rank: 'CPT',
        first_name: 'John',
        last_name: 'Doe',
        is_admin: false,
      } as IAppUserDto,
      messages: [dto],
      file_name: 'test.csv',
      uploaded_at: new Date('2023-01-01T12:00:00Z'),
      succeeded: true,
      unit: 'UIC123',
      upload_type: 'manual',
      status: 'Complete',
      sync: true,
    };

    const result = mapToAcdHistoryOut(historyDto);

    expect(result.messages).toBeDefined();
    expect(result.messages![0].message).toBe('Test message');
    expect(result.messages![0].messageDt).toEqual(new Date('2023-01-01T12:00:00Z'));
  });
});

describe('mapToAcdHistoryOut', () => {
  it('should map IAcdHistoryOutDto to IAcdHistoryOut with all fields present', () => {
    const dto: IAcdHistoryOutDto = {
      id: 1,
      user: {
        new_user: false,
        user_id: 'user123',
        rank: 'CPT',
        first_name: 'John',
        last_name: 'Doe',
        is_admin: false,
      } as IAppUserDto,
      messages: [
        {
          message: 'Processing started',
          message_dt: new Date('2023-01-01T12:00:00Z'),
        },
        {
          message: 'Processing completed',
          message_dt: new Date('2023-01-01T12:05:00Z'),
        },
      ],
      file_name: 'test_file.csv',
      uploaded_at: new Date('2023-01-01T11:55:00Z'),
      succeeded: true,
      unit: 'UIC123',
      upload_type: 'manual',
      status: 'Complete',
      sync: true,
    };

    const result = mapToAcdHistoryOut(dto);

    expect(result.id).toBe(1);
    expect(result.user).toBeDefined();
    expect(result.user?.userId).toBe('user123');
    expect(result.messages).toHaveLength(2);
    expect(result.messages![0].message).toBe('Processing started');
    expect(result.messages![0].messageDt).toEqual(new Date('2023-01-01T12:00:00Z'));
    expect(result.messages![1].message).toBe('Processing completed');
    expect(result.messages![1].messageDt).toEqual(new Date('2023-01-01T12:05:00Z'));
    expect(result.fileName).toBe('test_file.csv');
    expect(result.uploadedAt).toEqual(new Date('2023-01-01T11:55:00Z'));
    expect(result.succeeded).toBe(true);
    expect(result.unit).toBe('UIC123');
    expect(result.uploadType).toBe('manual');
    expect(result.status).toBe('Complete');
    expect(result.sync).toBe(true);
  });

  it('should handle string id', () => {
    const dto: IAcdHistoryOutDto = {
      id: 'abc-123',
      user: {
        new_user: false,
        user_id: 'user456',
        rank: 'MAJ',
        first_name: 'Jane',
        last_name: 'Smith',
        is_admin: true,
      } as IAppUserDto,
      messages: [],
      file_name: 'another_file.csv',
      uploaded_at: new Date('2023-02-01T10:00:00Z'),
      succeeded: false,
      unit: 'UIC456',
      upload_type: 'automatic',
      status: 'Pending',
      sync: false,
    };

    const result = mapToAcdHistoryOut(dto);

    expect(result.id).toBe('abc-123');
    expect(result.succeeded).toBe(false);
    expect(result.status).toBe('Pending');
    expect(result.sync).toBe(false);
  });

  it('should handle different upload statuses', () => {
    const statuses: AcdUploadStatus[] = ['Transmitting', 'Pending', 'Processing', 'Complete', 'Cancelled'];

    statuses.forEach((status) => {
      const dto: IAcdHistoryOutDto = {
        id: 1,
        user: {
          new_user: false,
          user_id: 'user789',
          rank: 'LT',
          first_name: 'Bob',
          last_name: 'Johnson',
          is_admin: false,
        } as IAppUserDto,
        messages: [],
        uploaded_at: new Date('2023-03-01T08:00:00Z'),
        succeeded: status === 'Complete',
        unit: 'UIC789',
        upload_type: 'manual',
        status: status,
        sync: true,
      };

      const result = mapToAcdHistoryOut(dto);

      expect(result.status).toBe(status);
    });
  });

  it('should handle optional fields being undefined', () => {
    const dto: IAcdHistoryOutDto = {
      user: {
        new_user: false,
        user_id: 'user456',
        rank: 'MAJ',
        first_name: 'Jane',
        last_name: 'Smith',
        is_admin: true,
      } as IAppUserDto,
      id: 2,
      messages: [],
      uploaded_at: new Date('2023-04-01T09:00:00Z'),
      succeeded: true,
      unit: 'UIC999',
      upload_type: 'automatic',
      status: 'Complete',
      sync: false,
    };

    const result = mapToAcdHistoryOut(dto);

    expect(result.id).toBe(2);
    expect(result.user).toBeDefined();
    expect(result.fileName).toBeUndefined();
    expect(result.messages).toEqual([]);
    expect(result.uploadedAt).toEqual(new Date('2023-04-01T09:00:00Z'));
    expect(result.succeeded).toBe(true);
    expect(result.unit).toBe('UIC999');
    expect(result.uploadType).toBe('automatic');
    expect(result.status).toBe('Complete');
    expect(result.sync).toBe(false);
  });

  it('should handle empty messages array', () => {
    const dto: IAcdHistoryOutDto = {
      id: 3,
      user: {
        new_user: true,
        user_id: 'user000',
        rank: 'SGT',
        first_name: 'Alice',
        last_name: 'Williams',
        is_admin: false,
      } as IAppUserDto,
      messages: [],
      file_name: 'empty_messages.csv',
      uploaded_at: new Date('2023-05-01T07:00:00Z'),
      succeeded: true,
      unit: 'UIC000',
      upload_type: 'manual',
      status: 'Complete',
      sync: true,
    };

    const result = mapToAcdHistoryOut(dto);

    expect(result.messages).toEqual([]);
  });

  it('should handle undefined messages', () => {
    const dto: IAcdHistoryOutDto = {
      id: 4,
      user: {
        new_user: false,
        user_id: 'user111',
        rank: 'COL',
        first_name: 'Charlie',
        last_name: 'Brown',
        is_admin: true,
      } as IAppUserDto,
      messages: undefined as any,
      file_name: 'no_messages.csv',
      uploaded_at: new Date('2023-06-01T06:00:00Z'),
      succeeded: false,
      unit: 'UIC111',
      upload_type: 'automatic',
      status: 'Cancelled',
      sync: false,
    };

    const result = mapToAcdHistoryOut(dto);

    expect(result.messages).toBeUndefined();
  });

  it('should handle multiple messages with different timestamps', () => {
    const dto: IAcdHistoryOutDto = {
      id: 5,
      user: {
        new_user: false,
        user_id: 'user222',
        rank: '1LT',
        first_name: 'David',
        last_name: 'Miller',
        is_admin: false,
      } as IAppUserDto,
      messages: [
        {
          message: 'Upload initiated',
          message_dt: new Date('2023-07-01T10:00:00Z'),
        },
        {
          message: 'Validation in progress',
          message_dt: new Date('2023-07-01T10:01:00Z'),
        },
        {
          message: 'Data processing',
          message_dt: new Date('2023-07-01T10:02:00Z'),
        },
        {
          message: 'Upload complete',
          message_dt: new Date('2023-07-01T10:03:00Z'),
        },
      ],
      file_name: 'multi_message.csv',
      uploaded_at: new Date('2023-07-01T09:59:00Z'),
      succeeded: true,
      unit: 'UIC222',
      upload_type: 'manual',
      status: 'Complete',
      sync: true,
    };

    const result = mapToAcdHistoryOut(dto);

    expect(result.messages).toHaveLength(4);
    expect(result.messages![0].message).toBe('Upload initiated');
    expect(result.messages![1].message).toBe('Validation in progress');
    expect(result.messages![2].message).toBe('Data processing');
    expect(result.messages![3].message).toBe('Upload complete');
  });

  it('should handle failed upload with error messages', () => {
    const dto: IAcdHistoryOutDto = {
      id: 6,
      user: {
        new_user: false,
        user_id: 'user333',
        rank: 'CPT',
        first_name: 'Eve',
        last_name: 'Davis',
        is_admin: false,
      } as IAppUserDto,
      messages: [
        {
          message: 'Upload started',
          message_dt: new Date('2023-08-01T14:00:00Z'),
        },
        {
          message: 'Error: Invalid file format',
          message_dt: new Date('2023-08-01T14:01:00Z'),
        },
      ],
      file_name: 'failed_upload.csv',
      uploaded_at: new Date('2023-08-01T13:59:00Z'),
      succeeded: false,
      unit: 'UIC333',
      upload_type: 'manual',
      status: 'Cancelled',
      sync: false,
    };

    const result = mapToAcdHistoryOut(dto);

    expect(result.succeeded).toBe(false);
    expect(result.status).toBe('Cancelled');
    expect(result.messages).toHaveLength(2);
    expect(result.messages![1].message).toBe('Error: Invalid file format');
  });
});
