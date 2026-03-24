import { describe, expect, it } from 'vitest';

import { IPhaseTeamDto, mapToIPhaseTeam } from '@store/amap_api/personnel/models';
import { IPhaseTeam, IPhaseTeamPostDto, IPhaseTeamPutDto } from '@store/amap_api/personnel/models/IPhaseTeam';

describe('mapToIPhaseTeam', () => {
  it('should correctly map IPhaseTeamDto to IPhaseTeam', () => {
    const dto: IPhaseTeamDto = {
      id: 1,
      phase_id: 100,
      phase_members: ['user1', 'user2'],
      phase_lead_user_id: 'leadUser ',
      assistant_phase_lead_user_id: 'assistantLeadUser ',
    };

    const mapped = mapToIPhaseTeam(dto);

    expect(mapped.id).toBe(dto.id);
    expect(mapped.phaseId).toBe(dto.phase_id);
    expect(mapped.phaseMembers).toEqual(dto.phase_members);
    expect(mapped.phaseLeadUserId).toBe(dto.phase_lead_user_id);
    expect(mapped.assistantPhaseLeadUserId).toBe(dto.assistant_phase_lead_user_id);
  });
});

describe('IPhaseTeamDto example object', () => {
  it('should have correct types', () => {
    const example: IPhaseTeamDto = {
      id: 2,
      phase_id: 200,
      phase_members: ['member1', 'member2'],
      phase_lead_user_id: 'lead1',
      assistant_phase_lead_user_id: 'assistant1',
    };

    expect(typeof example.id).toBe('number');
    expect(typeof example.phase_id).toBe('number');
    expect(Array.isArray(example.phase_members)).toBe(true);
    example.phase_members.forEach((member) => expect(typeof member).toBe('string'));
    expect(typeof example.phase_lead_user_id).toBe('string');
    expect(typeof example.assistant_phase_lead_user_id).toBe('string');
  });
});

describe('IPhaseTeam example object', () => {
  it('should have correct types', () => {
    const example: IPhaseTeam = {
      id: 3,
      phaseId: 300,
      phaseMembers: ['memberA', 'memberB'],
      phaseLeadUserId: 'leadA',
      assistantPhaseLeadUserId: 'assistantA',
    };

    expect(typeof example.id).toBe('number');
    expect(typeof example.phaseId).toBe('number');
    expect(Array.isArray(example.phaseMembers)).toBe(true);
    example.phaseMembers.forEach((member) => expect(typeof member).toBe('string'));
    expect(typeof example.phaseLeadUserId).toBe('string');
    expect(typeof example.assistantPhaseLeadUserId).toBe('string');
  });
});

describe('IPhaseTeamPostDto and IPhaseTeamPutDto example objects', () => {
  it('should have correct types for IPhaseTeamPostDto', () => {
    const example: IPhaseTeamPostDto = {
      phaseId: 400,
      phase_members: ['postMember1', 'postMember2'],
      phase_lead_user_id: 'postLead',
      assistant_phase_lead_user_id: 'postAssistant',
    };

    expect(typeof example.phaseId).toBe('number');
    expect(Array.isArray(example.phase_members)).toBe(true);
    example.phase_members.forEach((member) => expect(typeof member).toBe('string'));
    expect(typeof example.phase_lead_user_id).toBe('string');
    expect(typeof example.assistant_phase_lead_user_id).toBe('string');
  });

  it('should have correct types for IPhaseTeamPutDto', () => {
    const example: IPhaseTeamPutDto = {
      phaseId: 500,
      phase_members: ['putMember1', 'putMember2'],
      phase_lead_user_id: 'putLead',
      assistant_phase_lead_user_id: 'putAssistant',
    };

    expect(typeof example.phaseId).toBe('number');
    expect(Array.isArray(example.phase_members)).toBe(true);
    example.phase_members.forEach((member) => expect(typeof member).toBe('string'));
    expect(typeof example.phase_lead_user_id).toBe('string');
    expect(typeof example.assistant_phase_lead_user_id).toBe('string');
  });
});
