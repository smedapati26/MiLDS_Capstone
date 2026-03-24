import React from 'react';
import { useDrag } from 'react-dnd';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { DROP_TYPE } from './models';

/* Box styling */
const DraggableBoxStyled = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.palette.boxShadow,
  height: '100%',
  padding: theme.spacing(4),
  borderRadius: '3px',
}));

/**
 * @typedef DraggableProps
 * @prop { string } id - Unique identifier
 * @prop { any } [item] - Object data
 * @prop { React.ReactNode } [children] - Renderable React elements
 * @prop { number } [height] - {id: string, title: string, description: string }
 */
export type DraggableProps = {
  id: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item?: any;
  children?: React.ReactNode;
  height?: number;
};

/**
 * Draggable Box
 *
 * Component wrapper to allow children to be a draggable content
 *
 * @param { DraggableProps } props
 */
export const Draggable: React.FC<DraggableProps> = (props) => {
  const { id, item, children, height } = props;

  const [{ isDragging }, dragRef] = useDrag({
    type: DROP_TYPE,
    item: {
      type: DROP_TYPE,
      ...item,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <DraggableBoxStyled
      id={`draggable-item-${id}`}
      data-testid={`draggable-item-${id}`}
      className="grabbable"
      ref={dragRef}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        height: height ? height : null,
      }}
    >
      {children}
    </DraggableBoxStyled>
  );
};
