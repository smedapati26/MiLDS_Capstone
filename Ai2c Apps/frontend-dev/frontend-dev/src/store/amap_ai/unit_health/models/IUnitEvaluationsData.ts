export interface IUnitEvaluationsSoldierDataDTO {
  name: string;
  user_id: string;
  evaluation_status: string;
  unit: string;
  mos: string;
  ml: string;
}

export interface IUnitEvaluationsSoldierData {
  name: string;
  userId: string;
  evaluationStatus: string;
  unit: string;
  mos: string;
  ml: string;
}

export const mapToIUnitEvaluationsSoldierData = (dto: IUnitEvaluationsSoldierDataDTO): IUnitEvaluationsSoldierData => {
  return {
    name: dto.name,
    userId: dto.user_id,
    evaluationStatus: dto.evaluation_status,
    unit: dto.unit,
    mos: dto.mos,
    ml: dto.ml,
  };
};

export interface IUnitEvaluationsDataDTO {
  unit_name: string;
  soldiers: IUnitEvaluationsSoldierDataDTO[];
}

export interface IUnitEvaluationsData {
  unitName: string;
  soldiers: IUnitEvaluationsSoldierData[];
}

export const mapToIUnitEvaluationsData = (dto: IUnitEvaluationsDataDTO): IUnitEvaluationsData => {
  return {
    unitName: dto.unit_name,
    soldiers: dto.soldiers.map(mapToIUnitEvaluationsSoldierData),
  };
};
