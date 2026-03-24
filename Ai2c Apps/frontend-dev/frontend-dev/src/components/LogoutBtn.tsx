import { useState } from 'react';

import { Button } from '@mui/material';

const LogoutBtn = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    setIsLoading(true);
    try {
      // Redirect to the '/logout' route
      window.location.href = '/logout';
      window.location.reload();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      size="small"
      variant="contained"
      color="primary"
      sx={{ width: '100%', mt: 1 }}
      disabled={isLoading}
      aria-label="Logout"
    >
      {isLoading ? 'Logging out...' : 'Logout'}
    </Button>
  );
};

export default LogoutBtn;
