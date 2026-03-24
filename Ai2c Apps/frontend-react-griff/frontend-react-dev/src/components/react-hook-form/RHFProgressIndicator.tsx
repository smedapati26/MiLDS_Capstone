import React, { useEffect, useState } from 'react';
import { FieldValues, useFormContext, useWatch } from 'react-hook-form';

import { Box, CircularProgress, Stack, Typography } from '@mui/material';

// Custom hook to detect user inactivity after typing
export const useDebouncedIsTyping = (fields: FieldValues, delay = 500) => {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(true);
    const handler = setTimeout(() => {
      setIsTyping(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [fields, delay]);

  return isTyping;
};

/**
 * RHFProgressIndicator Functional Component
 */
export const RHFProgressIndicator: React.FC = () => {
  // RHF methods
  const { control } = useFormContext();
  // Watch all fields for immediate value changes (used by the custom hook)
  const formValues = useWatch({ control });
  const isUserTyping = useDebouncedIsTyping(formValues);

  return isUserTyping ? (
    <Stack direction="row" gap={3} justifySelf="flex-end" alignSelf="flex-end">
      <Box position="relative">
        {/** Hacky & simple way to get css to look like designs */}
        <CircularProgress
          variant="determinate"
          thickness={7}
          value={100}
          sx={{
            position: 'absolute',
            height: '20px !important',
            width: '20px !important',
            '& .MuiCircularProgress-circle': { stroke: '#e8e8e8' },
          }}
        />
        <CircularProgress sx={{ height: '20px !important', width: '20px !important' }} />
      </Box>
      <Typography sx={{ mr: 2 }}>Progress saving...</Typography>
    </Stack>
  ) : null;
};
