/**
 * PmxEllipsisText Component
 *
 * A reusable React component that displays text with ellipsis functionality.
 * Provides the ability to truncate long text and allow users to expand/collapse
 * the full content by clicking. Includes optional tooltip support for better UX.
 *
 * Features:
 * - Automatic text truncation based on character length
 * - Click-to-expand/collapse functionality
 * - Optional tooltip with expand/collapse hints
 * - Responsive hover effects
 * - Material-UI integration
 */

import React, { useState } from 'react';

import { Box, styled, Tooltip, Typography } from '@mui/material';

/**
 * Props interface for PmxEllipsisText component
 */
interface PmxEllipsisTextProps {
  /** The text content to display */
  text: string;
  /** Maximum character length before truncation occurs. Defaults to 100 */
  maxLength?: number;
  /** Whether to show tooltip with expand/collapse hints. Defaults to true */
  showTooltip?: boolean;
}

/**
 * Styled Box component that handles text overflow with ellipsis
 * Provides the foundation for text truncation styling
 */
const EllipsisBox = styled(Box)({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

/**
 * PmxEllipsisText - A text component with smart truncation and expansion capabilities
 *
 * @param text - The text content to display
 * @param maxLength - Maximum character length before truncation (default: 100)
 * @param showTooltip - Whether to show helpful tooltips (default: true)
 */
const PmxEllipsisText: React.FC<PmxEllipsisTextProps> = ({ text, maxLength = 100, showTooltip = true }) => {
  // State to track whether text is currently in truncated mode
  const [isTruncated, setIsTruncated] = useState(true);

  // Determine if text needs truncation based on length comparison
  const shouldTruncate = text.length > maxLength;

  // Calculate the displayed text - either truncated with ellipsis or full text
  const displayedText = shouldTruncate && isTruncated ? `${text.substring(0, maxLength)}...` : text;

  // Only show tooltip if text actually needs truncation
  showTooltip = shouldTruncate ? showTooltip : false;

  /**
   * Toggle function to switch between truncated and expanded text states
   */
  const toggleTruncate = () => {
    setIsTruncated(!isTruncated);
  };

  // Main content element with conditional interactivity
  const content = (
    <EllipsisBox
      component="span"
      // Only make clickable if text needs truncation
      onClick={shouldTruncate ? toggleTruncate : undefined}
      sx={{
        // Show pointer cursor only for truncated text
        cursor: shouldTruncate ? 'pointer' : 'default',
        // Hover effect only applies to interactive (truncated) text
        '&:hover': {
          opacity: shouldTruncate ? 0.8 : 1,
        },
      }}
    >
      <Typography variant="body1" component="span">
        {displayedText}
      </Typography>
    </EllipsisBox>
  );

  // Conditionally wrap content with tooltip based on showTooltip flag
  return showTooltip ? (
    <Tooltip title={isTruncated ? 'Click to expand' : 'Click to collapse'} arrow>
      {content}
    </Tooltip>
  ) : (
    content
  );
};

export default PmxEllipsisText;
