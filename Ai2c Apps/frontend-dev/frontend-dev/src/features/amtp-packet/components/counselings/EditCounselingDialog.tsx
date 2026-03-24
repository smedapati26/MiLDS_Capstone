import React, { useEffect, useState } from 'react';

import { useSnackbar } from '@context/SnackbarProvider';
import {
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';

import { IDA4856, IUpdateDA4856Out, useUpdateCounselingMutation } from '@store/amap_ai/counselings';
import { useGetDa7817sQuery } from '@store/amap_ai/events/slices';
import { useAppSelector } from '@store/hooks';

/* Props for the EditCounselingDialog component. */
export interface EditCounselingDialogProps {
  counseling: IDA4856;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refetchCounselings: () => void;
}

export interface IEditCounselingFormData {
  title: string;
  date: string;
  associateEvent: boolean;
  associatedEvent: string;
}

/**
 * A functional component that acts as the UI and related forms for the Edit Counseling Dialog.
 *
 * @component
 * @param { IDA4856 } counseling - The document being edited.
 * @param { boolean } open - The state variable for if this dialog is open.
 * @param { React.Dispatch<React.SetStateAction<boolean>> } setOpen - The setState function for the open state for this dialog.
 * @param {() => void} refetchCounselings - The refetch call for the supporting documents query
 * @returns {React.JSX.Element} The rendered component.
 */
const EditCounselingDialog: React.FC<EditCounselingDialogProps> = ({
  counseling,
  open,
  setOpen,
  refetchCounselings,
}) => {
  const maintainer = useAppSelector((state) => state.amtpPacket.maintainer);
  const { showAlert } = useSnackbar();
  const [newCounseling, setNewCounseling] = useState<IEditCounselingFormData>({
    title: counseling.title,
    date: counseling.date,
    associateEvent: counseling.associatedEvent !== null,
    associatedEvent: counseling.associatedEvent?.id.toString() ?? '',
  });

  const { data: allSoldierEvents } = useGetDa7817sQuery({ user_id: maintainer?.id ?? '1234567890' });
  const [updateCounseling, { isLoading: updatingCounseling }] = useUpdateCounselingMutation();

  useEffect(() => {
    if (allSoldierEvents) {
      const currentEvent = allSoldierEvents.find((event) => event.id === counseling.associatedEvent?.id);
      if (currentEvent) {
        setNewCounseling((prev) => ({ ...prev, associatedEvent: currentEvent.id.toString() }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSoldierEvents]);

  const handleChangeCounselingTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewCounseling((prev) => ({ ...prev, title: event.target.value }));
  };

  const handleChangeCounselingDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewCounseling((prev) => ({ ...prev, date: event.target.value }));
  };

  const handleChangeAssociatedEvent = (event: SelectChangeEvent) => {
    setNewCounseling((prev) => ({ ...prev, associatedEvent: event.target.value as string }));
  };

  const handleClose = () => {
    setNewCounseling({
      title: counseling.title,
      date: counseling.date,
      associateEvent: counseling.associatedEvent !== null,
      associatedEvent: counseling.associatedEvent?.id.toString() ?? '',
    });
    setOpen(false);
  };

  const handleSave = async () => {
    const updateData: IUpdateDA4856Out = {
      title: newCounseling.title,
      date: new Date(newCounseling.date).toISOString().slice(0, 10),
      associateEvent: newCounseling.associateEvent,
      event: newCounseling.associatedEvent,
    };
    await updateCounseling({ counseling_id: counseling.id, data: updateData }).then(() => {
      setOpen(false);
      showAlert('Counseling saved', 'success', false);
      refetchCounselings();
    });
  };

  return (
    <Dialog key={counseling.id} onClose={() => setOpen(false)} open={open} aria-label="Edit Counseling Dialog">
      <DialogTitle>Edit Counseling</DialogTitle>
      <DialogContent>
        <Grid container sx={{ py: 2 }} spacing={4}>
          <Grid size={{ xs: 7 }}>
            <TextField
              id="Counseling Title"
              label="Counseling Title"
              value={newCounseling.title}
              onChange={handleChangeCounselingTitle}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 5 }}>
            <TextField
              id="Counseling Date"
              label="Counseling Date"
              value={newCounseling.date}
              onChange={handleChangeCounselingDate}
              fullWidth
            />
          </Grid>
          <Grid container size={{ xs: 12 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 1 }}>
              <Checkbox
                checked={newCounseling.associateEvent}
                aria-label="Associate Event Checkbox"
                onChange={() => setNewCounseling((prev) => ({ ...prev, associateEvent: !prev.associateEvent }))}
              />
            </Grid>
            <Grid size={{ xs: 11 }}>
              <Typography>Associate counseling to an event</Typography>
            </Grid>
          </Grid>
          <Grid size={{ xs: 1 }} />
          <Grid size={{ xs: 11 }} sx={{ justifyContent: 'flex-end' }}>
            <FormControl fullWidth aria-label="Event Form" disabled={!newCounseling.associateEvent}>
              <InputLabel id="event-label">Event</InputLabel>
              <Select
                labelId="event-label"
                id="event"
                value={newCounseling.associatedEvent}
                label="Event"
                onChange={handleChangeAssociatedEvent}
                disabled={!newCounseling.associateEvent}
              >
                {allSoldierEvents?.map((event) => (
                  <MenuItem key={event.id.toString()} value={event.id.toString()}>
                    {`${event.date} - ${event.eventType}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          {!updatingCounseling ? (
            'Save'
          ) : (
            <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCounselingDialog;
