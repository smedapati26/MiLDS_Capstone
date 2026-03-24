import React from 'react';

import { Box, styled } from '@mui/material';

const StyledFilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

interface Props {
  children?: React.ReactNode;
}

export const ComponentManagementTableFilters: React.FC<Props> = ({ children }) => {
  return <StyledFilterContainer>{children}</StyledFilterContainer>;
};
