export interface FaultMaintainer {
  userId: string;
  name: string;
  manHours: number;
}

export interface FaultAction {
  faultActionId: string;
  sequenceNumber: number;
  discoveredOn: string;
  closedOn: string;
  closerName: string;
  maintenanceAction: string;
  actionStatus: string;
  inspectorName: string;
  manHours: number;
  faultWorkUnitCode: string;
  maintainers: FaultMaintainer[];
  role: string;
  statusCode: string;
  correctiveAction: string;
  faultDetails: FaultDetails;
}

export interface FaultDetails {
  faultId: string;
  discovererName: string;
  aircraft: string;
  discoveredOn: string;
  correctedOn: string;
  unitName: string;
  faultWorkUnitCode: string;
  totalManHours: number;
  remarks: string;
  faultActions: FaultAction[];
}

export interface IFaultMaintainerDto {
  user_id: string;
  name: string;
  man_hours: number;
}

export interface IFaultActionDto {
  fault_action_id: string;
  sequence_number: number;
  role: string;
  status_code: string;
  corrective_action: string;
  discovered_on: string;
  closed_on: string;
  closer_name: string;
  maintenance_action: string;
  action_status: string;
  inspector_name: string;
  man_hours: number;
  fault_work_unit_code: string;
  maintainers: IFaultMaintainerDto[];
  fault_details: IFaultDetailsDto;
}

export interface IFaultDetailsDto {
  fault_id: string;
  discoverer_name: string;
  aircraft: string;
  unit: string;
  discoverer: string;
  discover_date: string;
  discovered_on: string;
  corrected_on: string;
  corrective_date: string;
  inspector: string;
  closer: string;
  unit_name: string;
  fault_work_unit_code: string;
  total_man_hours: number;
  remarks: string;
  fault_actions: IFaultActionDto[];
}
