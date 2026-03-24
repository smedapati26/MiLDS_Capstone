import React from 'react';

import { Card as MuiCard, useTheme } from '@mui/material';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  const theme = useTheme();

  return (
    <MuiCard
      variant="basic"
      className={className}
      sx={{
        borderRadius: '3px',
        bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
        '&:hover': {
          outline: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.primary.d60 : theme.palette.primary.l60}`,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0px 1px 2px 0px rgba(0, 0, 0, 0.25)'
              : '0px 1px 2px 0px rgba(0, 0, 0, 0.15)',
        },
        '&.selected': {
          outline: `1px solid ${theme.palette.primary.main}`,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0px 1px 2px 0px rgba(0, 0, 0, 0.25)'
              : '0px 1px 2px 0px rgba(0, 0, 0, 0.15)',
        },
        py: 4,
        px: 3,
      }}
    >
      {children}
    </MuiCard>
  );
};
