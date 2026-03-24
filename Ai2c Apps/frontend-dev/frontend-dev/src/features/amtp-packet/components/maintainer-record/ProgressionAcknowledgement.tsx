import { Alert, AlertTitle, Checkbox, FormControlLabel, Typography } from '@mui/material';

const ProgressionAcknowledgement = ({
  isAcknowledged,
  setIsAcknowledged,
}: {
  isAcknowledged: boolean;
  setIsAcknowledged: (value: boolean) => void;
}) => {
  return (
    <Alert severity="error">
      <AlertTitle>ML Change</AlertTitle>
      <Typography>
        By removing Progression from this event, the soldier&apos;s current ML designation will be affected. To maintain
        an accurate record of this soldier&apos;s ML progression you can:
      </Typography>
      <ul>
        <li>
          <Typography>Create a new blank Evaluation event for this same date with the progression details.</Typography>
        </li>
      </ul>
      <FormControlLabel
        sx={{ ml: 0 }}
        control={<Checkbox checked={isAcknowledged} onChange={(e) => setIsAcknowledged(e.target.checked)} />}
        label="Acknowledge*"
      />
    </Alert>
  );
};

export default ProgressionAcknowledgement;
