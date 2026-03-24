import { Button, CircularProgress, Grid } from '@mui/material';

type FormActionsProps = {
  handleClose: () => void;
  isLoading: boolean;
  isUpdating: boolean;
  canSubmit: boolean;
};

const FormActions = ({ handleClose, isLoading, isUpdating, canSubmit }: FormActionsProps) => {
  return (
    <Grid container justifyContent="flex-end" spacing={2} mt={4}>
      <Grid>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
      </Grid>
      <Grid>
        <Button aria-label="Save Event" type="submit" variant="contained" color="primary" disabled={!canSubmit}>
          {!isLoading && !isUpdating ? (
            'Save Event'
          ) : (
            <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
          )}
        </Button>
      </Grid>
    </Grid>
  );
};

export default FormActions;
