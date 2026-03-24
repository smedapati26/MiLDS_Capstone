import { Box, styled } from '@mui/material';

/**
 * A styled component for shared style for LaneGroupLeft & LaneGroupRight.
 */
export const LaneGroup = styled(Box)(({ theme }) => {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    backgroundColor: theme.palette.layout?.background5,
    ...theme.applyStyles('dark', { backgroundColor: theme.palette.layout?.background9 }),
    border: `1px solid ${theme.palette.layout?.background8}`,
    ...theme.applyStyles('dark', { borderColor: theme.palette.layout?.background12 }),
    borderRadius: '3px',
    padding: theme.spacing(3),
    paddingLeft: theme.spacing(0),
    paddingRight: theme.spacing(0),
    marginBottom: theme.spacing(3),
  };
});

/**
 * A styled component that extends the `LaneGroup` component.
 * This component represents the left side of a lane group with specific styling.
 *
 * - Removes the right border.
 * - Sets the top-right and bottom-right border radius to 0.
 * - Sets the width to 150px.
 */
export const LaneGroupLeft = styled(LaneGroup)(() => {
  return {
    borderRight: 'none',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    width: '150px',
  };
});

/**
 * A styled component that extends the `LaneGroup` component.
 * This component represents the right side of a lane group with specific styling.
 *
 * - Removes the left border.
 * - Sets the top-left and bottom-left border radius to 0.
 */
export const LaneGroupRight = styled(LaneGroup)(() => {
  return {
    borderLeft: 'none',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  };
});
