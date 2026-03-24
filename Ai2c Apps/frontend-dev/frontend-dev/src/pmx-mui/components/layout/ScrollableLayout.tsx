import React from 'react';

import { SxProps, Theme } from '@mui/material';
import Box from '@mui/material/Box';

import { CLASSIFICATION_BANNER_HEIGHT, SCROLL_BAR_WIDTH, TOOLBAR_HEIGHT } from '../../constants';
import { slugify } from '../../helpers';
import { useClassificationContext } from './MainLayout';
import { PageTitle } from './PageTitle';
import { ScrollableArea } from './ScrollableArea';

/**
 * @typedef ScrollableLayoutProps
 * @prop { React.ReactNode } children // Scrollable area
 * @prop { string } [title] Title will off set the scrollable area
 */
export type ScrollableLayoutProps = {
  children: React.ReactNode;
  title?: string;
  sx?: SxProps<Theme>;
};

/**
 * Scroll Section  Component
 *
 * Allows you to create a scrollable page
 * *** Wrapped in HTML Section tag ***
 *
 * @see <ScrollableArea/>
 *
 * @param { ScrollableLayoutProps } props
 */
export const ScrollableLayout: React.FC<ScrollableLayoutProps> = ({ title, children, sx }) => {
  const htmlId = slugify(title ?? 'scrollable');
  const hasClassification = useClassificationContext();
  // height = 100% view height - (toolbar height + padding) or
  // height = 100% view height - (toolbar height + padding + h4 height) or
  // height = 100% view height - (toolbar height + classification banner height + padding  + h4 height)
  const padding = '40px';
  const headingFourLineHeight = '60px'; //theme.typography.h4.lineHeight (40px) + theme.spacing(4) 20px
  const scrollAreaHeight = `calc(100vh - ${hasClassification ? TOOLBAR_HEIGHT + CLASSIFICATION_BANNER_HEIGHT : TOOLBAR_HEIGHT}px - ${headingFourLineHeight} - ${padding})`;

  return (
    <Box id={`${htmlId}-page`} component="section" sx={{ width: '100%', ...sx }}>
      {title ? (
        <>
          <PageTitle data-testid="scrollable-layout-title">{title}</PageTitle>
          <Box data-testid="scrollable-layout-content">
            <ScrollableArea height={scrollAreaHeight}>{children}</ScrollableArea>
          </Box>
        </>
      ) : (
        <ScrollableArea sx={{ width: `calc(100% - ${SCROLL_BAR_WIDTH}px)` }}>{children}</ScrollableArea>
      )}
    </Box>
  );
};
