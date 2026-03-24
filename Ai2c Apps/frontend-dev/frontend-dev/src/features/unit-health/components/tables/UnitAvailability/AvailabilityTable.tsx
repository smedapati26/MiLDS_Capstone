import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CheckIcon from '@mui/icons-material/Check';
import {
  Box,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  ToggleButton,
  Typography,
  useTheme,
} from '@mui/material';
import { TableRow } from '@mui/material';

import { Column } from '@ai2c/pmx-mui';

import { PmxTable } from '@components/PmxTable';
import StatusDisplay from '@features/amtp-packet/components/soldier-info/StatusDisplay';
import { setMaintainer } from '@features/amtp-packet/slices';
import { unitHealthSoldierDataCols } from '@features/unit-health/constants';
import { IUnitAvailabilityData, IUnitAvailabilitySoldierData } from '@store/amap_ai/unit_health';
import { useLazyGetUserQuery } from '@store/amap_ai/user/slices/userApi';
import { useAppDispatch } from '@store/hooks';
import { StatusType } from '@utils/constants';

import { MXAvailabilityTooltip } from '../../dashboard/MXAvailabilityTooltip';
import { AvailabilityFilters } from './AvailabilityFilters';

export interface IAvailabilityTable {
  unitAvailabilityData: IUnitAvailabilityData[] | undefined;
}

export const AvailabilityTable: React.FC<IAvailabilityTable> = ({ unitAvailabilityData }: IAvailabilityTable) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [trigger] = useLazyGetUserQuery();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [filteredUnitAvailabilityData, setFilteredUnitAvailabilityData] = useState<IUnitAvailabilityData[]>([]);
  const [viewBy, setViewBy] = useState<'unit' | 'subordinates' | null>('unit');

  const theme = useTheme();

  const grouped: boolean = viewBy === 'subordinates';

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

  const unitViewSoldierData: IUnitAvailabilitySoldierData[] = useMemo(() => {
    return filteredUnitAvailabilityData.flatMap((unit) => unit.soldiers);
  }, [filteredUnitAvailabilityData]);

  const ThemedToggleButton = styled(ToggleButton)({
    textTransform: 'none',
    color: theme.palette.text.primary,
    borderColor: theme.palette.grey.main,
    '&.Mui-selected': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.d60 : '#99C7F5',
      borderColor: theme.palette.primary.main,
    },
  });

  const handleChangeViewBy = (newViewBy: 'unit' | 'subordinates' | null) => {
    setViewBy(newViewBy);
  };

  const visibleGroupedSoldierData: IUnitAvailabilityData[] = useMemo(() => {
    const startingIndex = page * rowsPerPage;
    const endingIndex = startingIndex + rowsPerPage;

    let currentIndex = 0;
    const result: IUnitAvailabilityData[] = [];

    if (filteredUnitAvailabilityData) {
      for (const unit of filteredUnitAvailabilityData) {
        if (currentIndex >= endingIndex) break;

        const remainingRows = endingIndex - currentIndex;

        if (currentIndex + unit.soldiers.length <= startingIndex) {
          currentIndex += unit.soldiers.length;
          continue;
        }

        const mosStartingIndex = Math.max(startingIndex - currentIndex, 0);
        const mosEndingIndex = Math.min(unit.soldiers.length, mosStartingIndex + remainingRows);

        const visibleSoldiers = unit.soldiers.slice(mosStartingIndex, mosEndingIndex);

        result.push({ unitName: unit.unitName, soldiers: visibleSoldiers });

        currentIndex += unit.soldiers.length;
      }
    }
    return result;
  }, [page, rowsPerPage, filteredUnitAvailabilityData]);

  const unitMLBreakdownTotal: number = unitViewSoldierData.length;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <React.Fragment>
      <Box display={'flex'} justifyContent={'space-between'} sx={{ py: 4 }} aria-label="Table Header and Filters">
        {
          <Box display="flex" alignContent={'center'} alignItems={'center'}>
            <Typography variant="body1" sx={{ pr: 2 }}>
              View By:
            </Typography>
            <ThemedToggleButton
              aria-label="Unit View By Button"
              value="unit"
              selected={viewBy === 'unit'}
              onChange={() => handleChangeViewBy('unit')}
              sx={{ mr: 2, borderRadius: 2 }}
            >
              {viewBy === 'unit' && (
                <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="unit-checked" />
              )}
              Unit
            </ThemedToggleButton>
            <ThemedToggleButton
              aria-label="Subordinates View By Button"
              value="subordinates"
              selected={viewBy === 'subordinates'}
              onChange={() => handleChangeViewBy('subordinates')}
              sx={{ borderRadius: 2 }}
            >
              {viewBy === 'subordinates' && (
                <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="subordinates-checked" />
              )}
              Subordinates
            </ThemedToggleButton>
          </Box>
        }
        <AvailabilityFilters
          unitAvailabilityData={unitAvailabilityData}
          setFilteredUnitAvailabilityData={setFilteredUnitAvailabilityData}
        />
      </Box>
      {!grouped && (
        <PmxTable
          columns={unitHealthSoldierDataCols(handleCallback) as Column<IUnitAvailabilitySoldierData>[]}
          data={unitViewSoldierData}
          getRowId={(row: IUnitAvailabilitySoldierData) => row.userId}
        />
      )}
      {grouped && (
        <Box
          aria-label="Grouped Table"
          sx={{
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
                  <TableCell>Soldier</TableCell>
                  <TableCell>DOD ID</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>MX Availability</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>MOS</TableCell>
                  <TableCell>ML</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleGroupedSoldierData.map((unit) => (
                  <React.Fragment key={`subordinate-unit-view-${unit.unitName}`}>
                    <TableRow
                      key={`subordinate-unit-view-${unit.unitName}-header`}
                      aria-label={`subordinate-unit-view-${unit.unitName}-header`}
                    >
                      <TableCell colSpan={7} sx={{ backgroundColor: theme.palette.layout.background16 }}>
                        <Typography variant="body2">{unit.unitName}</Typography>
                      </TableCell>
                    </TableRow>
                    {unit.soldiers.map((unitSoldier) => (
                      <TableRow key={`subordinate-unit-view-${unit.unitName}-${unitSoldier.name}`}>
                        <TableCell>
                          <Box key={`${unitSoldier.name}-${unitSoldier.userId}`}>
                            <Typography
                              component="a"
                              sx={{
                                textDecoration: 'underline',
                                cursor: 'pointer',
                              }}
                              {...(handleCallback && { onClick: () => handleCallback(unitSoldier.userId) })}
                            >
                              {unitSoldier.name}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>{unitSoldier.userId}</TableCell>
                        <TableCell>{unitSoldier.email || '--'}</TableCell>
                        <TableCell>
                          <MXAvailabilityTooltip flagData={unitSoldier.flagDetails}>
                            <Box component="span" display="inline-block" width="100%">
                              <StatusDisplay
                                key={unitSoldier?.userId}
                                status={
                                  unitSoldier.availability === 'Available'
                                    ? unitSoldier.availability
                                    : (`Flagged - ${unitSoldier.availability}` as StatusType)
                                }
                                iconOnly
                              />
                            </Box>
                          </MXAvailabilityTooltip>
                        </TableCell>
                        <TableCell>{unitSoldier.unit}</TableCell>
                        <TableCell>{unitSoldier.mos}</TableCell>
                        <TableCell>{unitSoldier.ml}</TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            aria-label="Availability Footer"
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={unitMLBreakdownTotal}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderWidth: '2px 0px 0px 0px',
              borderColor: theme.palette.divider,
              borderStyle: 'solid',
            }}
          />
        </Box>
      )}
    </React.Fragment>
  );
};
