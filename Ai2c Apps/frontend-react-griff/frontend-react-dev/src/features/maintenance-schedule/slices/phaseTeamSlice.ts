import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IPhaseTeam } from '@store/amap_api/personnel/models';
import { RootState } from '@store/store';

interface PhaseTeamState {
  team: IPhaseTeam | null;
}

const initialState: PhaseTeamState = {
  team: {
    id: 0,
    phaseId: 0,
    phaseMembers: [],
    phaseLeadUserId: '',
    assistantPhaseLeadUserId: '',
  },
};

export const phaseTeamSlice = createSlice({
  name: 'phaseTeam',
  initialState,
  reducers: {
    setPhaseTeam: (state, action: PayloadAction<IPhaseTeam>) => {
      state.team = action.payload;
    },
    resetPhaseTeam: (state) => {
      state.team = {
        id: 0,
        phaseId: 0,
        phaseMembers: [],
        phaseLeadUserId: '',
        assistantPhaseLeadUserId: '',
      };
    },
    setPhaseLeadUserId: (state, action: PayloadAction<string>) => {
      if (state.team) state.team.phaseLeadUserId = action.payload;
    },
    setAssistantPhaseLeadUserId: (state, action: PayloadAction<string>) => {
      if (state.team) state.team.assistantPhaseLeadUserId = action.payload;
    },
    setPhaseMemberIds: (state, action: PayloadAction<string[]>) => {
      if (state.team) state.team.phaseMembers = action.payload;
    },
  },
});

export const { setPhaseTeam, resetPhaseTeam, setPhaseLeadUserId, setAssistantPhaseLeadUserId, setPhaseMemberIds } =
  phaseTeamSlice.actions;
export default phaseTeamSlice.reducer;

export const selectPhaseTeam = (state: RootState) => state.phaseTeam.team;
