import { IFhpProgress, IFhpProgressDto, IFhpSummary, IFhpSummaryDto } from '@store/griffin_api/fhp/models';

export const mockFhpSummaryDto: IFhpSummaryDto = {
  day: {
    fiscal_year_to_date: 200,
    reporting_period: 100,
    models: [
      {
        model: 'My Model A',
        hours: 20,
      },
      {
        model: 'My Model B',
        hours: 12,
      },
      {
        model: 'My Model C',
        hours: 5,
      },
    ],
  },
  night: {
    fiscal_year_to_date: 20.1,
    reporting_period: 20.1,
    models: [
      {
        model: 'My Model A',
        hours: 20,
      },
      {
        model: 'My Model B',
        hours: 12,
      },
      {
        model: 'My Model C',
        hours: 5,
      },
    ],
  },
  hood: {
    fiscal_year_to_date: 9.9,
    reporting_period: 9.9,
    models: [
      {
        model: 'My Model A',
        hours: 20,
      },
      {
        model: 'My Model B',
        hours: 12,
      },
      {
        model: 'My Model C',
        hours: 5,
      },
    ],
  },
  weather: {
    fiscal_year_to_date: 22.5,
    reporting_period: 22.5,
    models: [
      {
        model: 'My Model A',
        hours: 20,
      },
      {
        model: 'My Model B',
        hours: 12,
      },
      {
        model: 'My Model C',
        hours: 5,
      },
    ],
  },
  night_goggles: {
    fiscal_year_to_date: 236.7,
    reporting_period: 236.7,
    models: [
      {
        model: 'My Model A',
        hours: 20,
      },
      {
        model: 'My Model B',
        hours: 12,
      },
      {
        model: 'My Model C',
        hours: 5,
      },
    ],
  },
};

export const mockFhpSummary: IFhpSummary = {
  day: {
    fiscalYearToDate: 200,
    reportingPeriod: 100,
    models: [
      {
        model: 'My Model A',
        hours: 20,
      },
      {
        model: 'My Model B',
        hours: 12,
      },
      {
        model: 'My Model C',
        hours: 5,
      },
    ],
  },
  night: {
    fiscalYearToDate: 20.1,
    reportingPeriod: 20.1,
    models: [
      {
        model: 'My Model A',
        hours: 20,
      },
      {
        model: 'My Model B',
        hours: 12,
      },
      {
        model: 'My Model C',
        hours: 5,
      },
    ],
  },
  hood: {
    fiscalYearToDate: 9.9,
    reportingPeriod: 9.9,
    models: [
      {
        model: 'My Model A',
        hours: 20,
      },
      {
        model: 'My Model B',
        hours: 12,
      },
      {
        model: 'My Model C',
        hours: 5,
      },
    ],
  },
  weather: {
    fiscalYearToDate: 22.5,
    reportingPeriod: 22.5,
    models: [
      {
        model: 'My Model A',
        hours: 20,
      },
      {
        model: 'My Model B',
        hours: 12,
      },
      {
        model: 'My Model C',
        hours: 5,
      },
    ],
  },
  nightGoggles: {
    fiscalYearToDate: 236.7,
    reportingPeriod: 236.7,
    models: [
      {
        model: 'My Model A',
        hours: 20,
      },
      {
        model: 'My Model B',
        hours: 12,
      },
      {
        model: 'My Model C',
        hours: 5,
      },
    ],
  },
};

export const mockFhpProgressDto: IFhpProgressDto = {
  models: [
    {
      model: 'test model',
      family: 'test family',
      dates: [
        {
          date: null,
          actual_flight_hours: 10,
          predicted_flight_hours: 20,
          projected_flight_hours: 19,
        },
      ],
    },
  ],
  unit: [
    {
      date: null,
      actual_flight_hours: 10,
      predicted_flight_hours: 20,
      projected_flight_hours: 19,
    },
  ],
};

export const mockFhpProgress: IFhpProgress = {
  models: [
    {
      model: 'test model',
      family: 'CHINOOK',
      dates: [
        {
          date: new Date('10-01-2025'),
          actualFlightHours: 10,
          predictedFlightHours: 20,
          projectedFlightHours: 19,
        },
      ],
    },
  ],
  unit: [
    {
      date: new Date('10-01-2025'),
      actualFlightHours: 10,
      predictedFlightHours: 20,
      projectedFlightHours: 19,
    },
  ],
};

export const mockFhpProgressMultiDtoArray = [
  {
    uic: 'test unit',
    data: {
      unit: [
        {
          date: '2025-08-01',
          actual_flight_hours: 382,
          projected_flight_hours: 397,
          predicted_flight_hours: 684.5281913587572,
        },
        {
          date: '2025-09-01',
          actual_flight_hours: 415,
          projected_flight_hours: 397,
          predicted_flight_hours: 368.98395628387755,
        },
        {
          date: '2025-10-01',
          actual_flight_hours: 392,
          projected_flight_hours: 0,
          predicted_flight_hours: 0,
        },
      ],
      models: [
        {
          model: 'CH-47FV2',
          family: 'CHINOOK',
          dates: [
            {
              date: '2025-08-01',
              actual_flight_hours: 91,
              projected_flight_hours: 0,
              predicted_flight_hours: 0,
            },
            {
              date: '2025-09-01',
              actual_flight_hours: 156,
              projected_flight_hours: 0,
              predicted_flight_hours: 0,
            },
            {
              date: '2025-10-01',
              actual_flight_hours: 151,
              projected_flight_hours: 0,
              predicted_flight_hours: 0,
            },
          ],
        },
        {
          model: 'HH-60M',
          family: 'BLACK HAWK',
          dates: [
            {
              date: '2025-07-01',
              actual_flight_hours: 191,
              projected_flight_hours: 236,
              predicted_flight_hours: 0,
            },
            {
              date: '2025-08-01',
              actual_flight_hours: 156,
              projected_flight_hours: 236,
              predicted_flight_hours: 0,
            },
            {
              date: '2025-09-01',
              actual_flight_hours: 122,
              projected_flight_hours: 236,
              predicted_flight_hours: 0,
            },
            {
              date: '2025-10-01',
              actual_flight_hours: 138,
              projected_flight_hours: 0,
              predicted_flight_hours: 0,
            },
          ],
        },
        {
          model: 'UH-60L',
          family: 'BLACK HAWK',
          dates: [
            {
              date: '2025-08-01',
              actual_flight_hours: 135,
              projected_flight_hours: 161,
              predicted_flight_hours: 0,
            },
            {
              date: '2025-09-01',
              actual_flight_hours: 137,
              projected_flight_hours: 161,
              predicted_flight_hours: 0,
            },
            {
              date: '2025-10-01',
              actual_flight_hours: 103,
              projected_flight_hours: 0,
              predicted_flight_hours: 0,
            },
          ],
        },
      ],
    },
  },
  {
    uic: 'Test UNit 2',
    data: {
      unit: [
        {
          date: '2025-08-01',
          actual_flight_hours: 385,
          projected_flight_hours: 683,
          predicted_flight_hours: 416.1411685880497,
        },
        {
          date: '2025-09-01',
          actual_flight_hours: 431,
          projected_flight_hours: 665,
          predicted_flight_hours: 407.70638166844304,
        },
        {
          date: '2025-10-01',
          actual_flight_hours: 298,
          projected_flight_hours: 0,
          predicted_flight_hours: 0,
        },
      ],
      models: [
        {
          model: 'UH-60L',
          family: 'BLACK HAWK',
          dates: [
            {
              date: '2025-07-01',
              actual_flight_hours: 71,
              projected_flight_hours: 170,
              predicted_flight_hours: 0,
            },
            {
              date: '2025-08-01',
              actual_flight_hours: 105,
              projected_flight_hours: 173,
              predicted_flight_hours: 0,
            },
            {
              date: '2025-09-01',
              actual_flight_hours: 101,
              projected_flight_hours: 155,
              predicted_flight_hours: 0,
            },
            {
              date: '2025-10-01',
              actual_flight_hours: 43,
              projected_flight_hours: 0,
              predicted_flight_hours: 0,
            },
          ],
        },
      ],
    },
  },
];
