import React from 'react';

import { Avatar, Card, Stack, Typography, useTheme } from '@mui/material';

interface InsightCardProps {
  message: string;
  title: string;
  insightNumber: number;
  'data-testid'?: string;
}

const NumberIcon: React.FC<{ number: number }> = ({ number }: { number: number }): JSX.Element => {
  const theme = useTheme();

  return (
    <Avatar
      sx={{
        width: 20,
        height: 20,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.background.default,
        fontWeight: 'bold',
        fontSize: '14px',
      }}
    >
      {number}
    </Avatar>
  );
};

/**
 * Card that has a blue number, title, and insight
 * @param {InsightCardProps} props
 * @param {string} props.message - insight to display
 * @param {string} props.title - title of insight
 * @param {number} props.insightNumber - number icon of the insight
 *
 * @return JSX Element
 */

const InsightCard: React.FC<InsightCardProps & React.HTMLProps<HTMLDivElement>> = ({
  message,
  title,
  insightNumber,
  ...props
}: InsightCardProps) => {
  return (
    <Card sx={{ mb: 3, p: 4, height: '100%' }} {...props}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={4}>
          <NumberIcon number={insightNumber} />
          <Typography variant="body2">{title}</Typography>
        </Stack>
        <Typography variant="body1">{message}</Typography>
      </Stack>
    </Card>
  );
};

export default InsightCard;
