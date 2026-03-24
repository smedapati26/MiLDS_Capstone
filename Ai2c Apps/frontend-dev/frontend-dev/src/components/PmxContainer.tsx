import { ReactNode } from 'react';

import { Card, CardContent } from '@mui/material';

const PmxContainer = ({ children }: { children: ReactNode }) => {
  return (
    <Card
      sx={{
        border: '1px solid transparent',
        '&:hover': {
          borderColor: 'transparent',
        },
      }}
    >
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default PmxContainer;
