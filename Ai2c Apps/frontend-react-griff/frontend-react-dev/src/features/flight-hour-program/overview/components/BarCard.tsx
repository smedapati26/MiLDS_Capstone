import React from 'react';

import { Card, Stack } from '@mui/material';

interface Props {
  children: React.ReactNode;
  isCarousel?: boolean;
  'data-testid'?: string;
}

/**
 * A card to have all formatting or the bar cards in one place
 * @param {Props} props object
 * @param {React.ReactNode} props.children node elements to put inside of the car
 * @param {boolean} props.isCarousel to tell component it's part of a carousel, so set the width to 100%
 * @return ReactNode element
 */

const BarCard: React.FC<Props> = ({ children, isCarousel = true, 'data-testid': dataTestId }: Props) => {
  return (
    <Card sx={{ p: '20px 16px', height: '100%', ...(!isCarousel && { width: '100%' }) }} data-testid={dataTestId}>
      <Stack direction="column" spacing={3}>
        {children}
      </Stack>
    </Card>
  );
};

export default BarCard;
