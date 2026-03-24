/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useMemo, useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import { Box, Chip, Divider, Grid, Paper, Typography } from '@mui/material';

import { PmxTreeDropdown, TreeNode } from '@ai2c/pmx-mui';

import { Column } from '@components/PmxTable';
import PmxToggleBtnGroup from '@components/PmxToggleBtnGroup';
import { PmxGroupData } from '@components/tables';
import { UnitSelect } from '@components/UnitSelect';
import { ITransferSolder, useLazyGetUnitsQuery } from '@store/amap_ai/transfer_request';
import { IUnitBrief } from '@store/amap_ai/units/models';
import {
  useGetUnitsQuery,
  useLazyGetUnitsQuery as useLazyGetOverallUnitsQuery,
} from '@store/amap_ai/units/slices/unitsApiSlice';
import { useAppSelector } from '@store/hooks';

import SoldierManagerTable from '../SoldierManagerTable';

const columns = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'dodId', header: 'DOD ID', sortable: true },
  {
    field: 'isMaintainer',
    header: 'Maintainer',
    sortable: true,
    renderCell: (_val: boolean, row: ITransferSolder) => {
      return (
        <Box display="flex">
          {row.isMaintainer && <CheckIcon />}
          {row.isAmtpMaintainer && <Chip label="AMTP" sx={{ border: '1px solid', borderRadius: 1, ml: 2 }} />}
        </Box>
      );
    },
  },
];

const TransferSoldiersPage = <T extends object>() => {
  const { appUser } = useAppSelector((state) => state.appSettings);
  const globalSelectedUnit: IUnitBrief = useAppSelector((state) => state.appSettings.currentUnit);

  const [selectedLosingRows, setSelectedLosingRows] = useState<T[]>([]);
  const [losingUnitData, setLosingUnitData] = useState<PmxGroupData<T>>([]);
  const [gainingUnitData, setGainingUnitData] = useState<PmxGroupData<T>>([]);
  const [losingUnits, setLosingUnits] = useState<string[]>([]);
  const [gainingUnit, setGainingUnit] = useState<IUnitBrief | undefined>(undefined);
  const [transferFromGroup, setTransferFromGroup] = useState<string>('self');
  const [transferToGroup, setTransferToGroup] = useState<string>('External');
  const {
    data: units,
    isFetching,
    isSuccess,
  } = useGetUnitsQuery({
    role: appUser?.isAdmin ? undefined : 'Manager',
  });

  const [fetchAllUnits, { data: allUnits, isSuccess: isSuccessAllUnits }] = useLazyGetOverallUnitsQuery({});

  const [getUnits, { isFetching: soldierUnitsLoading }] = useLazyGetUnitsQuery({});

  useEffect(() => {
    const uics = transferFromGroup === 'self' ? losingUnits : [transferFromGroup];
    if (!uics?.length) {
      setLosingUnitData([]);
      return;
    }
    getUnits({ uics }).then((res) => {
      const groupedData = res.data?.map((x) => ({
        id: x.id,
        label: x.unitName,
        // eslint-disable-next-line sonarjs/no-nested-functions
        children: x.soldiers?.map((x) => ({
          dodId: x.userId,
          name: `${x.rank} ${x.firstName} ${x.lastName}`,
          isMaintainer: x.isMaintainer,
          isAmtpMaintainer: x.isAmtpMaintainer,
        })),
      }));
      setLosingUnitData(groupedData as PmxGroupData<T>);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [losingUnits, transferFromGroup]);

  const unitOptions = useMemo(() => {
    if (!units) return [];

    // Recursive function to loop through and build the tree for the PMxTreeDropdown component
    const transformUnitsToTree = (parentUic: string): TreeNode[] => {
      const allUnits = units.filter((unit) => unit.parentUic === parentUic);
      const children = allUnits.filter((x) => x.uic !== 'TRANSIENT');

      return children?.map((unit) => {
        const childNodes = transformUnitsToTree(unit.uic);
        return {
          id: unit.uic,
          value: unit.displayName,
          level: unit.level,
          ...(childNodes.length > 0 && { children: childNodes }),
        };
      });
    };

    const topLevel = units.filter((unit) => unit.level === 0);
    if (transferFromGroup !== 'External')
      return topLevel.map((unit) => ({
        id: unit.uic,
        value: unit.displayName,
        level: unit.level,
        children: transformUnitsToTree(unit.uic),
      }));
    return units.map((unit) => ({
      id: unit.uic,
      value: unit.displayName,
      level: unit.level,
      children: transformUnitsToTree(unit.uic),
    }));
  }, [units, transferFromGroup]);

  useEffect(() => {
    setLosingUnitData([]);
    setGainingUnitData([]);
  }, [globalSelectedUnit]);

  useEffect(() => {
    if (transferToGroup === 'all')
      fetchAllUnits({
        role: undefined,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferToGroup]);

  return (
    <Grid container>
      <Grid size={{ xs: 6 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" mb={4}>
            Transfer From
          </Typography>
          <PmxToggleBtnGroup
            buttons={[
              { label: 'My Unit(s)', value: 'self' },
              {
                label: 'Soldiers In Transit',
                value: 'TRANSIENT',
              },
              { label: 'External Units (Request)', value: 'External' },
            ]}
            selected={transferFromGroup}
            onChange={(value) => {
              setTransferFromGroup(value as string);
            }}
          />
          <Box mt={4}>
            {transferFromGroup !== 'TRANSIENT' && transferFromGroup !== 'External' && (
              <PmxTreeDropdown
                label="Losing Unit*"
                values={isSuccess ? losingUnits : []}
                options={unitOptions}
                onChange={(val) => setLosingUnits(val)}
                minWidth={757}
                maxWidth={757}
                maxDepth={7}
                loading={isFetching}
                isNested
                rootLevel={0}
              />
            )}
          </Box>
          <Divider sx={{ borderColor: 'lightgrey', borderBottomWidth: '1px', opacity: '0.2', mb: 4, mt: 4 }} />
          <SoldierManagerTable
            columns={columns as Column<T>[]}
            data={losingUnitData as PmxGroupData<T>}
            loading={soldierUnitsLoading}
            // @ts-expect-error
            selectedRows={selectedLosingRows}
            onSelectionChange={(selected: T[]) => {
              setSelectedLosingRows(selected);

              const unitGroups = losingUnitData.reduce((acc, group) => {
                const matching = group.children.filter((soldier) =>
                  // @ts-expect-error
                  // eslint-disable-next-line sonarjs/no-nested-functions
                  selected.some((sel) => sel.dodId === soldier.dodId),
                );
                if (matching.length > 0) {
                  acc.push({
                    id: group.id,
                    label: group.label,
                    children: matching,
                  });
                }
                return acc;
              }, [] as PmxGroupData<T>);

              setGainingUnitData([...unitGroups, ...gainingUnitData]);
            }}
            filtersDisabled={losingUnits.length === 0}
            showTransfer={false}
          />
        </Paper>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" mb={4}>
            Transfer To
          </Typography>
          <PmxToggleBtnGroup
            buttons={[
              { label: 'Units', value: 'all' },
              {
                label: 'Soldiers In Transit',
                value: 'TRANSIENT',
              },
              {
                label: 'Soldiers Pending ETS',
                value: 'ETSUNIT',
              },
            ]}
            selected={transferToGroup}
            onChange={(value) => {
              setTransferToGroup(value as string);
            }}
          />
          <Box mt={5}>
            {transferToGroup === 'all' && (
              <UnitSelect
                units={isSuccessAllUnits ? allUnits : []}
                onChange={(val) => setGainingUnit(val)}
                value={gainingUnit as IUnitBrief}
                readOnly={false}
                width="100%"
                label="Gaining Unit*"
              />
            )}
          </Box>
          <Divider sx={{ borderColor: 'lightgrey', borderBottomWidth: '1px', opacity: '0.2', mb: 4, mt: 4 }} />
          <SoldierManagerTable
            columns={columns as Column<T>[]}
            data={gainingUnitData}
            // @ts-expect-error
            selectedRows={selectedLosingRows}
            onSelectionChange={(selected: T[]) => {
              // Filter selected rows to only retain those currently chosen
              setSelectedLosingRows(selected);
              const updatedGroups = losingUnitData.reduce((acc, group) => {
                const matching = group.children.filter((soldier) =>
                  // @ts-expect-error
                  // eslint-disable-next-line sonarjs/no-nested-functions
                  selected.some((sel) => sel.dodId === soldier.dodId),
                );
                if (matching.length > 0) {
                  acc.push({
                    id: group.id,
                    label: group.label,
                    children: matching,
                  });
                }
                return acc;
              }, [] as PmxGroupData<T>);

              setGainingUnitData(updatedGroups);
            }}
            filtersDisabled={!gainingUnit}
            showTransfer
            transferFromGroup={transferFromGroup}
            transferToGroup={transferToGroup}
            gainingUnit={gainingUnit ?? undefined}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default TransferSoldiersPage;
