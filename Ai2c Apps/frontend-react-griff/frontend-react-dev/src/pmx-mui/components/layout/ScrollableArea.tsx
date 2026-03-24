import React, { useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import { SxProps, Theme, useTheme } from '@mui/material/styles';

import { CLASSIFICATION_BANNER_HEIGHT, SCROLL_BAR_WIDTH } from '../../constants';
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
  const theme = useTheme();

  // Dynamically get top offset to add additional height for scroll area size.
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [scrollAreaHeight, setScrollAreaHeight] = useState('100%');

  // Dynamically set the scroll height offset
  useEffect(() => {
    if (scrollAreaRef.current) {
      if (!height) {
        const topOffset = scrollAreaRef.current.getBoundingClientRect().top;
        const additionalTopOffset = hasClassification ? topOffset + CLASSIFICATION_BANNER_HEIGHT : topOffset;
        setScrollAreaHeight(`calc(100vh - ${additionalTopOffset}px)`);
      } else if (typeof height !== 'string') {
        setScrollAreaHeight(height + 'px');
      } else {
        setScrollAreaHeight(height);
      }
    }
  }, [hasClassification, height]);

  // Reset Scroll to top on when true
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scroll({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [scrollReset]);

  return (
    <Box
      id="scrollable-container"
      data-testid="scrollable-container"
      component="div"
      ref={scrollAreaRef}
      sx={{
        position: 'relative',
        height: scrollAreaHeight,
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
