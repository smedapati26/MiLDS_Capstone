import React from 'react';

import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';

type ItemType = {
  label: string;
  icon?: React.ReactNode;
  timeLabel: string;
  isActive?: boolean;
  disabled?: boolean;
};

interface PmxTimelineProps {
  items: ItemType[];
}

/**
 * PmxTimeline component renders a horizontal timeline with optional icons below each item.
 *
 * @component
 * @param {PmxTimelineProps} props - The properties interface.
 * @param {ItemType[]} props.items - Array of items with labels, optional icons, and optional disabled state
 * @returns {ReactNode} The rendered timeline component.
 */

const PmxTimeline = ({ items }: PmxTimelineProps) => {
  const theme = useTheme();

  const getColor = (item: ItemType) => {
    if (item.disabled) return theme.palette.grey.main;
    return theme.palette.mode === 'dark' ? theme.palette.grey.white : theme.palette.text.primary;
  };

  return (
    <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${item.timeLabel}`}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              sx={{
                border: `${item?.isActive ? 4 : 1}px solid #338FEB`,
                padding: '8px 12px',
                borderRadius: '8px',
                width: '133px',
                ...(item.disabled && {
                  backgroundColor: 'none',
                }),
                ...(!item.disabled && {
                  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey.d60 : '#CDCDCD',
                }),
                ...(item.disabled && { color: '#a0a0a0' }),
              }}
            >
              <Typography
                variant="body2"
                color={
                  !item.disabled && theme.palette.mode === 'dark' ? theme.palette.grey.white : theme.palette.grey.main
                }
              >
                {item.label}
              </Typography>
            </Box>
            {(item.icon || item.timeLabel) && (
              <Box mt={1} display="flex">
                {item.icon}
                {item.timeLabel && (
                  <Typography variant="body3" ml={1} mt={1} color={getColor(item)}>
                    {item.timeLabel}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          {index < items.length - 1 && (
            <Box sx={{ width: '10%', position: 'relative' }}>
              <Divider
                orientation="horizontal"
                sx={{ width: '100%', position: 'absolute', top: '30%', borderColor: theme.palette.grey.main }}
              />
            </Box>
          )}
        </React.Fragment>
      ))}
    </Stack>
  );
};

export default PmxTimeline;
