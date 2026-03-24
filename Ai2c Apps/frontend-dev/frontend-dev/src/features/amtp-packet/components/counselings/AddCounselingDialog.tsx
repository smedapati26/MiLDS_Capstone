import React, { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

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

import PmxDatePicker from '@components/PmxDatePicker';
import PmxFileUploader from '@components/PmxFileUploader';
import { ICreateDA4856Out, useCreateCounselingMutation } from '@store/amap_ai/counselings';
import { useGetDa7817sQuery } from '@store/amap_ai/events/slices';
import { useAppSelector } from '@store/hooks';

/* Props for the AddCounselingDialog component. */
export interface AddCounselingDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refetchCounselings: () => void;
}

export interface IAddCounselingFormData {
  title: string;
  date: Dayjs | null;
  associateEvent: boolean;
  associatedEvent: string;
}

/**
 * A functional component that acts as the UI and related forms for the Add Counseling Dialog.
 *
 * @component
 * @param { IDA4856 } counseling - The document being added.
 * @param { boolean } open - The state variable for if this dialog is open.
 * @param { React.Dispatch<React.SetStateAction<boolean>> } setOpen - The setState function for the open state for this dialog.
 * @param {() => void} refetchCounselings - The refetch call for the supporting documents query
 * @returns {React.JSX.Element} The rendered component.
 */
const AddCounselingDialog: React.FC<AddCounselingDialogProps> = ({ open, setOpen, refetchCounselings }) => {
  const maintainer = useAppSelector((state) => state.amtpPacket.maintainer);
  const { showAlert } = useSnackbar();
  const [newCounseling, setNewCounseling] = useState<IAddCounselingFormData>({
    title: '',
    date: null,
    associateEvent: false,
    associatedEvent: '',
  });
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const { data: allSoldierEvents } = useGetDa7817sQuery({ user_id: maintainer?.id ?? '1234567890' });
  const [createCounseling, { isLoading: creatingCounseling }] = useCreateCounselingMutation();

  const handleChangeCounselingTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewCounseling((prev) => ({ ...prev, title: event.target.value }));
  };

  const handleChangeCounselingDate = (date: Dayjs | null) => {
    setNewCounseling((prev) => ({ ...prev, date }));
  };

  const handleChangeAssociatedEvent = (event: SelectChangeEvent) => {
    setNewCounseling((prev) => ({ ...prev, associatedEvent: event.target.value as string }));
  };

  const handleClose = () => {
    setNewCounseling({
      title: '',
      date: null,
      associateEvent: false,
      associatedEvent: '',
    });
    setAttachedFile(null);
    setOpen(false);
  };

  const handleSave = async () => {
    const creationData: ICreateDA4856Out = {
      title: newCounseling.title,
      date: newCounseling?.date ? newCounseling.date.toDate() : new Date(),
      associated_event_id: newCounseling.associatedEvent,
    };
    await createCounseling({
      soldier_id: maintainer?.id ?? '1234567890',
      data: creationData,
      file: attachedFile,
    }).then(() => {
      showAlert('Counseling added', 'success', false);
      refetchCounselings();
      handleClose();
    });
  };

  const validCounseling: boolean =
    newCounseling.title.length > 0 && newCounseling.date != null && dayjs(newCounseling.date).isValid();

  return (
    <Dialog onClose={() => setOpen(false)} open={open} aria-label="Add Counseling Dialog">
      <DialogTitle>Add Counseling</DialogTitle>
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
            <PmxDatePicker
              label="Counseling Date"
              value={newCounseling.date}
              onChange={handleChangeCounselingDate}
              shrinkLabel
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
              <Typography>Associate Counseling to Event</Typography>
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
          <PmxFileUploader attachedFile={attachedFile} setAttachedFile={setAttachedFile} />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={!validCounseling}>
          {!creatingCounseling ? (
            'Save'
          ) : (
            <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCounselingDialog;
