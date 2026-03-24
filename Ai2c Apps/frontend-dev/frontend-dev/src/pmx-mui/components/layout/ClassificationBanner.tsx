import React, { useEffect, useState } from 'react';

import { Box, useTheme } from '@mui/material';

import { CLASSIFICATION_BANNER_HEIGHT } from '../../constants';
import { Classification } from '../../models/Classification';

/**
 * @typedef ClassificationBannerProps
 * @prop { Classification } type
 */
export interface ClassificationBannerProps {
  type: Classification;
}

/**
 * ClassificationBanner Functional Component
 *
 * @param { ClassificationBannerProps } props
 */
export const ClassificationBanner: React.FC<ClassificationBannerProps> = ({ type }) => {
  const theme = useTheme();
  const [palette, setPalette] = useState<{ contrastText: string; background: string } | null>(null);

  useEffect(() => {
    switch (type) {
      case Classification.UNCLASSIFIED:
        setPalette({
          contrastText: theme.palette.grey.white || '#FFFFFF',
          background: theme.palette.classification?.unclassified,
        });
        break;
      case Classification.CUI:
        setPalette({
          contrastText: theme.palette.grey.white || '#FFFFFF',
          background: theme.palette.classification?.cui,
        });
        break;
      case Classification.CONFIDENTIAL:
        setPalette({
          contrastText: theme.palette.grey.white || '#FFFFFF',
          background: theme.palette.classification?.confidential,
        });
        break;
      case Classification.SECRET:
        setPalette({
          contrastText: theme.palette.grey.white || '#FFFFFF',
          background: theme.palette.classification?.secret,
        });
        break;
      case Classification.TOP_SECRET:
        setPalette({
          contrastText: theme.palette.grey.black || '#000000',
          background: theme.palette.classification?.top_secret,
        });
        break;
      case Classification.TOP_SECRET_SCI:
        setPalette({
          contrastText: theme.palette.grey.black || '#000000',
          background: theme.palette.classification?.top_secret_sci,
        });
        break;

      default:
        setPalette(null);
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, theme.palette.mode]);

  return (
    <Box
      data-testid="classification-banner"
      display={type ? 'flex' : 'none'}
      justifyContent="center"
      alignItems="center"
      sx={{
        paddingTop: '1px',
        height: CLASSIFICATION_BANNER_HEIGHT,
        fontWeight: 500,
        color: palette?.contrastText,
        backgroundColor: palette?.background,
      }}
    >
      {type.toUpperCase()}
    </Box>
  );
};
