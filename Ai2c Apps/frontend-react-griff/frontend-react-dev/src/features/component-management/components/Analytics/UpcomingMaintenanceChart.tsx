import React, { useState } from 'react';
import dayjs from 'dayjs';

import { AddComment as AddCommentIcon } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Container,
  DialogContent,
  IconButton,
  styled,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import { FormDialog } from '@ai2c/pmx-mui';

import { IUpcomingMaintenance } from '@store/griffin_api/events/models';
import { useGetUpcomingMaintenanceQuery } from '@store/griffin_api/events/slices';

export const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.layout.background9 : theme.palette.layout.background5,
}));

interface UpcomingMaintenanceChartProps {
  uic: string;
  serial?: string;
  otherUics?: string[];
}

export const UpcomingMaintenanceChart: React.FC<UpcomingMaintenanceChartProps> = ({ uic, serial, otherUics }) => {
  /** Defines the statuses a MaintenanceEvent can be in */
  enum MaintenanceStatus {
    COMPLETED = 'COMPLETED',
    IN_PROGRESS = 'IN PROGRESS',
    NOT_STARTED = 'NOT STARTED',
  }

  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IUpcomingMaintenance | null>(null);
  const [noteText, setNoteText] = useState('');
  const today = dayjs().format('YYYY-MM-DD');
  const theme = useTheme();

  const {
    data: maintenanceEvents,
    isLoading,
    refetch,
  } = useGetUpcomingMaintenanceQuery({
    uic: uic,
    serial,
    other_uics: otherUics,
    event_end: today,
  });

  const handleOpenNoteDialog = (event: IUpcomingMaintenance) => {
    setSelectedEvent(event);
    setNoteText(event.notes ?? '');
    setOpenNoteDialog(true);
  };

  const handleCloseNoteDialog = () => {
    setOpenNoteDialog(false);
    setSelectedEvent(null);
    setNoteText('');
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_GRIFFIN_API_URL}/events/maintenance/${selectedEvent?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...selectedEvent,
          notes: noteText,
        }),
      });

      if (response.ok) {
        handleCloseNoteDialog();
        refetch();
      }
    } catch (error) {
      console.error('Error updating maintenance note:', error);
    }
  };

  const calculateProgress = (startDate: string, endDate: string): number => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const now = dayjs();

    if (now.isBefore(start)) return 0;
    if (now.isAfter(end)) return 100;

    const totalDuration = end.diff(start);
    const elapsed = now.diff(start);
    const progress = Math.round((elapsed / totalDuration) * 100);

    return Math.min(Math.max(progress, 0), 100); // Ensure between 0 and 100
  };

  const getStatus = (progress: number): MaintenanceStatus => {
    if (progress === 100) return MaintenanceStatus.COMPLETED;
    if (progress > 0) return MaintenanceStatus.IN_PROGRESS;
    return MaintenanceStatus.NOT_STARTED;
  };

  if (isLoading) return <CircularProgress />;
  if (!maintenanceEvents?.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          color: 'text.secondary',
        }}
      >
        <Typography variant="h6">No Upcoming Maintenance</Typography>
      </Box>
    );
  }
  return (
    <Box id="upcoming-maintenance" sx={{ height: '100%', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {maintenanceEvents
          ? [...maintenanceEvents]
              .sort((a, b) => new Date(a.eventStart).valueOf() - new Date(b.eventStart).valueOf())
              .map((event) => {
                const progress = calculateProgress(event.eventStart, event.eventEnd);
                return (
                  <StyledContainer key={event.id}>
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            flex: 1,
                            fontWeight: 500,
                          }}
                        >
                          {event.title}, {dayjs(event.eventStart).format('DD MMM YY')} -{' '}
                          {dayjs(event.eventEnd).format('DD MMM YY')}
                        </Typography>
                        <Tooltip title="Add a note to maintenance event" placement="top">
                          <IconButton size="large" onClick={() => handleOpenNoteDialog(event)} sx={{ mr: -1 }}>
                            <AddCommentIcon
                              sx={{
                                fontSize: 28,
                                transform: 'scaleX(-1)',
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          mb: 4,
                        }}
                      >
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={progress}
                            size={40}
                            sx={{
                              color: 'primary.main',
                              bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'transparent',
                              borderRadius: '50%',
                            }}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption">{`${progress}%`}</Typography>
                          </Box>
                        </Box>
                        <Typography variant="body1">{getStatus(progress)}</Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        {event.notes}
                      </Typography>
                    </Box>
                  </StyledContainer>
                );
              })
          : null}
      </Box>

      <FormDialog
        open={openNoteDialog}
        handleClose={handleCloseNoteDialog}
        handleSubmit={handleSaveNote}
        title={
          <>
            <Typography variant="h6">Maintenance Note</Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
              Add a note to {selectedEvent?.title}
            </Typography>
          </>
        }
        submitLabel="Add"
        size="md"
      >
        <DialogContent
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TextField
            multiline
            rows={8}
            fullWidth
            placeholder="Note"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
              },
            }}
          />
        </DialogContent>
      </FormDialog>
    </Box>
  );
};
