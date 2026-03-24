import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, useTheme } from '@mui/material';

import { Column } from '@ai2c/pmx-mui';

import { PmxTable } from '@components/PmxTable';
import { setMaintainer } from '@features/amtp-packet/slices';
import { unitHealthSoldierEvaluationsCols } from '@features/unit-health/constants';
import { IUnitEvaluationsSoldierData } from '@store/amap_ai/unit_health';
import { useLazyGetUserQuery } from '@store/amap_ai/user/slices/userApi';
import { useAppDispatch } from '@store/hooks';

import { EvaluationFilters } from './EvaluationFilters';

export interface IEvaluationsTable {
  unitEvaluationsData: IUnitEvaluationsSoldierData[] | undefined;
  isLoading: boolean;
}

export const EvaluationsTable: React.FC<IEvaluationsTable> = ({
  unitEvaluationsData,
  isLoading,
}: IEvaluationsTable) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [trigger] = useLazyGetUserQuery();
  const [filteredUnitEvaluationsData, setFilteredUnitEvaluationsData] = useState<IUnitEvaluationsSoldierData[]>([]);

  const handleCallback = async (userId: string) => {
    const currentSoldier = await trigger({ userId: userId }).unwrap();

    const selectedSoldier = {
      id: currentSoldier.userId,
      name: `${currentSoldier.rank} ${currentSoldier?.firstName} ${currentSoldier?.lastName}`,
      pv2Dor: currentSoldier?.pv2Dor as string,
      pfcDor: currentSoldier?.pfcDor as string,
      sfcDor: currentSoldier?.sfcDor as string,
      sgtDor: currentSoldier?.sgtDor as string,
      spcDor: currentSoldier?.spcDor as string,
      ssgDor: currentSoldier?.ssgDor as string,
    };

    await dispatch(setMaintainer(selectedSoldier));
    navigate('/amtp-packet');
  };

  return (
    <React.Fragment>
      <Box display={'flex'} flex={'end'} justifyContent={'flex-end'} sx={{ py: 4 }} aria-label="Table Filters">
        <EvaluationFilters
          unitEvaluationsData={unitEvaluationsData}
          setFilteredUnitEvaluationsData={setFilteredUnitEvaluationsData}
        />
      </Box>
      <PmxTable
        columns={unitHealthSoldierEvaluationsCols(theme, handleCallback) as Column<IUnitEvaluationsSoldierData>[]}
        data={filteredUnitEvaluationsData}
        isLoading={isLoading}
        getRowId={(row) => row.name}
      />
    </React.Fragment>
  );
};
