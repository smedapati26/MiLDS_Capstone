import React, { useEffect, useState } from 'react';

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

import { useGetSoldierDesignationsQuery } from '@store/amap_ai/designation/slices/designationApi';
import { useGetDa7817sQuery } from '@store/amap_ai/events/slices';
import {
  IUpdateSupportingDocumentOut,
  SupportingDocument,
  useGetAllDocumentTypesQuery,
  useUpdateSupportingDocumentMutation,
} from '@store/amap_ai/supporting_documents';
import { useAppSelector } from '@store/hooks';

/* Props for the EditSupportingDocumentDialog component. */
export interface EditSupportDocumentDialogProps {
  document: SupportingDocument;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refetchSupportingDocuments: () => void;
}

/**
 * A functional component that acts as the UI and related forms for the Edit Supporting Document Dialog.
 *
 * @component
 * @param { SupportingDocument } document - The document being edited.
 * @param { boolean } open - The state variable for if this dialog is open.
 * @param { React.Dispatch<React.SetStateAction<boolean>> } setOpen - The setState function for the open state for this dialog.
 * @param {() => void} refetchSupportingDocuments - The refetch call for the supporting documents query
 * @returns {React.JSX.Element} The rendered component.
 */
const EditSupportingDocumentDialog: React.FC<EditSupportDocumentDialogProps> = ({
  document,
  open,
  setOpen,
  refetchSupportingDocuments,
}) => {
  const maintainer = useAppSelector((state) => state.amtpPacket.maintainer);
  const [newDocTitle, setNewDocTitle] = useState<string>(document.documentTitle);
  const [newDocType, setNewDocType] = useState<string>('');
  const [associateEvent, setAssociateEvent] = useState<boolean>(document.relatedEvent ? true : false);
  const [newAssociatedEvent, setNewAssociatedEvent] = useState<string>('');
  const [associateDesignation, setAssociateDesignation] = useState<boolean>(document.relatedDesignation ? true : false);
  const [newAssociatedDesignation, setNewAssociatedDesignation] = useState<string>('');

  const { data: allDocumentTypes } = useGetAllDocumentTypesQuery();
  const { data: allSoldierDesignations } = useGetSoldierDesignationsQuery({
    user_id: maintainer?.id ?? '1234567890',
    current: false,
  });
  const { data: allSoldierEvents } = useGetDa7817sQuery({ user_id: maintainer?.id ?? '1234567890' });
  const [updateSupportingDocument, { isLoading }] = useUpdateSupportingDocumentMutation();

  useEffect(() => {
    if (allDocumentTypes) {
      const currentDocType = allDocumentTypes.find((type) => type.type === document.documentType);
      if (currentDocType) {
        setNewDocType(currentDocType.type);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDocumentTypes]);

  useEffect(() => {
    if (allSoldierDesignations) {
      const currentSoldierDesignation = allSoldierDesignations.find(
        (designation) => designation.designation === document.relatedDesignation,
      );
      if (currentSoldierDesignation) {
        setNewAssociatedDesignation(currentSoldierDesignation.id.toString());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSoldierDesignations]);

  useEffect(() => {
    if (allSoldierEvents) {
      const currentEvent = allSoldierEvents.find((event) => event.id === document.relatedEvent?.id);
      if (currentEvent) {
        setNewAssociatedEvent(currentEvent.id.toString());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSoldierEvents]);

  const handleChangeDocTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewDocTitle(event.target.value);
  };

  const handleChangeDocType = (event: SelectChangeEvent) => {
    setNewDocType(event.target.value as string);
  };

  const handleChangeAssociatedEvent = (event: SelectChangeEvent) => {
    setNewAssociatedEvent(event.target.value as string);
  };

  const handleChangeAssociatedDesignation = (newDesignation: SelectChangeEvent) => {
    setNewAssociatedDesignation(newDesignation.target.value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    const updateData: IUpdateSupportingDocumentOut = {
      document_title: newDocTitle,
      document_type: newDocType,
      related_designation_id: newAssociatedDesignation,
      related_event_id: newAssociatedEvent,
      visible_to_user: true,
      assign_designation: associateDesignation,
      associate_event: associateEvent,
    };
    await updateSupportingDocument({ document_id: document.id, data: updateData });

    setOpen(false);
    refetchSupportingDocuments();
  };

  return (
    <Dialog key={document.id} onClose={() => setOpen(false)} open={open} aria-label="Edit Supporting Document Dialog">
      <DialogTitle>Edit Document</DialogTitle>
      <DialogContent>
        <Grid container sx={{ py: 2 }} spacing={4}>
          <Grid size={{ xs: 6 }}>
            <TextField
              id="Document Title"
              label="Document Title"
              value={newDocTitle}
              onChange={handleChangeDocTitle}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControl required fullWidth aria-label="Document Type Form">
              <InputLabel id="document-type-label">Document Type</InputLabel>
              <Select
                id="document-type"
                labelId="document-type-label"
                label="Document Type"
                value={newDocType}
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
          <Grid container size={{ xs: 12 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 1 }}>
              <Checkbox
                checked={associateEvent}
                aria-label="Associate Event Checkbox"
                onChange={() => setAssociateEvent((prev) => !prev)}
              />
            </Grid>
            <Grid size={{ xs: 11 }}>
              <Typography>Associated Counseling to an event</Typography>
            </Grid>
          </Grid>
          <Grid size={{ xs: 1 }} />
          <Grid size={{ xs: 11 }} sx={{ justifyContent: 'flex-end' }}>
            <FormControl fullWidth aria-label="Event Form" disabled={!associateEvent}>
              <InputLabel id="event-label">Event</InputLabel>
              <Select
                labelId="event-label"
                id="event"
                value={newAssociatedEvent}
                label="Event"
                onChange={handleChangeAssociatedEvent}
                disabled={!associateEvent}
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
                checked={associateDesignation}
                aria-label="Assign Designation Checkbox"
                onChange={() => setAssociateDesignation((prev) => !prev)}
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
                value={newAssociatedDesignation}
                label="Designation"
                onChange={handleChangeAssociatedDesignation}
                disabled={!associateDesignation}
              >
                {allSoldierDesignations?.map((designation) => (
                  <MenuItem key={designation.id.toString()} value={designation.id.toString()}>
                    {designation.designation}: {designation.startDate} - {designation.endDate}
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
        <Button loading={isLoading} onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditSupportingDocumentDialog;
