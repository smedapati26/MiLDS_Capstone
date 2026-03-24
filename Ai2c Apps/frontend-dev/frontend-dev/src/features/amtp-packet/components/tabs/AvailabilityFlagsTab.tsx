import React, { useState } from 'react';

import useUnitAccess from '@hooks/useUnitAccess';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, IconButton, Skeleton, Tooltip } from '@mui/material';

import { Column } from '@ai2c/pmx-mui';

import { ISoldierFlag, ISoldierPersonnelFlag, ISoldierUnitFlag } from '@store/amap_ai/soldier_flag/models';
import { useGetSoldierFlagsQuery } from '@store/amap_ai/soldier_flag/slices/soldierFlagApi';
import { useAppSelector } from '@store/hooks';

import { soldierFlagCols, soldierPersonnelFlagCols } from '../../constants';
import AddEditSoldierFlagDialog from '../soldier-flags/AddEditSoldierFlagDialog';
import { AmtpTable } from '../tables/AmtpTable';

const AvailabilityFlagsTab: React.FC = () => {
  const { hasRole } = useUnitAccess();
  const maintainer = useAppSelector((state) => state.amtpPacket.maintainer);
  const [addEditDialogOpen, setAddEditDialogOpen] = useState<boolean>(false);
  const [selectedFlag, setSelectedFlag] = useState<ISoldierFlag | null>(null);
  const [isUnitFlag, setisUnitFlag] = useState<boolean>(false);

  const {
    data: availabilityFlagsData,
    isFetching = false,
    refetch: refetchSoldierFlags,
  } = useGetSoldierFlagsQuery({
    soldier_id: maintainer?.id ?? '1234567890',
  });

  const unitFlagColsWithActions = [
    ...soldierFlagCols,
    {
      field: '',
      header: 'Actions',
      renderCell: (_val: null, row: ISoldierFlag) => {
        return (
          <Box>
            {hasRole('manager') && (
              <Tooltip title="Edit">
                <IconButton
                  aria-label="edit"
                  onClick={() => {
                    setisUnitFlag(true);
                    setSelectedFlag(row);
                    setAddEditDialogOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  const soldierFlagColsWithActions = [
    ...soldierFlagCols,
    {
      field: '',
      header: 'Actions',
      renderCell: (_val: null, row: ISoldierFlag) => {
        return (
          <Box>
            {hasRole('manager') && (
              <Tooltip title="Edit">
                <IconButton
                  aria-label="edit"
                  onClick={() => {
                    setisUnitFlag(false);
                    setSelectedFlag(row);
                    setAddEditDialogOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      {!isFetching && hasRole('manager') && (
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => {
            setSelectedFlag(null);
            setAddEditDialogOpen(true);
          }}
        >
          Add Flag{' '}
        </Button>
      )}
      <Box aria-label="Unit Availability Flags Table" sx={{ pb: 8 }}>
        {isFetching && <Skeleton data-testid="skeleton-loading" variant="rectangular" width="100%" height="250px" />}

        {availabilityFlagsData?.unitFlags && !isFetching && (
          <AmtpTable
            filterType="soldier_flags"
            tableProps={{
              columns: unitFlagColsWithActions as Column<ISoldierUnitFlag>[],
              getRowId: (row: ISoldierUnitFlag) => row.id,
              data: availabilityFlagsData.unitFlags,
              isLoading: isFetching,
              tableTitle: 'Unit Soldier Flags',
              expandable: true,
              expandableColumns: soldierPersonnelFlagCols as Column<ISoldierPersonnelFlag>[],
              getExpandedRowId: (row: ISoldierPersonnelFlag) => row.flagId,
              expandableData: availabilityFlagsData.unitFlagPersonnel,
            }}
          />
        )}
      </Box>
      <Box aria-label="Availability Flags Table">
        {availabilityFlagsData?.individualFlags && !isFetching && (
          <AmtpTable
            filterType="soldier_flags"
            tableProps={{
              columns: soldierFlagColsWithActions as Column<ISoldierFlag>[],
              getRowId: (row: ISoldierFlag) => row.id,
              data: availabilityFlagsData.individualFlags,
              isLoading: isFetching,
              tableTitle: 'Individual Soldier Flags',
            }}
          />
        )}
      </Box>
      <AddEditSoldierFlagDialog
        soldierFlag={selectedFlag}
        open={addEditDialogOpen}
        handleClose={() => setAddEditDialogOpen(false)}
        refetchSoldierFlags={refetchSoldierFlags}
        isUnitFlag={isUnitFlag}
      />
    </Box>
  );
};

export default AvailabilityFlagsTab;
