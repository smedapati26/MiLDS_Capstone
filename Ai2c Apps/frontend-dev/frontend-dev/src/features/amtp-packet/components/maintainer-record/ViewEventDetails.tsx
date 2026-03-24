import React from 'react';

import { Box, Grid, Typography } from '@mui/material';

import { IDa7817s } from '@store/amap_ai/events';

import ProgressionWarning from './ProgressionWarning';

interface ViewEventDetailsProps {
  event: IDa7817s | undefined;
}

const ViewEventDetails: React.FC<ViewEventDetailsProps> = ({ event }) => {
  return (
    <>
      {event?.eventType === 'Training' && event.mos && event.maintenanceLevel && (
        <ProgressionWarning isReadOnly={false} />
      )}
      <Typography paragraph>Only the creator of this event can edit.</Typography>
      <Grid container spacing={4}>
        {/* Event Type and Date */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Event Type:
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {event?.eventType || 'N/A'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Event Date:
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {event?.date || 'N/A'}
          </Typography>
        </Grid>

        {/* Training Type, Evaluation Type, and Go/No-Go */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {event?.eventType} Type:
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-expect-error */}
            {event?.[`${event?.eventType?.toLocaleLowerCase()}Type`] || 'N/A'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle1" fontWeight={'bold'}>
            Total MX Hours:
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {event?.totalMxHours ?? 0}
          </Typography>
        </Grid>
        {event?.eventType === 'Training' ||
          (event?.eventType === 'Evaluation' && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Event Result:
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {event?.goNogo || 'N/A'}
              </Typography>
            </Grid>
          ))}
        {event?.eventType === 'Evaluation' && event.mos && event.maintenanceLevel && (
          <Grid size={{ xs: 12 }} spacing={4}>
            <Typography variant="subtitle1" fontWeight="bold">
              Progression Event:
            </Typography>
            <Box display="flex" justifyContent={'space-around'} width="100%" sx={{ pl: 8, pt: 2 }}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Event MOS:
                </Typography>
                <Typography variant="body1">{event.mos}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  ML:
                </Typography>
                <Typography variant="body1">{event.maintenanceLevel}</Typography>
              </Grid>
            </Box>
          </Grid>
        )}
        {/* Comments */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Comments:
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {event?.comment || 'N/A'}
          </Typography>
        </Grid>

        {/* Tasks Display */}
        {event?.eventTasks && event?.eventTasks.length > 0 && (
          <>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Associated Tasks to Training:
              </Typography>
            </Grid>
            {event?.eventTasks?.map((task) => (
              <Grid size={{ xs: 12 }} key={task.name}>
                <Box display="flex" justifyContent={'space-around'} width="100%" sx={{ pl: 8 }}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Task:
                    </Typography>
                    <Typography variant="body1">{task.name}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Result:
                    </Typography>
                    <Typography variant="body1">{task.goNogo}</Typography>
                  </Grid>
                </Box>
              </Grid>
            ))}
          </>
        )}
      </Grid>
    </>
  );
};

export default ViewEventDetails;
