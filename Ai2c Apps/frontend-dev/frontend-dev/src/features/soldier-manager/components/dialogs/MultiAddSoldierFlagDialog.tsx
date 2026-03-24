import React, { useState } from 'react';
import { Dayjs } from 'dayjs';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
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
import { PmxIconLink } from '@components/PmxIconLink';
import { useAddSoldierFlagMutation } from '@store/amap_ai/soldier_flag';
import { ICreateSoldierFlagOut } from '@store/amap_ai/soldier_flag/models';
import { ISoldierFlagOptionsMapping, MXAVAILABILITIES, SOLDIERFLAGTYPES } from '@utils/enums';

export interface IMultiAddSoldierFlagDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  soldierIds: string[];
}

interface IMultiSoldierFlagForm {
  flagType: string | null;
  flagInfo: string;
  mxAvailability: string | null;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  noEndDate: boolean;
  remarks: string | null;
}

const defaultISoldierFlagForm: IMultiSoldierFlagForm = {
  flagType: null,
  flagInfo: '',
  mxAvailability: null,
  startDate: null,
  endDate: null,
  remarks: null,
  noEndDate: false,
};

export const MultiAddSoldierFlagDialog: React.FC<IMultiAddSoldierFlagDialogProps> = ({ open, setOpen, soldierIds }) => {
  const theme = useTheme();
  const [soldierFlagForms, setSoldierFlagForms] = useState<IMultiSoldierFlagForm[]>([defaultISoldierFlagForm]);
  const [createSoldierFlag] = useAddSoldierFlagMutation();

  const formIsVaid = (form: IMultiSoldierFlagForm): boolean => {
    return (
      form !== null &&
      form.flagType !== null &&
      form.flagInfo !== null &&
      form.mxAvailability !== null &&
      form.startDate !== null &&
      form.startDate.isValid() &&
      ((form.endDate && form.endDate.isValid() && !form.noEndDate) || form.noEndDate)
    );
  };

  const canCreate = soldierFlagForms.every(formIsVaid);

  const handleAddSoldierFlags = async () => {
    soldierIds.forEach((soldierId) => {
      soldierFlagForms.forEach(async (soldierFlagForm) => {
        let payload: ICreateSoldierFlagOut = {
          soldier_id: soldierId,
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

        // eslint-disable-next-line sonarjs/no-nested-functions
        await createSoldierFlag({ creationData: payload }).then(() => {
          setSoldierFlagForms([defaultISoldierFlagForm]);
        });
      });
    });

    setSoldierFlagForms([defaultISoldierFlagForm]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth={'xs'} fullWidth sx={{ p: 4, maxHeight: '950px' }}>
      <DialogTitle sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2">Add Flags</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        <Typography sx={{ pb: 2 }}>{`Add an availability flag to all selected soldiers.`}</Typography>
        {soldierFlagForms.map((soldierFlagForm, index) => (
          <Paper key={index} sx={{ p: 4, backgroundColor: theme.palette.layout.background5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
              <Typography variant="body2">Flag {index + 1}</Typography>
              <IconButton
                // eslint-disable-next-line sonarjs/no-nested-functions
                onClick={() => setSoldierFlagForms((prev) => prev.filter((_form, currIndex) => currIndex !== index))}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={4}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="flag-type-select-label">Flag Type</InputLabel>
                  <Select
                    labelId="flag-type-select-label"
                    label="flag-type-select"
                    onChange={(e: SelectChangeEvent) =>
                      setSoldierFlagForms((prev) =>
                        // eslint-disable-next-line sonarjs/no-nested-functions
                        prev.map((currentForm, currentFormId) =>
                          currentFormId === index
                            ? { ...currentForm, flagType: e.target.value as string }
                            : currentForm,
                        ),
                      )
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
                <FormControl fullWidth size="small" disabled={soldierFlagForms[index].flagType === null}>
                  <InputLabel id="flag-info-select-label">Flag Info</InputLabel>
                  <Select
                    labelId="flag-info-select-label"
                    label="flag-info-select"
                    onChange={(e: SelectChangeEvent) =>
                      setSoldierFlagForms((prev) =>
                        // eslint-disable-next-line sonarjs/no-nested-functions
                        prev.map((currentForm, currentFormId) =>
                          currentFormId === index
                            ? { ...currentForm, flagInfo: e.target.value as string }
                            : currentForm,
                        ),
                      )
                    }
                  >
                    {(soldierFlagForms[index].flagType
                      ? // @ts-expect-error - Mapping will work as expected
                        (Object.values(ISoldierFlagOptionsMapping[soldierFlagForms[index].flagType]) as string[])
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
                    onChange={(e: SelectChangeEvent) =>
                      setSoldierFlagForms((prev) =>
                        // eslint-disable-next-line sonarjs/no-nested-functions
                        prev.map((currentForm, currentFormId) =>
                          currentFormId === index
                            ? { ...currentForm, mxAvailability: e.target.value as string }
                            : currentForm,
                        ),
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
              <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <PmxDatePicker
                  small
                  label="Start Date"
                  value={soldierFlagForm.startDate}
                  onChange={(date: Dayjs | null) =>
                    setSoldierFlagForms((prev) =>
                      // eslint-disable-next-line sonarjs/no-nested-functions
                      prev.map((currentForm, currentFormId) =>
                        currentFormId === index ? { ...currentForm, startDate: date } : currentForm,
                      ),
                    )
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
                    setSoldierFlagForms((prev) =>
                      // eslint-disable-next-line sonarjs/no-nested-functions
                      prev.map((currentForm, currentFormId) =>
                        currentFormId === index ? { ...currentForm, endDate: date } : currentForm,
                      ),
                    )
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
                        setSoldierFlagForms((prev) =>
                          // eslint-disable-next-line sonarjs/no-nested-functions
                          prev.map((currentForm, currentFormId) =>
                            currentFormId === index
                              ? { ...currentForm, noEndDate: !currentForm.noEndDate }
                              : currentForm,
                          ),
                        )
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSoldierFlagForms((prev) =>
                      // eslint-disable-next-line sonarjs/no-nested-functions
                      prev.map((currentForm, currentFormId) =>
                        currentFormId === index ? { ...currentForm, remarks: e.target.value as string } : currentForm,
                      ),
                    )
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
        <Box sx={{ pt: 2 }}>
          <PmxIconLink
            text="Add another flag"
            ComponentIcon={AddIcon}
            onClick={() => setSoldierFlagForms((prev) => [...prev, defaultISoldierFlagForm])}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => {
            setSoldierFlagForms([defaultISoldierFlagForm]);
            setOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button variant="contained" onClick={handleAddSoldierFlags} disabled={!canCreate}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};
