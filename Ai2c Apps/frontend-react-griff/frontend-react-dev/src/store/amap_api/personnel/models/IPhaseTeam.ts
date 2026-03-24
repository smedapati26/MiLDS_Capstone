export interface IPhaseTeamDto {
  id: number;
  phase_id: number;
  phase_members: string[];
  phase_lead_user_id: string;
  assistant_phase_lead_user_id: string;
}

export interface IPhaseTeam {
  id: number;
  phaseId: number;
  phaseMembers: string[];
  phaseLeadUserId: string;
  assistantPhaseLeadUserId: string;
}

export interface IPhaseTeamPostDto {
  phaseId: number;
  phase_members: string[];
  phase_lead_user_id: string;
  assistant_phase_lead_user_id: string;
}

export interface IPhaseTeamPutDto {
  phaseId: number;
  phase_members: string[];
  phase_lead_user_id: string;
  assistant_phase_lead_user_id: string;
}

export const mapToIPhaseTeam = (dto: IPhaseTeamDto): IPhaseTeam => ({
  id: dto.id,
  phaseId: dto.phase_id,
  phaseMembers: dto.phase_members,
  phaseLeadUserId: dto.phase_lead_user_id,
  assistantPhaseLeadUserId: dto.assistant_phase_lead_user_id,
});
