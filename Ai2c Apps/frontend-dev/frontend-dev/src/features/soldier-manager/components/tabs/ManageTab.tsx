import React, { useEffect, useState } from 'react';

import useUnitAccess from '@hooks/useUnitAccess';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import FlagIcon from '@mui/icons-material/Flag';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  Skeleton,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  Typography,
  useTheme,
} from '@mui/material';
import { TableHead } from '@mui/material';
import { TableRow } from '@mui/material';
import { TableCell } from '@mui/material';

import PmxSearch from '@components/PmxSearch';
import { UnitSelect } from '@components/UnitSelect';
import StatusDisplay from '@features/amtp-packet/components/soldier-info/StatusDisplay';
import { IUnitSoldierFlag, useLazyGetUnitSoldierFlagsQuery } from '@store/amap_ai/soldier_manager';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';
import { StatusType } from '@utils/constants';

import { CreateSoldierDialog } from '../dialogs/CreateSoldierDialog';
import { EditSoldierDialog } from '../dialogs/EditSoldierDialog';
import { MultiAddSoldierFlagDialog } from '../dialogs/MultiAddSoldierFlagDialog';
import { SoldierFlagDialog } from '../dialogs/SoldierFlagDialog';
import { UnitFlagDialog } from '../dialogs/UnitFlagDialog';

const ManageTab = () => {
  const theme = useTheme();
  const { hasRole } = useUnitAccess();
  const [selectedUnit, setSelectedUnit] = useState<IUnitBrief | undefined>(undefined);
  const [checkedSoldierIds, setCheckedSoldierIds] = useState<string[]>([]);
  const [filterValue, setFilterValue] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [createSoldierDialogOpen, setCreateSoldierDialogOpen] = useState<boolean>(false);
  const [selectedSoldier, setSelectedSoldier] = useState<IUnitSoldierFlag | undefined>(undefined);
  const [soldierFlagDialogOpen, setSoldierFlagDialogOpen] = useState<boolean>(false);
  const [unitFlagDialogOpen, setUnitFlagDialogOpen] = useState<boolean>(false);
  const [editSoldierDialogOpen, setEditSoldierDiaogOpen] = useState<boolean>(false);
  const [multiSoldierFlagDialogOpen, setMultiSoldierFlagDialogOpen] = useState<boolean>(false);
  const { data: managedUnits } = useGetUnitsQuery({ role: 'Manager' });
  const [fetchUnitSoldierFlags, { data: unitSoldierFlags, isFetching: loading }] = useLazyGetUnitSoldierFlagsQuery();

  useEffect(() => {
    if (managedUnits && managedUnits.length > 0) {
      setSelectedUnit(managedUnits[0]);
      fetchUnitSoldierFlags(managedUnits[0].uic);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managedUnits]);

  const filteredSoldiers = (unitSoldierFlags?.soldierFlags ?? []).filter((soldier) => {
    if (filterValue.length == 0) {
      return true;
    } else {
      const nameMatch = soldier.name.includes(filterValue);
      const rankMatch = soldier.rank.includes(filterValue);
      const mxAvailabilityMatch = soldier.mxAvailability.includes(filterValue);
      const unitMatch = soldier.unit.includes(filterValue);
      const rolesMatch = soldier.roles.some((role) => role.includes(filterValue));
      const designationsMatch = soldier.designations?.includes(filterValue) ?? false;

      return nameMatch || rankMatch || mxAvailabilityMatch || unitMatch || rolesMatch || designationsMatch;
    }
  });

  const displayedSoldiers = filteredSoldiers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const SkeletonRows = () => {
    return (
      <>
        {[...Array(10)].map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton variant="rectangular" width={24} height={24} />
            </TableCell>
            <TableCell>
              <Skeleton width="120px" />
            </TableCell>
            <TableCell>
              <Skeleton width="60px" />
            </TableCell>
            <TableCell>
              <Skeleton width="100px" />
            </TableCell>
            <TableCell>
              <Skeleton width="80px" />
            </TableCell>
            <TableCell>
              <Skeleton width="80px" />
            </TableCell>
            <TableCell>
              <Skeleton width="60px" />
            </TableCell>
            <TableCell>
              <Skeleton width="120px" />
            </TableCell>
            <TableCell>
              <Skeleton width="120px" />
            </TableCell>
            <TableCell>
              <Skeleton variant="rectangular" width={60} height={24} />
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  };

  return (
    <Box>
      {hasRole('manager') && (
        <Button variant="contained" onClick={() => setCreateSoldierDialogOpen(true)}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonAddAlt1Icon sx={{ mr: 2 }} />
            Create Soldier
          </Box>
        </Button>
      )}

      <Box sx={{ py: 4, width: '370px' }}>
        <UnitSelect
          value={selectedUnit}
          units={managedUnits ?? []}
          onChange={(newUnit: IUnitBrief) => {
            setSelectedUnit(newUnit);
            fetchUnitSoldierFlags(newUnit.uic);
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Button
            disabled={checkedSoldierIds.length === 0}
            variant="text"
            sx={{
              color: theme.palette.text.primary,
              '&:hover:': {
                color: `${theme.palette.text.primary} !important`,
                background: `${theme.palette.action.hover}`,
              },
            }}
            onClick={() => setMultiSoldierFlagDialogOpen(true)}
          >
            <Box display={'flex'} alignItems={'center'}>
              <FlagIcon />
              Flag Soldiers
            </Box>
          </Button>
          <Button
            variant="text"
            disabled={selectedUnit === undefined}
            sx={{ color: theme.palette.text.primary }}
            onClick={() => setUnitFlagDialogOpen(true)}
          >
            <Box display={'flex'} alignItems={'center'}>
              <FlagIcon />
              View Unit Flags
            </Box>
          </Button>
        </Box>
        <PmxSearch
          value={filterValue}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFilterValue(event.target.value)}
        />
      </Box>
      <Box
        sx={{
          label: 'Soldier Flag Table',
          my: 2,
          borderWidth: '2px',
          borderColor: theme.palette.divider,
          borderStyle: 'solid',
          borderRadius: '4px',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={10}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Typography sx={{ whiteSpace: 'nowrap' }}>{selectedUnit?.displayName}</Typography>
                    <StatusDisplay
                      status={
                        unitSoldierFlags?.mxAvailability === 'Available'
                          ? unitSoldierFlags.mxAvailability
                          : (`Flagged - ${unitSoldierFlags?.mxAvailability}` as StatusType)
                      }
                      iconOnly
                    />
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Checkbox
                    aria-label="Check All Soldiers"
                    checked={checkedSoldierIds.length === displayedSoldiers.length && displayedSoldiers.length !== 0}
                    onClick={() => {
                      checkedSoldierIds.length === displayedSoldiers.length
                        ? setCheckedSoldierIds([])
                        : setCheckedSoldierIds(displayedSoldiers.map((soldier) => soldier.dodId));
                    }}
                  />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Rank</TableCell>
                <TableCell>DoD ID</TableCell>
                <TableCell>Mx Availability</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Maintainer</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Designations</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                displayedSoldiers.map((soldier) => (
                  <TableRow
                    key={soldier.dodId}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'inherit',
                      },
                    }}
                  >
                    <TableCell>
                      <Checkbox
                        aria-label={`${soldier.dodId}-checkBox`}
                        checked={checkedSoldierIds.includes(soldier.dodId)}
                        onClick={() => {
                          checkedSoldierIds.includes(soldier.dodId)
                            ? // eslint-disable-next-line sonarjs/no-nested-functions
                              setCheckedSoldierIds((checkedIds) => checkedIds.filter((id) => id !== soldier.dodId))
                            : setCheckedSoldierIds((checkedIds) => [...checkedIds, soldier.dodId]);
                        }}
                      />
                    </TableCell>
                    <TableCell>{soldier.name}</TableCell>
                    <TableCell>{soldier.rank}</TableCell>
                    <TableCell>{soldier.dodId}</TableCell>
                    <TableCell>
                      <StatusDisplay
                        key={soldier.dodId}
                        status={
                          soldier.mxAvailability === 'Available'
                            ? soldier.mxAvailability
                            : (`Flagged - ${soldier.mxAvailability}` as StatusType)
                        }
                        iconOnly
                      />
                    </TableCell>
                    <TableCell>{soldier.unit}</TableCell>
                    <TableCell>
                      <Box display="flex">
                        {soldier.isMaintainer && <CheckIcon />}
                        {soldier.isAmtpMaintainer && (
                          <Chip label="AMTP" sx={{ border: '1px solid', borderRadius: 1, ml: 2 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {soldier.roles.slice(0, 2).map((role) => (
                          <Chip
                            key={`${soldier.dodId}-${role}`}
                            label={role}
                            sx={{
                              borderRadius: 2,
                              background: 'inherit',
                              borderColor: theme.palette.grey.main,
                              border: 1,
                            }}
                          />
                        ))}
                        {soldier.roles.length >= 3 && (
                          <Typography sx={{ mt: 1 }} variant="body1">
                            + {soldier.roles.length - 2}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{soldier.designations ?? '--'}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          setSelectedSoldier(soldier);
                          setEditSoldierDiaogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setSelectedSoldier(soldier);
                          setSoldierFlagDialogOpen(true);
                        }}
                      >
                        <FlagIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {loading && <SkeletonRows />}
              {!loading && displayedSoldiers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10}>No soldier flags to be displayed for this unit.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          aria-label="Unit Soldier Flags Table"
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={unitSoldierFlags?.soldierFlags.length ?? 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_event: unknown, newPage: number) => {
            setPage(newPage);
          }}
          onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          sx={{
            borderWidth: '2px 0px 0px 0px',
            borderColor: theme.palette.divider,
            borderStyle: 'solid',
          }}
        />
      </Box>
      <CreateSoldierDialog
        open={createSoldierDialogOpen}
        setOpen={setCreateSoldierDialogOpen}
        managedUnits={managedUnits ?? []}
      />
      <SoldierFlagDialog open={soldierFlagDialogOpen} setOpen={setSoldierFlagDialogOpen} soldier={selectedSoldier} />
      {selectedUnit && (
        <UnitFlagDialog
          open={unitFlagDialogOpen}
          setOpen={setUnitFlagDialogOpen}
          unit={selectedUnit}
          managedUnits={managedUnits ?? []}
        />
      )}
      {selectedSoldier && (
        <EditSoldierDialog
          open={editSoldierDialogOpen}
          setOpen={setEditSoldierDiaogOpen}
          soldier={selectedSoldier}
          managedUnits={managedUnits ?? []}
        />
      )}
      <MultiAddSoldierFlagDialog
        open={multiSoldierFlagDialogOpen}
        setOpen={setMultiSoldierFlagDialogOpen}
        soldierIds={checkedSoldierIds}
      />
    </Box>
  );
};

export default ManageTab;
