import React, { useEffect, useRef } from 'react';

import Box from '@mui/material/Box';
import { SxProps, Theme, useTheme } from '@mui/material/styles';

import { CLASSIFICATION_BANNER_HEIGHT, SCROLL_BAR_WIDTH, TOOLBAR_HEIGHT } from '../../constants';
import { useClassificationContext } from './MainLayout';

/**
 * @typedef ScrollableAreaProps
 * @prop { React.ReactNode } children
 * @prop { number } height - Height of scrollable area
 * @prop { number } heightOffset - Offsets the extra height if you want nested scrollable area @see TabSectionLayout for example
 */
export type ScrollableAreaProps = {
  children: React.ReactNode;
  height?: string | number;
  scrollReset?: boolean;
  sx?: SxProps<Theme>;
};

/**
 * Scrollable Area
 *
 * Creates a scrollable area where scroll bar thumb appears on hover and dose not to distort/modify the padding on hover
 *
 * @param { ScrollableAreaProps } props
 */
export const ScrollableArea: React.FC<ScrollableAreaProps> = ({ height, children, scrollReset, sx }) => {
  const hasClassification = useClassificationContext();
  const padding = '40px';
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scroll({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [scrollReset]);

  if (!height) {
    /** height = 100% view height - (toolbar height + classification banner height + padding) */
    height = `calc(100vh - ${hasClassification ? TOOLBAR_HEIGHT + CLASSIFICATION_BANNER_HEIGHT : TOOLBAR_HEIGHT}px - ${padding})`;
  } else if (typeof height !== 'string') {
    height = height + 'px';
  }

  return (
    <Box
      id="scrollable-container"
      data-testid="scrollable-container"
      component="div"
      ref={scrollAreaRef}
      sx={{
        position: 'relative',
        height: height,
        width: `calc(100% + ${SCROLL_BAR_WIDTH + theme.spacing(1)}px)`,
        overflow: 'hidden',
        scrollbarGutter: 'stable',
        '&:hover': {
          overflowY: 'scroll',
        },
      }}
    >
      <Box id="scrollable-area" data-testid="scrollable-area" sx={{ margin: 0, height: '100%', marginRight: 1, ...sx }}>
        {children}
      </Box>
    </Box>
  );
};
