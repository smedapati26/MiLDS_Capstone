import { describe, expect, it } from 'vitest';

import { Echelon } from '@ai2c/pmx-mui';

import { EventType, GoNoGoStatus, IDa7817s, IDa7817sDto } from '@store/amap_ai/events';
import { mapResponseData } from '@utils/helpers/dataTransformer';

// The function to map IDa7817sDto to IDa7817s
const mapToIDa7817s = (dto: IDa7817sDto): IDa7817s => ({
  id: dto.id,
  soldierId: dto.soldier_id,
  date: dto.date,
  uicId: dto.uic_id,
  eventType: dto.event_type as EventType,
  trainingType: dto.training_type,
  evaluationType: dto.evaluation_type,
  goNogo: dto.go_nogo as GoNoGoStatus,
  gainingUnitId: dto.gaining_unit_id,
  gainingUnit: dto.gaining_unit,
  tcsLocation: dto.tcs_location,
  awardType: dto.award_type,
  totalMxHours: dto.total_mx_hours,
  comment: dto.comment,
  maintenanceLevel: dto.maintenance_level,
  recordedByLegacy: dto.recorded_by_legacy,
  recordedById: dto.recorded_by_id,
  recordedByNonLegacy: dto.recorded_by_non_legacy,
  attachedDa4856Id: dto.attached_da_4856_id,
  eventDeleted: dto.event_deleted,
  mos: dto.mos,
  eventTasks: dto.event_tasks.map((task) => mapResponseData(task) as { number: string; name: string; goNogo: string }),
  hasAssociations: dto.has_associations,
});

describe('mapToIDa7817s', () => {
  it('should map a valid IDa7817sDto to an IDa7817s correctly', () => {
    const dto: IDa7817sDto = {
      id: 1,
      soldier_id: '12345',
      date: '2025-04-10',
      uic_id: 'UIC123',
      event_type: 'Training',
      training_type: 'Type A',
      evaluation_type: 'Evaluation B',
      go_nogo: 'GO',
      gaining_unit_id: 'GU567',
      gaining_unit: {
        uic: 'GU567',
        echelon: Echelon.ARMY,
        component: 'Active',
        level: 3,
        displayName: '1st Brigade Combat Team',
        shortName: '1BCT',
        nickName: 'Warriors',
        state: 'TX',
        parentUic: 'XYZ789',
      },
      tcs_location: 'LOC',
      award_type: 'Award X',
      total_mx_hours: 12,
      comment: 'Event comments',
      maintenance_level: 'Level 1',
      recorded_by_legacy: null,
      recorded_by_id: 'RB123',
      recorded_by_non_legacy: null,
      attached_da_4856_id: null,
      event_deleted: false,
      mos: 'MOS789',
      event_tasks: [
        { number: '001', name: 'Task 1', go_nogo: 'GO' },
        { number: '002', name: 'Task 2', go_nogo: 'NOGO' },
      ],
      has_associations: true,
    };

    const expected: IDa7817s = {
      id: 1,
      soldierId: '12345',
      date: '2025-04-10',
      uicId: 'UIC123',
      eventType: 'Training',
      trainingType: 'Type A',
      evaluationType: 'Evaluation B',
      goNogo: 'GO',
      gainingUnitId: 'GU567',
      gainingUnit: {
        uic: 'GU567',
        echelon: Echelon.ARMY,
        component: 'Active',
        level: 3,
        displayName: '1st Brigade Combat Team',
        shortName: '1BCT',
        nickName: 'Warriors',
        state: 'TX',
        parentUic: 'XYZ789',
      },
      tcsLocation: 'LOC',
      awardType: 'Award X',
      totalMxHours: 12,
      comment: 'Event comments',
      maintenanceLevel: 'Level 1',
      recordedByLegacy: null,
      recordedById: 'RB123',
      recordedByNonLegacy: null,
      attachedDa4856Id: null,
      eventDeleted: false,
      mos: 'MOS789',
      eventTasks: [
        { number: '001', name: 'Task 1', goNogo: 'GO' },
        { number: '002', name: 'Task 2', goNogo: 'NOGO' },
      ],
      hasAssociations: true,
    };

    const result = mapToIDa7817s(dto);
    expect(result).toEqual(expected);
  });

  it('should handle null and undefined values in IDa7817sDto', () => {
    const dto: IDa7817sDto = {
      id: 2,
      soldier_id: '56789',
      date: '2025-05-15',
      uic_id: 'UIC567',
      event_type: 'Evaluation',
      training_type: null,
      evaluation_type: null,
      go_nogo: 'NOGO',
      gaining_unit_id: null,
      gaining_unit: null,
      tcs_location: null,
      award_type: null,
      total_mx_hours: null,
      comment: '',
      maintenance_level: null,
      recorded_by_legacy: 'RBLEGACY',
      recorded_by_id: null,
      recorded_by_non_legacy: 'RBNONLEGACY',
      attached_da_4856_id: null,
      event_deleted: false,
      mos: null,
      event_tasks: [],
      has_associations: false,
    };

    const expected: IDa7817s = {
      id: 2,
      soldierId: '56789',
      date: '2025-05-15',
      uicId: 'UIC567',
      eventType: 'Evaluation',
      trainingType: null,
      evaluationType: null,
      goNogo: 'NOGO',
      gainingUnitId: null,
      gainingUnit: null,
      tcsLocation: null,
      awardType: null,
      totalMxHours: null,
      comment: '',
      maintenanceLevel: null,
      recordedByLegacy: 'RBLEGACY',
      recordedById: null,
      recordedByNonLegacy: 'RBNONLEGACY',
      attachedDa4856Id: null,
      eventDeleted: false,
      mos: null,
      eventTasks: [],
      hasAssociations: false,
    };

    const result = mapToIDa7817s(dto);
    expect(result).toEqual(expected);
  });
});
