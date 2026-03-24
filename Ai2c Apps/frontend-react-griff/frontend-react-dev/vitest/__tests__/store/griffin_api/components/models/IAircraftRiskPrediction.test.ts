import { describe, expect, it } from 'vitest';

import { IAircraftRiskPrediction, IFailureDetail } from '@store/griffin_api/components/models';

describe('IFailureDetail and IAircraftRiskPrediction', () => {
  it('should create a valid IFailureDetail object with all required properties', () => {
    const failureDetail: IFailureDetail = {
      // Upper bounds
      failure_upper_0: 0,
      failure_upper_5: 5,
      failure_upper_10: 10,
      failure_upper_15: 15,
      failure_upper_20: 20,
      failure_upper_25: 25,
      failure_upper_30: 30,
      failure_upper_35: 35,
      failure_upper_40: 40,
      failure_upper_45: 45,
      failure_upper_50: 50,
      failure_upper_55: 55,
      failure_upper_60: 60,
      failure_upper_65: 65,
      failure_upper_70: 70,
      failure_upper_75: 75,
      failure_upper_80: 80,
      failure_upper_85: 85,
      failure_upper_90: 90,
      failure_upper_95: 95,
      failure_upper_100: 100,

      // Lower bounds
      failure_lower_0: 0,
      failure_lower_5: 1,
      failure_lower_10: 2,
      failure_lower_15: 3,
      failure_lower_20: 4,
      failure_lower_25: 5,
      failure_lower_30: 6,
      failure_lower_35: 7,
      failure_lower_40: 8,
      failure_lower_45: 9,
      failure_lower_50: 10,
      failure_lower_55: 11,
      failure_lower_60: 12,
      failure_lower_65: 13,
      failure_lower_70: 14,
      failure_lower_75: 15,
      failure_lower_80: 16,
      failure_lower_85: 17,
      failure_lower_90: 18,
      failure_lower_95: 19,
      failure_lower_100: 20,

      // Probability values
      failure_prob_0: 0.0,
      failure_prob_5: 0.05,
      failure_prob_10: 0.1,
      failure_prob_15: 0.15,
      failure_prob_20: 0.2,
      failure_prob_25: 0.25,
      failure_prob_30: 0.3,
      failure_prob_35: 0.35,
      failure_prob_40: 0.4,
      failure_prob_45: 0.45,
      failure_prob_50: 0.5,
      failure_prob_55: 0.55,
      failure_prob_60: 0.6,
      failure_prob_65: 0.65,
      failure_prob_70: 0.7,
      failure_prob_75: 0.75,
      failure_prob_80: 0.8,
      failure_prob_85: 0.85,
      failure_prob_90: 0.9,
      failure_prob_95: 0.95,
      failure_prob_100: 1.0,
    };

    // Check some properties exist and are numbers
    expect(typeof failureDetail.failure_upper_0).toBe('number');
    expect(typeof failureDetail.failure_lower_100).toBe('number');
    expect(typeof failureDetail.failure_prob_50).toBe('number');
  });

  it('should create a valid IAircraftRiskPrediction object', () => {
    const failureDetail: IFailureDetail = {
      failure_upper_0: 0,
      failure_upper_5: 5,
      failure_upper_10: 10,
      failure_upper_15: 15,
      failure_upper_20: 20,
      failure_upper_25: 25,
      failure_upper_30: 30,
      failure_upper_35: 35,
      failure_upper_40: 40,
      failure_upper_45: 45,
      failure_upper_50: 50,
      failure_upper_55: 55,
      failure_upper_60: 60,
      failure_upper_65: 65,
      failure_upper_70: 70,
      failure_upper_75: 75,
      failure_upper_80: 80,
      failure_upper_85: 85,
      failure_upper_90: 90,
      failure_upper_95: 95,
      failure_upper_100: 100,

      failure_lower_0: 0,
      failure_lower_5: 1,
      failure_lower_10: 2,
      failure_lower_15: 3,
      failure_lower_20: 4,
      failure_lower_25: 5,
      failure_lower_30: 6,
      failure_lower_35: 7,
      failure_lower_40: 8,
      failure_lower_45: 9,
      failure_lower_50: 10,
      failure_lower_55: 11,
      failure_lower_60: 12,
      failure_lower_65: 13,
      failure_lower_70: 14,
      failure_lower_75: 15,
      failure_lower_80: 16,
      failure_lower_85: 17,
      failure_lower_90: 18,
      failure_lower_95: 19,
      failure_lower_100: 20,

      failure_prob_0: 0.0,
      failure_prob_5: 0.05,
      failure_prob_10: 0.1,
      failure_prob_15: 0.15,
      failure_prob_20: 0.2,
      failure_prob_25: 0.25,
      failure_prob_30: 0.3,
      failure_prob_35: 0.35,
      failure_prob_40: 0.4,
      failure_prob_45: 0.45,
      failure_prob_50: 0.5,
      failure_prob_55: 0.55,
      failure_prob_60: 0.6,
      failure_prob_65: 0.65,
      failure_prob_70: 0.7,
      failure_prob_75: 0.75,
      failure_prob_80: 0.8,
      failure_prob_85: 0.85,
      failure_prob_90: 0.9,
      failure_prob_95: 0.95,
      failure_prob_100: 1.0,
    };

    const aircraftRiskPrediction: IAircraftRiskPrediction = {
      serial_number: 'SN123456',
      failure_detail: failureDetail,
    };

    expect(typeof aircraftRiskPrediction.serial_number).toBe('string');
    expect(aircraftRiskPrediction.failure_detail).toBeDefined();
    expect(typeof aircraftRiskPrediction.failure_detail.failure_upper_0).toBe('number');
  });
});
