import { describe, expect, it } from 'vitest';

import {
  IFhpModels,
  IFhpModelsDto,
  IFhpModelsProgress,
  IFhpModelsProgressDto,
  IFhpProgress,
  IFhpProgressDetails,
  IFhpProgressDetailsDto,
  IFhpProgressDto,
  IFhpProgressMulti,
  IFhpProgressMultiDto,
  IFhpSummary,
  IFhpSummaryDetails,
  IFhpSummaryDetailsDto,
  IFhpSummaryDto,
  mapToFhpSummary,
  mapToFhpSummaryDetails,
  mapToIFhpModelProgress,
  mapToIFhpModels,
  mapToIFhpProgress,
  mapToIFhpProgressDetails,
  mapToIFhpProgressMulti,
} from '@store/griffin_api/fhp/models';

describe('Mapping Functions', () => {
  describe('mapToIFhpModels', () => {
    it('should map IFhpModelsDto to IFhpModels correctly', () => {
      const dto: IFhpModelsDto = { model: 'Model A', hours: 10 };
      const result: IFhpModels = mapToIFhpModels(dto);

      expect(result).toEqual({ model: 'Model A', hours: 10 });
    });
  });

  describe('mapToFhpSummaryDetails', () => {
    it('should map IFhpSummaryDetailsDto to IFhpSummaryDetails correctly', () => {
      const dto: IFhpSummaryDetailsDto = {
        fiscal_year_to_date: 120,
        reporting_period: 40,
        models: [
          { model: 'Model A', hours: 10 },
          { model: 'Model B', hours: 20 },
        ],
      };

      const result: IFhpSummaryDetails = mapToFhpSummaryDetails(dto);

      expect(result).toEqual({
        fiscalYearToDate: 120,
        reportingPeriod: 40,
        models: [
          { model: 'Model A', hours: 10 },
          { model: 'Model B', hours: 20 },
        ],
      });
    });
  });

  describe('mapToFhpSummary', () => {
    it('should map IFhpSummaryDto to IFhpSummary correctly', () => {
      const dto: IFhpSummaryDto = {
        day: {
          fiscal_year_to_date: 120,
          reporting_period: 40,
          models: [
            { model: 'Model A', hours: 10 },
            { model: 'Model B', hours: 20 },
          ],
        },
        night: {
          fiscal_year_to_date: 100,
          reporting_period: 30,
          models: [
            { model: 'Model C', hours: 15 },
            { model: 'Model D', hours: 25 },
          ],
        },
        hood: {
          fiscal_year_to_date: 80,
          reporting_period: 20,
          models: [{ model: 'Model E', hours: 5 }],
        },
        weather: {
          fiscal_year_to_date: 60,
          reporting_period: 10,
          models: [],
        },
        night_goggles: {
          fiscal_year_to_date: 50,
          reporting_period: 5,
          models: [{ model: 'Model F', hours: 3 }],
        },
      };

      const result: IFhpSummary = mapToFhpSummary(dto);

      expect(result).toEqual({
        day: {
          fiscalYearToDate: 120,
          reportingPeriod: 40,
          models: [
            { model: 'Model A', hours: 10 },
            { model: 'Model B', hours: 20 },
          ],
        },
        night: {
          fiscalYearToDate: 100,
          reportingPeriod: 30,
          models: [
            { model: 'Model C', hours: 15 },
            { model: 'Model D', hours: 25 },
          ],
        },
        hood: {
          fiscalYearToDate: 80,
          reportingPeriod: 20,
          models: [{ model: 'Model E', hours: 5 }],
        },
        weather: {
          fiscalYearToDate: 60,
          reportingPeriod: 10,
          models: [],
        },
        nightGoggles: {
          fiscalYearToDate: 50,
          reportingPeriod: 5,
          models: [{ model: 'Model F', hours: 3 }],
        },
      });
    });
  });

  describe('mapToIFhpProgressDetails', () => {
    it('should map IFhpProgressDetailsDto to IFhpProgressDetailsDto ', () => {
      const dto: IFhpProgressDetailsDto = {
        date: new Date('2025-10-01'),
        actual_flight_hours: 10,
        predicted_flight_hours: 20,
        projected_flight_hours: 19,
      };

      const result: IFhpProgressDetails = mapToIFhpProgressDetails(dto);

      expect(result).toEqual({
        date: new Date('2025-10-01'),
        actualFlightHours: 10,
        predictedFlightHours: 20,
        projectedFlightHours: 19,
      });
    });
  });

  describe('mapToIFhpModelDetails', () => {
    it('should map IFhpModelsProgressDto to IFhpModelsProgress', () => {
      const dto: IFhpModelsProgressDto = {
        model: 'test model',
        family: 'test family',
        dates: [
          {
            date: new Date('2025-10-01'),
            actual_flight_hours: 10,
            predicted_flight_hours: 20,
            projected_flight_hours: 19,
          },
        ],
      };

      const result: IFhpModelsProgress = mapToIFhpModelProgress(dto);

      expect(result).toEqual({
        model: 'test model',
        family: 'test family',
        dates: [
          {
            date: new Date('2025-10-01'),
            actualFlightHours: 10,
            predictedFlightHours: 20,
            projectedFlightHours: 19,
          },
        ],
      });
    });
  });

  describe('mapToIFhpProgress', () => {
    it('should map IFhpProgress to IFhpProgressDTO', () => {
      const dto: IFhpProgressDto = {
        models: [
          {
            model: 'test model',
            family: 'test family',
            dates: [
              {
                date: new Date('2025-10-01'),
                actual_flight_hours: 10,
                predicted_flight_hours: 20,
                projected_flight_hours: 19,
              },
            ],
          },
        ],
        unit: [
          {
            date: new Date('2025-10-01'),
            actual_flight_hours: 10,
            predicted_flight_hours: 20,
            projected_flight_hours: 19,
          },
        ],
      };

      const result: IFhpProgress = mapToIFhpProgress(dto);

      expect(result).toEqual({
        models: [
          {
            model: 'test model',
            family: 'test family',
            dates: [
              {
                date: new Date('2025-10-01'),
                actualFlightHours: 10,
                predictedFlightHours: 20,
                projectedFlightHours: 19,
              },
            ],
          },
        ],
        unit: [
          {
            date: new Date('2025-10-01'),
            actualFlightHours: 10,
            predictedFlightHours: 20,
            projectedFlightHours: 19,
          },
        ],
      });
    });
  });

  describe('mapToIFhpProgressMulti', () => {
    it('should map IFhpProgressMultiDto to IFhpProgressMulti', () => {
      const dto: IFhpProgressMultiDto = {
        uic: 'TESTUIC',
        data: {
          models: [
            {
              model: 'test model',
              family: 'test family',
              dates: [
                {
                  date: new Date('2025-10-01'),
                  actual_flight_hours: 10,
                  predicted_flight_hours: 20,
                  projected_flight_hours: 19,
                },
              ],
            },
          ],
          unit: [
            {
              date: new Date('2025-10-01'),
              actual_flight_hours: 10,
              predicted_flight_hours: 20,
              projected_flight_hours: 19,
            },
          ],
        },
      };

      const result: IFhpProgressMulti = mapToIFhpProgressMulti(dto);

      expect(result).toEqual({
        uic: 'TESTUIC',
        data: {
          models: [
            {
              model: 'test model',
              family: 'test family',
              dates: [
                {
                  date: new Date('2025-10-01'),
                  actualFlightHours: 10,
                  predictedFlightHours: 20,
                  projectedFlightHours: 19,
                },
              ],
            },
          ],
          unit: [
            {
              date: new Date('2025-10-01'),
              actualFlightHours: 10,
              predictedFlightHours: 20,
              projectedFlightHours: 19,
            },
          ],
        },
      });
    });
  });
});
