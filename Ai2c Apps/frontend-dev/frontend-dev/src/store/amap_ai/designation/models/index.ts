export interface ISoldierDesignationDTO {
  id: number;
  designation: string;
  last_modified_by: string | null;
  start_date: string;
  end_date: string;
  designation_removed: boolean;
  unit: string | null;
}

export interface ISoldierDesignation {
  id: number;
  designation: string;
  lastModifiedBy: string | null;
  startDate: string;
  endDate: string;
  designationRemoved: boolean;
  unit: string | null;
}

export const mapToISoldierDesignation = (dto: ISoldierDesignationDTO): ISoldierDesignation => ({
  id: dto.id,
  designation: dto.designation,
  lastModifiedBy: dto.last_modified_by,
  startDate: dto.start_date,
  endDate: dto.end_date,
  designationRemoved: dto.designation_removed,
  unit: dto.unit,
});

export interface IDesignation {
  id: number;
  type: string;
  description: string | null;
}

export interface ICreateSoldierDesignationDTO {
  soldier_id: string;
  unit_uic: string;
  designation: string;
  start_date: string;
  end_date?: string | undefined;
  document_type?: string | undefined;
  supporting_document_id?: number | undefined;
}
