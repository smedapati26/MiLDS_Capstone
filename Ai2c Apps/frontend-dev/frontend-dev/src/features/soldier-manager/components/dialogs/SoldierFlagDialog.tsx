import React, { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { InputLabel } from '@mui/material';
import { FormControlLabel } from '@mui/material';

import PmxDatePicker from '@components/PmxDatePicker';
import StatusDisplay from '@features/amtp-packet/components/soldier-info/StatusDisplay';
import {
  useAddSoldierFlagMutation,
  useDeleteSoldierFlagMutation,
  useUpdateSoldierFlagMutation,
} from '@store/amap_ai/soldier_flag';
import { ICreateSoldierFlagOut, IUpdateSoldierFlagOut } from '@store/amap_ai/soldier_flag/models';
import { IUnitSoldierFlag, useLazyGetSoldierFlagsQuery } from '@store/amap_ai/soldier_manager';
import { StatusType } from '@utils/constants';
import { ISoldierFlagOptionsMapping, MXAVAILABILITIES, SOLDIERFLAGTYPES } from '@utils/enums';

export interface ISoldierFlagDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  soldier: undefined | IUnitSoldierFlag;
}

interface ISoldierFlagForm {
  flagId: number | null;
  flagType: string;
  flagInfo: string;
  mxAvailability: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  noEndDate: boolean;
  remarks: string;
}

const defaultISoldierFlagForm: ISoldierFlagForm = {
  flagId: null,
  flagType: '',
  flagInfo: '',
  mxAvailability: '',
  startDate: null,
  endDate: null,
  remarks: '',
  noEndDate: false,
};

export const SoldierFlagDialog: React.FC<ISoldierFlagDialogProps> = ({ open, setOpen, soldier }) => {
  const theme = useTheme();
  const [soldierFlagForm, setSoldierFlagForm] = useState<ISoldierFlagForm | null>(null);
  const [fetchSoldierFlags, { data: soldierFlags }] = useLazyGetSoldierFlagsQuery();
  const [createSoldierFlag] = useAddSoldierFlagMutation();
  const [updateSoldierFlag] = useUpdateSoldierFlagMutation();
  const [deleteSoldierFlag] = useDeleteSoldierFlagMutation();

  useEffect(() => {
    if (soldier) {
      fetchSoldierFlags(soldier.dodId);
    }
  }, [soldier, fetchSoldierFlags]);

  const canCreateOrEdit =
    soldierFlagForm !== null &&
    soldierFlagForm.flagType !== null &&
    soldierFlagForm.flagInfo !== null &&
    soldierFlagForm.mxAvailability !== null &&
    soldierFlagForm.startDate &&
    soldierFlagForm.startDate.isValid() &&
    ((soldierFlagForm.endDate && soldierFlagForm.endDate.isValid() && !soldierFlagForm.noEndDate) ||
      soldierFlagForm.noEndDate);

  const handleAddEditSoldierFlag = async () => {
    if (soldier && soldierFlagForm && canCreateOrEdit) {
      let payload: ICreateSoldierFlagOut = {
        flag_type: soldierFlagForm.flagType!,
        mx_availability: soldierFlagForm.mxAvailability!,
        start_date: soldierFlagForm.startDate!.format('YYYY-MM-DD'),
        end_date: soldierFlagForm.noEndDate ? undefined : soldierFlagForm.endDate!.format('YYYY-MM-DD'),
        flag_remarks: soldierFlagForm.remarks ? soldierFlagForm.remarks : undefined,
      };

      if (soldierFlagForm.flagType === SOLDIERFLAGTYPES.ADMIN) {
        payload = { ...payload, admin_flag_info: soldierFlagForm.flagInfo };
      } else if (soldierFlagForm.flagType === SOLDIERFLAGTYPES.PROFILE) {
        payload = { ...payload, profile_flag_info: soldierFlagForm.flagInfo };
      } else if (soldierFlagForm.flagType === SOLDIERFLAGTYPES.TASKING) {
        payload = { ...payload, tasking_flag_info: soldierFlagForm.flagInfo };
      }

      if (soldierFlagForm.flagId === null) {
        payload = { ...payload, soldier_id: soldier.dodId };

        await createSoldierFlag({ creationData: payload }).then(() => {
          setSoldierFlagForm(null);
          fetchSoldierFlags(soldier.dodId);
        });
      } else {
        await updateSoldierFlag({
          soldier_flag_id: soldierFlagForm.flagId!,
          updateData: payload as IUpdateSoldierFlagOut,
        }).then(() => {
          setSoldierFlagForm(null);
          fetchSoldierFlags(soldier.dodId);
        });
      }
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth={'xs'} fullWidth sx={{ p: 4 }}>
      <DialogTitle sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2">Active Flags</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        <Typography sx={{ pb: 2 }}>{`You are viewing ${soldier?.name}'s active flags.`}</Typography>
        <Button
          disabled={soldierFlagForm !== null}
          startIcon={<AddIcon />}
          sx={{
            ml: -1,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.palette.text.primary,
          }}
          onClick={() => setSoldierFlagForm(defaultISoldierFlagForm)}
        >
          Add Flag
        </Button>
        {soldierFlags
          ?.filter((flag) => flag.flagId !== soldierFlagForm?.flagId)
          .map((flag) => (
            <Paper sx={{ p: 4, mb: 4, backgroundColor: theme.palette.layout.background5 }} key={flag.flagId}>
              <Grid container spacing={2} sx={{ display: 'flex', alignItems: 'center' }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="h6">{flag.flagType}</Typography>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <StatusDisplay
                    status={
                      flag.mxAvailability === 'Available'
                        ? flag.mxAvailability
                        : (`Flagged - ${flag.mxAvailability}` as StatusType)
                    }
                    iconOnly
                  />
                </Grid>
                <Grid size={{ xs: 3 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Box>
                    <IconButton
                      aria-label={`edit-button-${flag.flagId}`}
                      onClick={() => {
                        console.log('HTD', flag),
                          setSoldierFlagForm({
                            flagId: flag.flagId,
                            flagType: flag.flagType,
                            flagInfo: flag.flagInfo ?? '',
                            mxAvailability: flag.mxAvailability,
                            startDate: dayjs(flag.startDate),
                            endDate: flag.endDate && flag.endDate.length > 0 ? dayjs(flag.endDate) : null,
                            noEndDate: typeof flag.endDate !== 'string',
                            remarks: flag.remarks ?? '',
                          });
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="Delete Button"
                      onClick={() => {
                        deleteSoldierFlag({ soldier_flag_id: flag.flagId });
                        fetchSoldierFlags(soldier!.dodId);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Typography sx={{ color: theme.palette.text.secondary }}>Start Date:</Typography>
                  <Typography>{flag.startDate}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 2 }}>
                  <Typography sx={{ color: theme.palette.text.secondary }}>End Date:</Typography>
                  <Typography>{flag.endDate ? flag.endDate : '--'}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 2 }}>
                  <Typography sx={{ color: theme.palette.text.secondary }}>Remarks:</Typography>
                  <Typography>{flag.remarks ? flag.remarks : '--'}</Typography>
                </Grid>
              </Grid>
            </Paper>
          ))}
        {soldierFlags?.length === 0 && (
          <Paper sx={{ p: 4, mb: 4, backgroundColor: theme.palette.layout.background5 }}>
            <Typography>There are no active flags for {soldier?.name}.</Typography>
          </Paper>
        )}
        {soldierFlagForm && (
          <Paper sx={{ p: 4, backgroundColor: theme.palette.layout.background5 }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="flag-type-select-label">Flag Type</InputLabel>
                  <Select
                    labelId="flag-type-select-label"
                    label="flag-type-select"
                    value={soldierFlagForm.flagType}
                    onChange={(e: SelectChangeEvent) =>
                      setSoldierFlagForm((prev) => (prev ? { ...prev, flagType: e.target.value as string } : null))
                    }
                  >
                    {[
                      SOLDIERFLAGTYPES.ADMIN,
                      SOLDIERFLAGTYPES.OTHER,
                      SOLDIERFLAGTYPES.PROFILE,
                      SOLDIERFLAGTYPES.TASKING,
                    ].map((flagType) => (
                      <MenuItem key={flagType} value={flagType}>
                        {flagType}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="flag-info-select-label">Flag Info</InputLabel>
                  <Select
                    labelId="flag-info-select-label"
                    label="flag-info-select"
                    value={soldierFlagForm.flagInfo}
                    onChange={(e: SelectChangeEvent) =>
                      setSoldierFlagForm((prev) => (prev ? { ...prev, flagInfo: e.target.value as string } : null))
                    }
                  >
                    {(soldierFlagForm.flagType.length > 0
                      ? // @ts-expect-error - Mapping will work as expected
                        (Object.values(ISoldierFlagOptionsMapping[soldierFlagForm.flagType]) as string[])
                      : []
                    ).map((flagInfo) => (
                      <MenuItem key={flagInfo} value={flagInfo}>
                        {flagInfo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="mx-availability-select-label">Mx Availability</InputLabel>
                  <Select
                    labelId="mx-availability-select-label"
                    label="mx-availability-select"
                    value={soldierFlagForm.mxAvailability}
                    onChange={(e: SelectChangeEvent) =>
                      setSoldierFlagForm((prev) =>
                        prev ? { ...prev, mxAvailability: e.target.value as string } : null,
                      )
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
              <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center' }}>
                <PmxDatePicker
                  small
                  label="Start Date"
                  value={soldierFlagForm.startDate}
                  onChange={(date: Dayjs | null) =>
                    setSoldierFlagForm((prev) => (prev ? { ...prev, startDate: date } : null))
                  }
                  shrinkLabel
                />
                <Typography display="flex" alignItems={'center'} sx={{ px: 4 }}>
                  -
                </Typography>
                <PmxDatePicker
                  small
                  label="End Date"
                  value={soldierFlagForm.endDate}
                  onChange={(date: Dayjs | null) =>
                    setSoldierFlagForm((prev) => (prev ? { ...prev, endDate: date } : null))
                  }
                  shrinkLabel
                  disabled={soldierFlagForm.noEndDate}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  label={<Typography sx={{ whiteSpace: 'nowrap' }}>No end date</Typography>}
                  sx={{ pl: 2 }}
                  control={
                    <Checkbox
                      sx={{ mr: 2 }}
                      checked={soldierFlagForm.noEndDate}
                      onChange={() =>
                        setSoldierFlagForm((prev) => (prev ? { ...prev, noEndDate: !prev.noEndDate } : null))
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
                  value={soldierFlagForm.remarks}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setSoldierFlagForm((prev) => (prev ? { ...prev, remarks: event.target.value as string } : null))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => setSoldierFlagForm(null)}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleAddEditSoldierFlag} disabled={!canCreateOrEdit}>
                  {soldierFlagForm.flagId ? 'Save' : 'Add'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}
      </DialogContent>
      <DialogActions sx={{ mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => {
            setSoldierFlagForm(null);
            setOpen(false);
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};
