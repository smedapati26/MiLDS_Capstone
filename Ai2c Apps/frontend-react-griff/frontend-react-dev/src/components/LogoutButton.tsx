import React, { useState } from 'react';

import { Button } from '@mui/material';

const LogoutButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    setIsLoading(true);
    try {
      // Redirect to the '/logout' route
      window.location.replace(`${window.location.origin}/logout`);
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
      sx={{ width: '100%' }}
      disabled={isLoading}
      aria-label="Logout"
    >
      {isLoading ? 'Logging out...' : 'Logout'}
    </Button>
  );
};

export default LogoutButton;
