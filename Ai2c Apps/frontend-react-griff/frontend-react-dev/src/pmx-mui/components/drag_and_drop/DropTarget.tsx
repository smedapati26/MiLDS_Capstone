import React, { FC, useContext } from 'react';
import { useDrop } from 'react-dnd';

import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';

import { DragAndDropContext } from './context';
import { DROP_TYPE, DropItem, DropLocationEnum } from './models';

/**
 * @typedef DropTargetProps
 * @prop { DropLocationEnum | string } location - String value that represents where Draggable can be placed
 * @prop { React.ReactNode } [children] - Renderable React elements
 * @prop { number } [minHeight=80] - Minimal height of drop target area
 */
export type DropTargetProps = {
  location: DropLocationEnum | string;
  children?: React.ReactNode;
  minHeight?: number;
};

/**
 * Drop Target Functional Component
 *
 * Area where Draggable Component can drop down into.
 *
 * @param { DropTargetProps } props
 */
export const DropTarget: FC<DropTargetProps> = (props) => {
  const { location, children, minHeight = 80 } = props;

  const theme = useTheme();

  const { moveLocation } = useContext(DragAndDropContext);

  const [{ isOver }, dropRef] = useDrop({
    accept: DROP_TYPE,
    drop: (item: DropItem<typeof children>) => moveLocation(item.id, location),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <Box
      id={`drop-target-${location}`}
      data-testid={`drop-target-${location}`}
      ref={dropRef}
      sx={{
        backgroundColor: isOver ? 'rgba(0,0,0,0.6)' : 'transparent',
        minHeight: minHeight,
        border: '2px dashed',
        borderColor: isOver ? theme.palette.grey?.l40 : theme.palette.grey?.l20,
        borderRadius: '3px',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </Box>
  );
};
