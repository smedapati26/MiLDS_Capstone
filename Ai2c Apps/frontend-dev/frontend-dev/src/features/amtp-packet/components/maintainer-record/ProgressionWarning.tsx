import { Alert, AlertTitle, Typography } from '@mui/material';

import { useAppSelector } from '@store/hooks';

const ProgressionWarning = ({ isReadOnly }: { isReadOnly: boolean }) => {
  const maintainer = useAppSelector((x) => x.amtpPacket.maintainer);

  const formatMaintainerName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length < 3) return 'unknown.maintainer';
    return `${parts[1].toLowerCase()}.${parts[2].toLowerCase()}`;
  };

  return (
    <Alert severity="warning" sx={{ mb: 4 }}>
      <AlertTitle>Doctrine Update</AlertTitle>
      {!isReadOnly && (
        <>
          <Typography>
            This Training Event was logged as a progression event, which is no longer acceptable due to doctrine
            changes. If you make changes to this event, you must take one of the following actions to save this event:
          </Typography>
          <ul>
            <li>
              <Typography>Change this event to an evaluation.</Typography>
            </li>
            <li>
              <Typography>Remove the progression from this event.</Typography>
            </li>
            <li>
              <Typography>
                Remove the progression from this event, and create a new blank Evaluation for this event with
                progression details.
              </Typography>
            </li>
          </ul>
        </>
      )}
      {isReadOnly && (
        <>
          <Typography>
            This Training Event was logged as a progression event. Due to the change in doctrine, Training Events can no
            longer be progression events. No immediate modification is required as long as no changes are made to the
            event. If this event needs modification, contact {maintainer?.name} at{' '}
            {maintainer?.name && `${formatMaintainerName(maintainer.name)}@army.mil`}
          </Typography>
          <br />
          <Typography
            component="a"
            sx={{
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            href="/"
          >
            Contact Support
          </Typography>
        </>
      )}
    </Alert>
  );
};

export default ProgressionWarning;
