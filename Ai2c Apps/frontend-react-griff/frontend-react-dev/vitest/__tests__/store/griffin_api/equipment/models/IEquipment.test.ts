/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import {
  IAircraftModelStatus,
  IAircraftModelStatusDto,
  mapToAircraftModelStatus,
} from '@store/griffin_api/equipment/models/IEquipment';

describe('mapToIEquipment', () => {
  it('testing aircraft-model-status mapping', () => {
    const dto: IAircraftModelStatusDto = {
      model: 'test model',
      total: 10,
      rtl: 7,
      nrtl: 3,
      in_phase: 2,
      fmc_count: 5,
      fmc_percent: 0.35,
      pmc_count: 2,
      pmc_percent: 0.14,
      nmc_count: 5,
      nmc_percent: 0.35,
      dade_count: 2,
      dade_percent: 0.14,
    };

    const expected: IAircraftModelStatus = {
      model: 'test model',
      total: 10,
      rtl: 7,
      nrtl: 3,
      inPhase: 2,
      fmcCount: 5,
      fmcPercent: 0.35,
      pmcCount: 2,
      pmcPercent: 0.14,
      nmcCount: 5,
      nmcPercent: 0.35,
      dadeCount: 2,
      dadePercent: 0.14,
    };

    const result = mapToAircraftModelStatus(dto);
    expect(result).toEqual(expected);
  });

  it('testing aircraft-model-status handling null values', () => {
    const dto: IAircraftModelStatusDto = {
      model: null as any,
      total: null as any,
      rtl: null as any,
      nrtl: null as any,
      in_phase: null as any,
      fmc_count: null as any,
      fmc_percent: null as any,
      pmc_count: null as any,
      pmc_percent: null as any,
      nmc_count: null as any,
      nmc_percent: null as any,
      dade_count: null as any,
      dade_percent: null as any,
    };

    const expected: IAircraftModelStatus = {
      model: null as any,
      total: null as any,
      rtl: null as any,
      nrtl: null as any,
      inPhase: null as any,
      fmcCount: null as any,
      fmcPercent: null as any,
      pmcCount: null as any,
      pmcPercent: null as any,
      nmcCount: null as any,
      nmcPercent: null as any,
      dadeCount: null as any,
      dadePercent: null as any,
    };

    const result = mapToAircraftModelStatus(dto);
    expect(result).toEqual(expected);
  });
});
