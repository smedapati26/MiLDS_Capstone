import { describe, expect, it } from 'vitest';

import {
  ADMINSOLDIERFLAGOPTIONS,
  ISoldierFlagNonUnitFlagOptions,
  ISoldierFlagOptionsMapping,
  MONTHS,
  MXAVAILABILITIES,
  PROFILESOLDIERFLAGOPTIONS,
  SOLDIERFLAGTYPES,
  TASKINGSOLDIERFLAGOPTIONS,
  UNITPOSITIONSOLDIERFLAGOPTIONS,
} from '@utils/enums';

describe('Enums and Soldier Flag Mappings', () => {
  it('MONTHS enum contains correct values', () => {
    expect(MONTHS.January).toBe('JAN');
    expect(MONTHS.February).toBe('FEB');
    expect(MONTHS.December).toBe('DEC');
    expect(MONTHS.Unknown).toBe('UNK');

    expect(Object.values(MONTHS)).toHaveLength(13);
  });

  it('SOLDIERFLAGTYPES enum contains correct values', () => {
    expect(SOLDIERFLAGTYPES.ADMIN).toBe('Administrative');
    expect(SOLDIERFLAGTYPES.UNITORPOS).toBe('Unit/Position');
    expect(SOLDIERFLAGTYPES.TASKING).toBe('Tasking');
    expect(SOLDIERFLAGTYPES.PROFILE).toBe('Profile');
    expect(SOLDIERFLAGTYPES.OTHER).toBe('Other');
  });

  it('ADMINSOLDIERFLAGOPTIONS contains correct values', () => {
    expect(ADMINSOLDIERFLAGOPTIONS.LEAVE).toBe('Leave');
    expect(ADMINSOLDIERFLAGOPTIONS.FEVAL).toBe('Failed Evaluation');
    expect(ADMINSOLDIERFLAGOPTIONS.INVESTIGATION).toBe('Active Investigation');
    expect(ADMINSOLDIERFLAGOPTIONS.OTHER).toBe('Other');
  });

  it('UNITPOSITIONSOLDIERFLAGOPTIONS contains correct values', () => {
    expect(UNITPOSITIONSOLDIERFLAGOPTIONS.NON_MX_POS).toBe('Non-Maintenance Position');
    expect(UNITPOSITIONSOLDIERFLAGOPTIONS.NON_MX_UNIT).toBe('Non-Maintenance Unit');
    expect(UNITPOSITIONSOLDIERFLAGOPTIONS.BLOCK).toBe('Block Leave');
    expect(UNITPOSITIONSOLDIERFLAGOPTIONS.OTHER).toBe('Other');
  });

  it('TASKINGSOLDIERFLAGOPTIONS contains correct values', () => {
    expect(TASKINGSOLDIERFLAGOPTIONS.INTERNAL).toBe('Internal');
    expect(TASKINGSOLDIERFLAGOPTIONS.EXTERNAL).toBe('External');
  });

  it('PROFILESOLDIERFLAGOPTIONS contains correct values', () => {
    expect(PROFILESOLDIERFLAGOPTIONS.TEMPORARY).toBe('Temporary');
    expect(PROFILESOLDIERFLAGOPTIONS.PERMANENT).toBe('Permanent');
  });

  it('ISoldierFlagOptionsMapping maps types to correct option enums', () => {
    expect(ISoldierFlagOptionsMapping.Administrative).toBe(ADMINSOLDIERFLAGOPTIONS);
    expect(ISoldierFlagOptionsMapping['Unit/Position']).toBe(UNITPOSITIONSOLDIERFLAGOPTIONS);
    expect(ISoldierFlagOptionsMapping.Tasking).toBe(TASKINGSOLDIERFLAGOPTIONS);
    expect(ISoldierFlagOptionsMapping.Profile).toBe(PROFILESOLDIERFLAGOPTIONS);
    expect(ISoldierFlagOptionsMapping.Other).toEqual([]);
  });

  it('ISoldierFlagNonUnitFlagOptions merges admin, tasking, and profile options', () => {
    const merged = ISoldierFlagNonUnitFlagOptions;

    // Check a few representative values
    expect(merged.LEAVE).toBe('Leave'); // from admin
    expect(merged.INTERNAL).toBe('Internal'); // from tasking
    expect(merged.TEMPORARY).toBe('Temporary'); // from profile

    // Ensure no unexpected keys
    const expectedKeys = [
      ...Object.keys(ADMINSOLDIERFLAGOPTIONS),
      ...Object.keys(TASKINGSOLDIERFLAGOPTIONS),
      ...Object.keys(PROFILESOLDIERFLAGOPTIONS),
    ];

    expect(Object.keys(merged).sort()).toEqual(expectedKeys.sort());
  });

  it('MXAVAILABILITIES contains correct values', () => {
    expect(MXAVAILABILITIES.AVAILABLE).toBe('Available');
    expect(MXAVAILABILITIES.LIMITED).toBe('Limited');
    expect(MXAVAILABILITIES.UNAVAILABLE).toBe('Unavailable');
  });
});
