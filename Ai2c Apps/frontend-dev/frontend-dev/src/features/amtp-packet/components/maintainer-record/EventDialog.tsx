import React, { useEffect } from 'react';

import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { setEventId, setEventTask, setEventTrainingType, setEventType } from '@features/amtp-packet/slices';
import { IDa7817s } from '@store/amap_ai/events';
import { useLazyGetEventByIdQuery } from '@store/amap_ai/events/slices';
import { useAppDispatch } from '@store/hooks';

import AddEditEventForm from './AddEditEventForm';
import ViewEventDetails from './ViewEventDetails';

interface EventDialogProps {
  open: boolean;
  handleClose: () => void;
  formSubmitted: () => void;
  dialogType: 'view' | 'edit' | 'add' | 'initial_upload';
  title: string;
  eventId: number | undefined;
  actions?: React.ReactNode;
}

const EventDialog = ({ open, handleClose, formSubmitted, dialogType, title, eventId, actions }: EventDialogProps) => {
  const dispatch = useAppDispatch();
  const [trigger, { data: event }] = useLazyGetEventByIdQuery(undefined);

  useEffect(() => {
    if (eventId) trigger({ event_id: eventId });
  }, [eventId, trigger]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        handleClose();
        dispatch(setEventType(null));
        dispatch(setEventTask(null));
        dispatch(setEventId(null));
      }}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {dialogType === 'view' && <ViewEventDetails event={event} />}

        {((dialogType === 'edit' && event) || dialogType === 'add' || dialogType === 'initial_upload') && (
          <AddEditEventForm
            events={[event] as IDa7817s[]}
            handleClose={() => {
              handleClose();
              dispatch(setEventType(null));
              dispatch(setEventTask(null));
              dispatch(setEventTrainingType(null));
            }}
            formSubmitted={() => {
              formSubmitted();
              dispatch(setEventType(null));
              dispatch(setEventTask(null));
              dispatch(setEventTrainingType(null));
            }}
            isInitialUpload={dialogType === 'initial_upload'}
          />
        )}
      </DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
};

export default EventDialog;
