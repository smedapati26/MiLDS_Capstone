/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import useUnitAccess from '@hooks/useUnitAccess';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  Paper,
  Select,
  Table,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Box } from '@mui/material';
import { TableHead } from '@mui/material';
import { TableBody } from '@mui/material';
import { IconButton } from '@mui/material';
import { Grid } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import { MenuItem } from '@mui/material';

import PmxDatePicker from '@components/PmxDatePicker';
import PmxSearch from '@components/PmxSearch';
import StatusDisplay from '@features/amtp-packet/components/soldier-info/StatusDisplay';
import {
  useAddSoldierFlagMutation,
  useDeleteSoldierFlagMutation,
  useUpdateSoldierFlagMutation,
} from '@store/amap_ai/soldier_flag';
import { ICreateSoldierFlagOut, IUpdateSoldierFlagOut } from '@store/amap_ai/soldier_flag/models';
import { useLazyGetUnitFlagsQuery } from '@store/amap_ai/soldier_manager/slices/soldierManagerApi';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { StatusType } from '@utils/constants';
import { MXAVAILABILITIES, UNITPOSITIONSOLDIERFLAGOPTIONS } from '@utils/enums';

export interface IUnitFlagDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  unit: IUnitBrief;
  managedUnits: IUnitBrief[];
}

interface IUnitFlagForm {
  flagId: number | null;
  flagUnitUic: string | null;
  flagType: string;
  flagInfo: string | null;
  mxAvailability: string | null;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  noEndDate: boolean;
  remarks: string | null;
}

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 225,
    },
  },
};

export const UnitFlagDialog: React.FC<IUnitFlagDialogProps> = ({ open, setOpen, unit, managedUnits }) => {
  const theme = useTheme();
  const { hasRole } = useUnitAccess();
  const [filterValue, setFilterValue] = useState<string>('');
  const [unitFlagPage, setUnitFlagPage] = useState<number>(0);
  const [unitFlagRowsPerPage, setUnitFlagRowsPerPage] = useState<number>(10);
  const [unitFlagForm, setUnitFlagForm] = useState<IUnitFlagForm | null>(null);

  const [fetchUnitFlags, { data: unitFlags }] = useLazyGetUnitFlagsQuery();
  const [createSoldierFlag] = useAddSoldierFlagMutation();
  const [updateSoldierFlag] = useUpdateSoldierFlagMutation();
  const [deleteSoldierFlag] = useDeleteSoldierFlagMutation();

  useEffect(() => {
    fetchUnitFlags(unit.uic);
  }, [unit, fetchUnitFlags]);

  const defaultIUnitFlagForm: IUnitFlagForm = useMemo(() => {
    return {
      flagId: null,
      flagUnitUic: unit.uic,
      flagType: 'Unit/Position',
      flagInfo: null,
      mxAvailability: null,
      startDate: null,
      endDate: null,
      remarks: null,
      noEndDate: false,
    };
  }, [unit]);

  const canCreateOrEdit =
    unitFlagForm !== null &&
    unitFlagForm.flagUnitUic !== null &&
    unitFlagForm.flagInfo !== null &&
    unitFlagForm.mxAvailability !== null &&
    unitFlagForm.startDate &&
    unitFlagForm.startDate.isValid() &&
    ((unitFlagForm.endDate && unitFlagForm.endDate.isValid() && !unitFlagForm.noEndDate) || unitFlagForm.noEndDate);

  const handleAddEditSoldierFlag = async () => {
    if (unitFlagForm && unitFlagForm.flagId === null && canCreateOrEdit) {
      const payload: ICreateSoldierFlagOut = {
        unit_uic: unitFlagForm.flagUnitUic!,
        flag_type: unitFlagForm.flagType,
        unit_position_flag_info: unitFlagForm.flagInfo!,
        mx_availability: unitFlagForm.mxAvailability!,
        start_date: unitFlagForm.startDate!.format('YYYY-MM-DD'),
        end_date: unitFlagForm.noEndDate ? undefined : unitFlagForm.endDate!.format('YYYY-MM-DD'),
        flag_remarks: unitFlagForm.remarks ? unitFlagForm.remarks : undefined,
      };

      await createSoldierFlag({ creationData: payload }).then(() => {
        setUnitFlagForm(null);
        fetchUnitFlags(unit.uic);
      });
    } else if (unitFlagForm && unitFlagForm.flagId && canCreateOrEdit) {
      const payload: IUpdateSoldierFlagOut = {
        flag_type: unitFlagForm.flagType,
        unit_position_flag_info: unitFlagForm.flagInfo!,
        mx_availability: unitFlagForm.mxAvailability!,
        start_date: unitFlagForm.startDate!.format('YYYY-MM-DD'),
        end_date: unitFlagForm.noEndDate ? undefined : unitFlagForm.endDate!.format('YYYY-MM-DD'),
        flag_remarks: unitFlagForm.remarks ? unitFlagForm.remarks : undefined,
      };

      await updateSoldierFlag({ soldier_flag_id: unitFlagForm.flagId!, updateData: payload }).then(() => {
        setUnitFlagForm(null);
        fetchUnitFlags(unit.uic);
      });
    }
  };

  const handleDeleteSoldierFlag = async (flagId: number) => {
    await deleteSoldierFlag({ soldier_flag_id: flagId }).then(() => {
      fetchUnitFlags(unit.uic);
    });
  };

  const filteredFlags =
    unitFlags?.filter((flag) => {
      if (filterValue.length === 0) {
        return true;
      } else {
        const unitMatch = flag.unit.includes(filterValue) || flag.unitUic.includes(filterValue);
        const flagMatch = flag.flagType.includes(filterValue);
        const availabilityMatch = flag.mxAvailability.includes(filterValue);
        const startDateMatch = flag.startDate.includes(filterValue);
        const endDateMatch = flag.endDate ? flag.endDate.includes(filterValue) : false;

        return unitMatch || flagMatch || availabilityMatch || startDateMatch || endDateMatch;
      }
    }) ?? [];

  const visibleFlags = filteredFlags.slice(
    unitFlagRowsPerPage * unitFlagPage,
    unitFlagRowsPerPage * unitFlagPage + unitFlagRowsPerPage,
  );

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2">View Unit Flags</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>{`You are viewing active flags for ${unit.displayName}'s flags.`}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 4, alignItems: 'center' }}>
          <Button
            disabled={unitFlagForm !== null && !hasRole('manager')}
            startIcon={<AddIcon />}
            sx={{
              mb: -3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.text.primary,
            }}
            onClick={() => setUnitFlagForm(defaultIUnitFlagForm)}
          >
            Add Flag
          </Button>
          <PmxSearch
            value={filterValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFilterValue(event.target.value as string)}
          />
        </Box>
        {unitFlagForm && (
          <Paper sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="select-unit-label">Select Unit</InputLabel>
                  <Select
                    labelId="select-unit-label"
                    id="select-unit"
                    value={unitFlagForm.flagUnitUic ?? undefined}
                    label="Select Unit"
                    required
                    onChange={(e: SelectChangeEvent) => {
                      setUnitFlagForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              flagUnitUic: managedUnits.find((unit) => unit.uic === (e.target.value as string))!.uic,
                            }
                          : null,
                      );
                    }}
                    MenuProps={MenuProps}
                  >
                    {managedUnits.map((unit) => (
                      <MenuItem key={unit.uic} value={unit.uic}>
                        {unit.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="flag-type-select-label">Flag Type</InputLabel>
                  <Select
                    labelId="flag-type-select-label"
                    label="flag-type-select"
                    value={unitFlagForm.flagInfo ?? undefined}
                    onChange={(e: SelectChangeEvent) =>
                      setUnitFlagForm((prev) => (prev ? { ...prev, flagInfo: e.target.value as string } : null))
                    }
                  >
                    {Object.values(UNITPOSITIONSOLDIERFLAGOPTIONS).map((flagType) => (
                      <MenuItem key={flagType} value={flagType}>
                        {flagType}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="mx-availability-select-label">Mx Availability</InputLabel>
                  <Select
                    labelId="mx-availability-select-label"
                    label="mx-availability-select"
                    value={unitFlagForm.mxAvailability ?? undefined}
                    onChange={(e: SelectChangeEvent) =>
                      setUnitFlagForm((prev) => (prev ? { ...prev, mxAvailability: e.target.value as string } : null))
                    }
                  >
                    {Object.values(MXAVAILABILITIES).map((availability) => (
                      <MenuItem key={availability} value={availability}>
                        {availability}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }} sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <PmxDatePicker
                  small
                  label="Start Date"
                  value={unitFlagForm.startDate}
                  onChange={(date: Dayjs | null) =>
                    setUnitFlagForm((prev) => (prev ? { ...prev, startDate: date } : null))
                  }
                  shrinkLabel
                />
                <Typography display="flex" alignItems={'center'} sx={{ px: 4 }}>
                  -
                </Typography>
                <PmxDatePicker
                  small
                  label="End Date"
                  value={unitFlagForm.endDate}
                  onChange={(date: Dayjs | null) =>
                    setUnitFlagForm((prev) => (prev ? { ...prev, endDate: date } : null))
                  }
                  shrinkLabel
                  disabled={unitFlagForm.noEndDate}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  label={<Typography sx={{ whiteSpace: 'nowrap' }}>No End Date</Typography>}
                  sx={{ pl: 2 }}
                  control={
                    <Checkbox
                      sx={{ mx: 2 }}
                      checked={unitFlagForm.noEndDate}
                      onChange={() =>
                        setUnitFlagForm((prev) => (prev ? { ...prev, noEndDate: !prev.noEndDate } : null))
                      }
                    />
                  }
                ></FormControlLabel>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={1}
                  label="Remarks"
                  value={unitFlagForm.remarks}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setUnitFlagForm((prev) => (prev ? { ...prev, remarks: event.target.value as string } : null))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => setUnitFlagForm(null)}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleAddEditSoldierFlag} disabled={!canCreateOrEdit}>
                  {unitFlagForm.flagId ? 'Save' : 'Add'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        <Box
          sx={{
            my: 4,
            borderWidth: '2px',
            borderColor: theme.palette.divider,
            borderStyle: 'solid',
            borderRadius: '4px',
          }}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Unit</TableCell>
                  <TableCell>Flag</TableCell>
                  <TableCell>Availability</TableCell>
                  <TableCell>Impact</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleFlags.map((flag) => (
                  <TableRow key={flag.flagId}>
                    <TableCell>{flag.unit}</TableCell>
                    <TableCell>{flag.flagType}</TableCell>
                    <TableCell>
                      <StatusDisplay
                        status={
                          flag.mxAvailability === 'Available'
                            ? flag.mxAvailability
                            : (`Flagged - ${flag.mxAvailability}` as StatusType)
                        }
                        iconOnly
                      />
                    </TableCell>
                    <TableCell>{flag.maintainerCount}</TableCell>
                    <TableCell>{flag.startDate}</TableCell>
                    <TableCell>{flag.endDate ?? '--'}</TableCell>
                    <TableCell>
                      <Box>
                        <IconButton
                          onClick={() =>
                            setUnitFlagForm({
                              endDate: dayjs(flag.endDate) ?? null,
                              flagId: flag.flagId,
                              flagType: flag.flagType,
                              flagInfo: flag.flagInfo ?? null,
                              flagUnitUic: flag.unitUic,
                              mxAvailability: flag.mxAvailability,
                              noEndDate: flag.endDate ? false : true,
                              remarks: flag.remarks ?? null,
                              startDate: dayjs(flag.startDate),
                            })
                          }
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteSoldierFlag(flag.flagId)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {unitFlags === undefined ||
                  (unitFlags.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7}>There are no active flags for {unit.displayName} or its units.</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            aria-label="Unit Flags Table"
            rowsPerPageOptions={[10, 25, 50]}
            count={filteredFlags.length}
            rowsPerPage={unitFlagRowsPerPage}
            page={unitFlagPage}
            onPageChange={(_event: unknown, newPage: number) => {
              setUnitFlagPage(newPage);
            }}
            onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setUnitFlagRowsPerPage(parseInt(event.target.value, 10));
              setUnitFlagPage(0);
            }}
            component="div"
            sx={{
              borderWidth: '2px 0px 0px 0px',
              borderColor: theme.palette.divider,
              borderStyle: 'solid',
              minHeight: 32,
              '.MuiTablePagination-toolbar': {
                minHeight: 32,
                height: 32,
                py: 0.25,
              },
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { my: 0 },
              '.MuiTablePagination-select': {
                py: 0.25,
              },
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};
