import React from 'react';

import Menu from '@mui/material/Menu';
import { SxProps, Theme, useTheme } from '@mui/material/styles';

/**
 * @typedef ContextMenuPosition
 * @prop { number } mouseX
 * @prop { number } mouseY
 */
export type ContextMenuPosition = {
  mouseX: number;
  mouseY: number;
};

export type ContextMenuType = 'primary' | 'secondary';

/**
 * @typedef ContextMenuProps
 * @prop { ContextMenuPosition | null } contextMenuPosition - Mouse X and Y coordinate
 * @prop { function } handleClose - Callback used to handle close events
 * @prop { React.ReactNode } [children] - Renderable React elements
 * @prop { ContextMenuType } [variant="primary"] - Determines context menus background color
 */
export type ContextMenuProps = {
  contextMenuPosition: ContextMenuPosition | null;
  handleClose: () => void;
  children?: React.ReactNode;
  variant?: ContextMenuType;
  sx?: SxProps<Theme>;
};

/**
 * Context Menu
 *
 * MUI Menu wrapper function used to apply custom styling
 *
 * @param { ContextMenuProps } props
 */
export const ContextMenu: React.FC<ContextMenuProps> = (props) => {
  const { contextMenuPosition, handleClose, children, variant = 'primary', sx } = props;
  const theme = useTheme();

  return (
    <Menu
      data-testid="context-menu"
      open={contextMenuPosition !== null}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenuPosition !== null
          ? {
              top: contextMenuPosition.mouseY,
              left: contextMenuPosition.mouseX,
            }
          : undefined
      }
      sx={{
        '& .MuiBackdrop': {
          backgroundColor: 'transparent',
        },
        '& .MuiMenu-paper': {
          backgroundColor:
            variant === 'secondary'
              ? theme.palette.mode === 'dark'
                ? theme.palette.layout?.background16
                : theme.palette.layout?.background5
              : theme.palette.layout?.background11,
        },
        ...sx,
      }}
    >
      {children}
    </Menu>
  );
};
