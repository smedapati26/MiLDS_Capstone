import { describe, expect, it } from 'vitest';

import { ICtls, ICtlsDto, mapToICtls } from '@store/amap_ai/readiness/models';

describe('mapToICtls', () => {
  it('should map a valid ICtlsDto to an ICtls correctly', () => {
    const dto: ICtlsDto = {
      MOS: '15H',
      document_link: 'https://example.com/task-doc',
      frequency: 'Annually',
      ictl__ictl_title: '15H Aircraft Pneudraulics Repairer',
      ictl__unit: 'Unit A',
      ictl__unit__short_name: 'UA',
      ictl_proponent: 'USAACE',
      last_evaluated: '2025-03-20',
      last_evaluated_id: 456,
      last_trained: '2025-03-15',
      last_trained_id: 123,
      next_due: '2026-03-01',
      skill_level: 'SL1',
      subject_area: '07-Pneudraulic',
      task_number: '552-000-1002',
      task_title: 'Operate the Aviation Ground Power Unit (APGU)',
    };

    const expected: ICtls = {
      mos: '15H',
      documentLink: 'https://example.com/task-doc',
      frequency: 'Annually',
      ictlProponent: 'USAACE',
      ictlIctlTitle: '15H Aircraft Pneudraulics Repairer',
      ictlUnit: 'Unit A',
      ictlUnitShortName: 'UA',
      lastEvaluated: '2025-03-20',
      lastEvaluatedById: 456,
      lastTrained: '2025-03-15',
      lastTrainedId: 123,
      nextDue: '2026-03-01',
      skillLevel: 'SL1',
      subjectArea: '07-Pneudraulic',
      taskNumber: '552-000-1002',
      taskTitle: 'Operate the Aviation Ground Power Unit (APGU)',
    };

    const result = mapToICtls(dto);
    expect(result).toEqual(expected);
  });

  it('should handle null and undefined values in ICtlsDto', () => {
    const dto: ICtlsDto = {
      MOS: '15H',
      document_link: 'https://example.com/task-doc',
      frequency: 'Annually',
      ictl__ictl_title: '15H Aircraft Pneudraulics Repairer',
      ictl__unit: null,
      ictl__unit__short_name: null,
      ictl_proponent: 'USAACE',
      last_evaluated: null,
      last_evaluated_id: null,
      last_trained: null,
      last_trained_id: null,
      next_due: null,
      skill_level: 'SL1',
      subject_area: '07-Pneudraulic',
      task_number: '552-000-1002',
      task_title: 'Operate the Aviation Ground Power Unit (APGU)',
    };

    const expected: ICtls = {
      mos: '15H',
      documentLink: 'https://example.com/task-doc',
      frequency: 'Annually',
      ictlProponent: 'USAACE',
      ictlIctlTitle: '15H Aircraft Pneudraulics Repairer',
      ictlUnit: null,
      ictlUnitShortName: null,
      lastEvaluated: null,
      lastEvaluatedById: null,
      lastTrained: null,
      lastTrainedId: null,
      nextDue: null,
      skillLevel: 'SL1',
      subjectArea: '07-Pneudraulic',
      taskNumber: '552-000-1002',
      taskTitle: 'Operate the Aviation Ground Power Unit (APGU)',
    };

    const result = mapToICtls(dto);
    expect(result).toEqual(expected);
  });
});
