import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IUnitBrief } from '@store/amap_ai/units/models';

export type ReportType = 'mos/ml' | 'unit-tracker';
export interface IUnitHealthState {
  subordinateTableView: boolean;
  reportType: ReportType | undefined;
  reportConfig: Array<'mos' | 'ml'>;
  unitHealthSelectedUnit: IUnitBrief | undefined;
}

const initialState: IUnitHealthState = {
  subordinateTableView: false,
  reportType: undefined,
  reportConfig: [],
  unitHealthSelectedUnit: undefined,
};

export const unitHealthSlice = createSlice({
  name: 'unitHealth',
  initialState,
  reducers: {
    setSubordinateView: (state, action: PayloadAction<boolean>) => {
      state.subordinateTableView = action.payload;
    },
    setReportType: (state, action: PayloadAction<ReportType>) => {
      state.reportType = action.payload;
    },
    setReportConfig: (state, action: PayloadAction<Array<'mos' | 'ml'>>) => {
      state.reportConfig = action.payload;
    },
    setSelectedHealthUnit: (state, action: PayloadAction<IUnitBrief | undefined>) => {
      state.unitHealthSelectedUnit = action.payload;
    },
  },
});

// Actions
export const { setSubordinateView, setReportType, setReportConfig, setSelectedHealthUnit } = unitHealthSlice.actions;

// Reducer
export const unitHealthReducer = unitHealthSlice.reducer;
