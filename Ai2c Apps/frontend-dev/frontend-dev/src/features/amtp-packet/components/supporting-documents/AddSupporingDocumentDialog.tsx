import React, { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import { useSnackbar } from '@context/SnackbarProvider';
import {
  Button,
  Checkbox,
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
import { useGetSoldierDesignationsQuery } from '@store/amap_ai/designation/slices/designationApi';
import { useGetDa7817sQuery } from '@store/amap_ai/events/slices';
import {
  ICreateSupportingDocumentOut,
  useCreateSupportingDocumentMutation,
  useGetAllDocumentTypesQuery,
} from '@store/amap_ai/supporting_documents';
import { useAppSelector } from '@store/hooks';

/* Props for the AddSupportingDocumentDialog component. */
export interface AddSupportDocumentDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refetchSupportingDocuments: () => void;
}

export interface IAddSupportingDocumenForm {
  title: string;
  type: string;
  date: Dayjs | null;
  associateEvent: boolean;
  associatedEvent: string;
  associateDesignation: boolean;
  associatedDesignation: string;
}

/**
 * A functional component that acts as the UI and related forms for the Add Supporting Document Dialog.
 *
 * @component
 * @param { boolean } open - The state variable for if this dialog is open.
 * @param { React.Dispatch<React.SetStateAction<boolean>> } setOpen - The setState function for the open state for this dialog.
 * @param {() => void} refetchSupportingDocuments - The refetch call for the supporting documents query
 * @returns {React.JSX.Element} The rendered component.
 */
const AddSupportingDocumentDialog: React.FC<AddSupportDocumentDialogProps> = ({
  open,
  setOpen,
  refetchSupportingDocuments,
}) => {
  const maintainer = useAppSelector((state) => state.amtpPacket.maintainer);
  const { showAlert } = useSnackbar();
  const [newDocument, setNewDocument] = useState<IAddSupportingDocumenForm>({
    title: '',
    type: '',
    date: null,
    associateEvent: false,
    associatedEvent: '',
    associateDesignation: false,
    associatedDesignation: '',
  });
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const { data: allDocumentTypes } = useGetAllDocumentTypesQuery();
  const { data: allSoldierDesignations } = useGetSoldierDesignationsQuery({
    user_id: maintainer?.id ?? '1234567890',
    current: false,
  });
  const { data: allSoldierEvents } = useGetDa7817sQuery({ user_id: maintainer?.id ?? '1234567890' });
  const [createSupportingDocument, { isLoading }] = useCreateSupportingDocumentMutation();

  const handleChangeDocTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewDocument((prev) => ({ ...prev, title: event.target.value }));
  };

  const handleChangeDocDate = (date: Dayjs | null) => {
    setNewDocument((prev) => ({ ...prev, date }));
  };

  const handleChangeDocType = (event: SelectChangeEvent) => {
    setNewDocument((prev) => ({ ...prev, type: event.target.value }));
  };

  const handleChangeAssociatedEvent = (event: SelectChangeEvent) => {
    setNewDocument((prev) => ({ ...prev, associatedEvent: event.target.value as string }));
  };

  const handleChangeAssociatedDesignation = (event: SelectChangeEvent) => {
    setNewDocument((prev) => ({ ...prev, associatedDesignation: event.target.value }));
  };

  const handleClose = () => {
    setNewDocument({
      title: '',
      type: '',
      date: null,
      associateEvent: false,
      associatedEvent: '',
      associateDesignation: false,
      associatedDesignation: '',
    });
    setAttachedFile(null);
    setOpen(false);
  };

  const handleSave = async () => {
    const creationData: ICreateSupportingDocumentOut = {
      document_title: newDocument.title,
      document_type: newDocument.type,
      document_date: newDocument?.date ? newDocument.date.toDate() : new Date(),
      related_designation_id: newDocument.associatedDesignation,
      related_event_id: newDocument.associatedEvent,
    };

    if (attachedFile) {
      await createSupportingDocument({
        soldier_id: maintainer?.id ?? '1234567890',
        data: creationData,
        file: attachedFile,
      });

      setNewDocument({
        title: '',
        type: '',
        date: null,
        associateEvent: false,
        associatedEvent: '',
        associateDesignation: false,
        associatedDesignation: '',
      });
      setAttachedFile(null);
      setOpen(false);
      showAlert('Document added', 'success', false);
      refetchSupportingDocuments();
    }
  };

  const validDocument =
    newDocument.title.length > 0 &&
    newDocument.type.length > 0 &&
    newDocument.date != null &&
    dayjs(newDocument.date).isValid() &&
    attachedFile !== null;

  return (
    <Dialog onClose={() => setOpen(false)} open={open} aria-label="Add Supporting Document Dialog">
      <DialogTitle>Add Document</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Fill out the document information and browse for the document you want to add.
        </Typography>
        <Grid container sx={{ py: 2 }} spacing={4}>
          <Grid size={{ xs: 12 }}>
            <TextField
              id="document-title"
              label="Document Title"
              value={newDocument.title}
              onChange={handleChangeDocTitle}
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 8 }}>
            <FormControl required fullWidth aria-label="Document Type Form">
              <InputLabel id="document-type-label">Document Type</InputLabel>
              <Select
                id="document-type"
                labelId="document-type-label"
                label="Document Type"
                value={newDocument.type}
                onChange={handleChangeDocType}
              >
                {allDocumentTypes?.map((type) => (
                  <MenuItem key={type.id.toString()} value={type.type}>
                    {type.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <PmxDatePicker label="Document Date" value={newDocument.date} onChange={handleChangeDocDate} shrinkLabel />
          </Grid>
          <Grid container size={{ xs: 12 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 1 }}>
              <Checkbox
                checked={newDocument.associateEvent}
                aria-label="Associate Event Checkbox"
                onChange={() => setNewDocument((prev) => ({ ...prev, associateEvent: !prev.associateEvent }))}
              />
            </Grid>
            <Grid size={{ xs: 11 }}>
              <Typography>Associated Document to Event</Typography>
            </Grid>
          </Grid>
          <Grid size={{ xs: 1 }} />
          <Grid size={{ xs: 11 }} sx={{ justifyContent: 'flex-end' }}>
            <FormControl fullWidth aria-label="Event Form" disabled={!newDocument.associateEvent}>
              <InputLabel id="event-label">Event</InputLabel>
              <Select
                labelId="event-label"
                id="event"
                value={newDocument.associatedEvent}
                label="Event"
                onChange={handleChangeAssociatedEvent}
                disabled={!newDocument.associateEvent}
              >
                {allSoldierEvents?.map((event) => (
                  <MenuItem key={event.id.toString()} value={event.id.toString()}>
                    {`${event.date} - ${event.eventType}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid container size={{ xs: 12 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 1 }}>
              <Checkbox
                checked={newDocument.associateDesignation}
                aria-label="Assign Designation Checkbox"
                onChange={() =>
                  setNewDocument((prev) => ({ ...prev, associateDesignation: !prev.associateDesignation }))
                }
              />
            </Grid>
            <Grid size={{ xs: 11 }}>
              <Typography>Assign designation</Typography>
            </Grid>
          </Grid>
          <Grid size={{ xs: 1 }} />
          <Grid size={{ xs: 11 }} sx={{ justifyContent: 'flex-end' }}>
            <FormControl fullWidth aria-label="Designation Form">
              <InputLabel id="designation-label">Designation</InputLabel>
              <Select
                labelId="designation-label"
                id="designation"
                value={newDocument.associatedDesignation}
                label="Designation"
                onChange={handleChangeAssociatedDesignation}
                disabled={!newDocument.associateDesignation}
              >
                {allSoldierDesignations?.map((designation) => (
                  <MenuItem key={designation.id.toString()} value={designation.id.toString()}>
                    {designation.designation}: {designation.startDate} - {designation.endDate}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <PmxFileUploader attachedFile={attachedFile} setAttachedFile={setAttachedFile} />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} aria-label="Cancel Button" variant="outlined">
          Cancel
        </Button>
        <Button
          loading={isLoading}
          onClick={handleSave}
          aria-label="Save Button"
          variant="contained"
          disabled={!validDocument}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSupportingDocumentDialog;
