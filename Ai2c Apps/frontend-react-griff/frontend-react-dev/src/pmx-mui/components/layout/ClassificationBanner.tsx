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
  const { palette } = useTheme();
  const [styles, setStyles] = useState<{ contrastText: string; background: string } | null>(null);

  useEffect(() => {
    switch (type) {
      case Classification.UNCLASSIFIED:
        setStyles({
          contrastText: palette.grey.white || '#FFFFFF',
          background: palette.classification.unclassified,
        });
        break;
      case Classification.CUI:
        setStyles({
          contrastText: palette.grey.white || '#FFFFFF',
          background: palette.classification.cui,
        });
        break;
      case Classification.CONFIDENTIAL:
        setStyles({
          contrastText: palette.grey.white || '#FFFFFF',
          background: palette.classification.confidential,
        });
        break;
      case Classification.SECRET:
        setStyles({
          contrastText: palette.grey.white || '#FFFFFF',
          background: palette.classification.secret,
        });
        break;
      case Classification.TOP_SECRET:
        setStyles({
          contrastText: palette.grey.black || '#000000',
          background: palette.classification.top_secret,
        });
        break;
      case Classification.TOP_SECRET_SCI:
        setStyles({
          contrastText: palette.grey.black || '#000000',
          background: palette.classification.top_secret_sci,
        });
        break;

      default:
        setStyles(null);
        break;
    }
  }, [
    type,
    palette.mode,
    palette.grey.white,
    palette.grey.black,
    palette.classification.unclassified,
    palette.classification.cui,
    palette.classification.confidential,
    palette.classification.secret,
    palette.classification.top_secret,
    palette.classification.top_secret_sci,
  ]);

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
        color: styles?.contrastText,
        backgroundColor: styles?.background,
      }}
    >
      {type.toUpperCase()}
    </Box>
  );
};
