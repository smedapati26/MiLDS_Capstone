import { IFailureDetail } from './IFailure';

export interface IAircraftRiskPrediction {
  serial_number: string;
  failure_detail: IFailureDetail;
}
