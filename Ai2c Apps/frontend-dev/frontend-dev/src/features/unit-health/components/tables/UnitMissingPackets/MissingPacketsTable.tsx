import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, useTheme } from '@mui/material';

import { Column } from '@ai2c/pmx-mui';

import { PmxTable } from '@components/PmxTable';
import { setMaintainer } from '@features/amtp-packet/slices';
import { unitHealthSoldierMissingPacketCols } from '@features/unit-health/constants';
import { IUnitMissingPacketsSoldierData } from '@store/amap_ai/unit_health';
import { useLazyGetUserQuery } from '@store/amap_ai/user/slices/userApi';
import { useAppDispatch } from '@store/hooks';

import { MissingPacketsFilters } from './MissingPacketsFilters';

export interface IMissingPacketsTable {
  unitMissingPacketsData: IUnitMissingPacketsSoldierData[] | undefined;
}

export const MissingPacketsTable: React.FC<IMissingPacketsTable> = ({
  unitMissingPacketsData,
}: IMissingPacketsTable) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [trigger] = useLazyGetUserQuery();
  const [filteredUnitMissingPacketsData, setFilteredUnitMissingPacketsData] = useState<
    IUnitMissingPacketsSoldierData[]
  >([]);

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
        <MissingPacketsFilters
          unitMissingPacketsData={unitMissingPacketsData}
          setFilteredUnitMissingPacketsData={setFilteredUnitMissingPacketsData}
        />
      </Box>
      <PmxTable
        columns={unitHealthSoldierMissingPacketCols(theme, handleCallback) as Column<IUnitMissingPacketsSoldierData>[]}
        data={filteredUnitMissingPacketsData}
        getRowId={(row) => row.name}
      />
    </React.Fragment>
  );
};
