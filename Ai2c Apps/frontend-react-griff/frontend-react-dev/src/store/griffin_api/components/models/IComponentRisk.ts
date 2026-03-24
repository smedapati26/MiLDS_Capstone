import { IFailureDetail } from './IFailure';

export interface IComponentRiskPrediction {
  serial_number: string;
  part_number: string;
  failure_detail: IFailureDetail;
  nomenclature: string;
}

export interface IComponentRiskFilters {
  uic: string;
  variant?: 'top' | 'bottom';
  serial_numbers?: string[];
  part_numbers?: string[];
  other_uics?: string[];
  serial?: string;
}
