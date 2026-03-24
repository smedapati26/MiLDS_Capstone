import { describe, expect, it } from 'vitest';

import {
  IAircraft,
  IAircraftBankPercentage,
  IAircraftBankPercentageDto,
  IAircraftCompany,
  IAircraftCompanyDto,
  IAircraftDetail,
  IAircraftDetailDto,
  IAircraftDto,
  IAircraftEditIn,
  IAircraftEditInDto,
  IAircraftEditOut,
  IAircraftEditOutDto,
  IAircraftEquipmentDetailsDto,
  IAircraftInspection,
  IAircraftInspectionDto,
  IAircraftModification,
  IAircraftModificationDto,
  IAircraftPhaseFlow,
  IAircraftPhaseFlowDto,
  IAircraftPhaseFlowModels,
  IAircraftPhaseFlowModelsDto,
  IAircraftPhaseFlowSubordinates,
  IAircraftPhaseFlowSubordinatesDto,
  mapToAircraftEditInDto,
  mapToAircraftEditOut,
  mapToAircraftEquipmentDetails,
  mapToAircraftModification,
  mapToAircraftModificationDto,
  mapToAircraftPhaseFlowModels,
  mapToAircraftPhaseFlowSubordinates,
  mapToIAircraft,
  mapToIAircraftBankPercentage,
  mapToIAircraftCompany,
  mapToIAircraftDetail,
  mapToIAircraftInspection,
  mapToIAircraftPhaseFlow,
} from '@store/griffin_api/aircraft/models/IAircraft';

describe('mapToIAircraft', () => {
  it('should map IAircraftDto to IAircraft correctly', () => {
    const dto: IAircraftDto = {
      aircraft_mds: 'CH-47FV2',
      aircraft_model: 'CH-47',
      aircraft_family: 'Chinook',
      serial: '12345',
    };

    const expected: IAircraft = {
      aircraftMds: 'CH-47FV2',
      aircraftModel: 'CH-47',
      aircraftFamily: 'Chinook',
      serial: '12345',
    };

    const result = mapToIAircraft(dto);
    expect(result).toEqual(expected);
  });
});

describe('mapToIAircraftPhaseFlow', () => {
  it('should map IAircraftPhaseFlowDto to IAircraftPhaseFlow correctly', () => {
    const dto: IAircraftPhaseFlowDto = {
      model: 'CH-47',
      hours_to_320: 100,
      serial: '12345',
      total_airframe_hours: 500,
      flight_hours: 400,
      next_phase_type: 'Phase A',
      hours_to_phase: 50,
      owning_unit: 'Unit A',
      current_unit: 'Unit B',
    };

    const expected: IAircraftPhaseFlow = {
      model: 'CH-47',
      hoursTo320: 100,
      serial: '12345',
      totalAirframeHours: 500,
      flightHours: 400,
      nextPhaseType: 'Phase A',
      hoursToPhase: 50,
      owningUnit: 'Unit A',
      currentUnit: 'Unit B',
    };

    const result = mapToIAircraftPhaseFlow(dto);
    expect(result).toEqual(expected);
  });
});

describe('mapToAircraftPhaseFlowSubordinates', () => {
  it('should map IAircraftPhaseFlowSubordinatesDto to IAircraftPhaseFlowSubordinates correctly', () => {
    const dto: IAircraftPhaseFlowSubordinatesDto = {
      uic: 'UIC123',
      short_name: 'Short Name',
      aircraft: [
        {
          model: 'CH-47',
          hours_to_320: 100,
          serial: '12345',
          total_airframe_hours: 500,
          flight_hours: 400,
          next_phase_type: 'Phase A',
          hours_to_phase: 50,
          owning_unit: 'Unit A',
          current_unit: 'Unit B',
        },
      ],
    };

    const expected: IAircraftPhaseFlowSubordinates = {
      uic: 'UIC123',
      shortName: 'Short Name',
      aircraft: [
        {
          model: 'CH-47',
          hoursTo320: 100,
          serial: '12345',
          totalAirframeHours: 500,
          flightHours: 400,
          nextPhaseType: 'Phase A',
          hoursToPhase: 50,
          owningUnit: 'Unit A',
          currentUnit: 'Unit B',
        },
      ],
    };

    const result = mapToAircraftPhaseFlowSubordinates(dto);
    expect(result).toEqual(expected);
  });
});

describe('mapToAircraftPhaseFlowModels', () => {
  it('should map IAircraftPhaseFlowModelsDto to IAircraftPhaseFlowModels correctly', () => {
    const dto: IAircraftPhaseFlowModelsDto = {
      model: 'CH-47',
      aircraft: [
        {
          model: 'CH-47',
          hours_to_320: 100,
          serial: '12345',
          total_airframe_hours: 500,
          flight_hours: 400,
          next_phase_type: 'Phase A',
          hours_to_phase: 50,
          owning_unit: 'Unit A',
          current_unit: 'Unit B',
        },
      ],
    };

    const expected: IAircraftPhaseFlowModels = {
      model: 'CH-47',
      aircraft: [
        {
          model: 'CH-47',
          hoursTo320: 100,
          serial: '12345',
          totalAirframeHours: 500,
          flightHours: 400,
          nextPhaseType: 'Phase A',
          hoursToPhase: 50,
          owningUnit: 'Unit A',
          currentUnit: 'Unit B',
        },
      ],
    };

    const result = mapToAircraftPhaseFlowModels(dto);
    expect(result).toEqual(expected);
  });
});

describe('mapToIAircraftBankPercentage', () => {
  it('should map IAircraftBankPercentageDto to IAircraftBankPercentage correctly', () => {
    const dto: IAircraftBankPercentageDto = {
      key: 'key1',
      bank_percentage: 75,
    };

    const expected: IAircraftBankPercentage = {
      key: 'key1',
      bankPercentage: 75,
    };

    const result = mapToIAircraftBankPercentage(dto);
    expect(result).toEqual(expected);
  });
});

describe('mapToIAircraftCompany', () => {
  it('should map IAircraftCompanyDto to IAircraftCompany correctly', () => {
    const dto: IAircraftCompanyDto = {
      uic: 'UIC123',
      short_name: 'Short',
      display_name: 'Display Name',
    };

    const expected: IAircraftCompany = {
      uic: 'UIC123',
      shortName: 'Short',
      displayName: 'Display Name',
    };

    const result = mapToIAircraftCompany(dto);
    expect(result).toEqual(expected);
  });
});

describe('mapToIAircraftDetail', () => {
  it('should map IAircraftDetailDTO to IAircraftDetail correctly', () => {
    const dto: IAircraftDetailDto = {
      date_down: new Date('2023-01-01'),
      hours_to_phase: 100,
      in_phase: true,
      last_update_time: new Date('2023-01-02'),
      phase_start_date: new Date('2023-01-03'),
      remarks: 'Some remarks',
      serial: '12345',
      total_airframe_hours: 500,
    };

    const expected: IAircraftDetail = {
      dateDown: new Date('2023-01-01'),
      hoursToPhase: 100,
      inPhase: true,
      lastUpdateTime: new Date('2023-01-02'),
      phaseStartDate: new Date('2023-01-03'),
      remarks: 'Some remarks',
      serial: '12345',
      totalAirframeHours: 500,
    };

    const result = mapToIAircraftDetail(dto);
    expect(result).toEqual(expected);
  });
});

describe('mapToIAircraftInspection', () => {
  it('should map IAircraftInspectionDTO to IAircraftInspection correctly', () => {
    const dto: IAircraftInspectionDto = {
      inspection__id: 1,
      inspection__inspection_name: 'Inspection A',
      inspection__hours_interval: 200,
      inspection__last_conducted_hours: 300,
      inspection__next_due_hours: 500,
      till_due: 100,
      serial: '12345',
    };

    const expected: IAircraftInspection = {
      inspectionId: 1,
      inspectionName: 'Inspection A',
      hoursInterval: 200,
      lastConductedHours: 300,
      nextDueHours: 500,
      tillDue: 100,
      serial: '12345',
    };

    const result = mapToIAircraftInspection(dto);
    expect(result).toEqual(expected);
  });

  it('should map IAircraftModification correctly', () => {
    const dto: IAircraftModificationDto = {
      id: 1,
      mod_type: 'test',
      value: 'test',
    };

    const expected: IAircraftModification = {
      id: 1,
      modType: 'test',
      value: 'test',
    };

    const result = mapToAircraftModification(dto);
    expect(result).toEqual(expected);

    const reverse = mapToAircraftModificationDto(expected);
    expect(reverse).toEqual(dto);
  });

  it('should map IAircraftEquipmentDetails correctly', () => {
    const dto: IAircraftEquipmentDetailsDto = {
      unit_short_name: 'Test Unit 1',
      unit_uic: 'TEST0001',
      models: [
        {
          model: 'UH-60L',
          aircraft: [
            {
              serial: 'serial T1 1',
              remarks: 'remark 1',
              rtl: 'rtl status',
              status: 'FIELD',
              or_status: 'NMC',
              date_down: new Date('2023-01-01'),
              ecd: null,
              total_airframe_hours: 6062,
              flight_hours: 0,
              hours_to_phase: 36.1,
              in_phase: false,
              field_sync_status: { rtl: true, status: true },
              location: {
                id: 1,
                code: 'test',
                name: 'test',
              },
              modifications: [
                {
                  id: 1,
                  mod_type: 'test',
                  value: 'test',
                },
              ],
              events: [
                {
                  inspection: {
                    inspection__id: 123456,
                    inspection__hours_interval: 2,
                    inspection__inspection_name: 'insp name 1',
                    inspection__last_conducted_hours: 66,
                    inspection__next_due_hours: 77,
                    till_due: 11,
                    serial: 'serial T1 1',
                  },
                  maintenance: {
                    name: 'test event name',
                    lane: 'lane name',
                    event_start: '2000-01-01T00:00:00Z',
                    event_end: '2000-12-31T00:00:00Z',
                  },
                },
                {
                  inspection: {
                    inspection__id: 123456,
                    inspection__hours_interval: 2,
                    inspection__inspection_name: 'insp name 1',
                    inspection__last_conducted_hours: 66,
                    inspection__next_due_hours: 77,
                    till_due: 11,
                    serial: 'serial T1 1',
                  },
                  maintenance: null,
                },
              ],
            },
          ],
        },
      ],
    };

    const result = mapToAircraftEquipmentDetails(dto);
    expect(result.unitShortName).toEqual('Test Unit 1');
    expect(result.models.length).toEqual(1);
    expect(result.models[0].aircraft.length).toEqual(1);
    expect(result.models[0].aircraft[0].dateDownCount).toBeGreaterThan(1);
  });

  it('Aircraft edit in mapping testing', () => {
    const data: IAircraftEditIn = {
      serial: 'string',
      rtl: 'string',
      status: 'string',
      dateDown: null,
      ecd: null,
      totalAirframeHours: 0,
      flightHours: 0,
      locationId: 1,
      remarks: 'string',
      fieldSyncStatus: { rtl: true, status: true },
      mods: [
        {
          id: 1,
          modType: 'test',
          value: 'test',
        },
      ],
    };
    const expected: IAircraftEditInDto = {
      serial: 'string',
      rtl: 'string',
      status: 'string',
      date_down: null,
      ecd: null,
      total_airframe_hours: 0,
      flight_hours: 0,
      location_id: 1,
      remarks: 'string',
      field_sync_status: { rtl: true, status: true },
      mods: [
        {
          id: 1,
          mod_type: 'test',
          value: 'test',
        },
      ],
    };

    const result = mapToAircraftEditInDto(data);
    expect(result).toEqual(expected);
  });

  it('Aircraft edit out mapping testing', () => {
    const dto: IAircraftEditOutDto = {
      edited_aircraft: ['1', '2'],
      not_edited_aircraft: [],
      detail: 'string',
    };

    const expected: IAircraftEditOut = {
      editedAircraft: ['1', '2'],
      notEditedAircraft: [],
      detail: 'string',
    };

    const result = mapToAircraftEditOut(dto);
    expect(result).toEqual(expected);
  });
});
