import { NavLink, useRouteError } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import { Button, Typography } from '@mui/material';
import Box from '@mui/material/Box';

export type ErrorBoundaryResponse = {
  status: number;
  statusText: string;
  data: {
    message: string;
  };
};

/**
 * Error Boundary
 */
export const ErrorBoundary: React.FC = () => {
  const error = useRouteError() as ErrorBoundaryResponse;

  console.log(error);

  // the response json is automatically parsed to
  // `error.data`, you also have access to the status
  return (
    <Box
      data-testid="not-found-page"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      <Typography variant="h1">{error.status}</Typography>
      <Typography variant="h5" gutterBottom>
        Sorry, we could not find the page you are looking for.
      </Typography>
      <Typography variant="body2" gutterBottom>
        {error.statusText}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {error.data.message}
      </Typography>
      <Button startIcon={<HomeIcon sx={{ paddingBottom: '5px' }} />} LinkComponent={NavLink} to="/" sx={{ mt: 2 }}>
        Return Home
      </Button>
    </Box>
  );
};
