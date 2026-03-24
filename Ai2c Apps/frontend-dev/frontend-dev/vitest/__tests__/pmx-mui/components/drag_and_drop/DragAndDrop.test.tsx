/* eslint-disable simple-import-sort/imports */
import { useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd/dist/core/DndProvider';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { fireEvent, render, screen } from '@testing-library/react';

import { DragAndDropContext } from '@pmx-mui-components/drag_and_drop/context';
import { Draggable } from '@pmx-mui-components/drag_and_drop/Draggable';
import { DropTarget } from '@pmx-mui-components/drag_and_drop/DropTarget';
import { DropItem, DropLocationEnum } from '@pmx-mui-components/drag_and_drop/models';

import '@testing-library/jest-dom';

const boxHeight = 50;

/* Testing Component */
function TestingComponent() {
  const [draggableItems, setDraggableItems] = useState<DropItem<string>[]>([
    {
      id: 'spot-one',
      location: DropLocationEnum.TOP,
      item: 'One',
    },
    {
      id: 'spot-two',
      location: DropLocationEnum.BOTTOM,
      item: 'Two',
    },
  ]);

  const moveLocation = (id: string | number, location: DropLocationEnum | string) => {
    const item = draggableItems.filter((item) => item.id === id)[0];
    item.location = location;
    setDraggableItems([...draggableItems.filter((item) => item.id !== id), item]);
  };

  const renderDraggableItemsByLocation = (location: DropLocationEnum) => {
    return draggableItems
      .filter((item) => item.location === location)
      .map((item) => (
        <Draggable key={item.id} id={item.id} item={item} height={boxHeight}>
          {item.item}
        </Draggable>
      ));
  };

  return (
    <Box data-testid="test-component" component="div">
      <DndProvider backend={HTML5Backend}>
        <DragAndDropContext.Provider value={{ moveLocation }}>
          <Box sx={{ flexGrow: 1, mt: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <DropTarget location={DropLocationEnum.TOP} minHeight={boxHeight}>
                  {renderDraggableItemsByLocation(DropLocationEnum.TOP)}
                </DropTarget>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <DropTarget location={DropLocationEnum.BOTTOM} minHeight={boxHeight}>
                  {renderDraggableItemsByLocation(DropLocationEnum.BOTTOM)}
                </DropTarget>
              </Grid>
            </Grid>
          </Box>
        </DragAndDropContext.Provider>
      </DndProvider>
    </Box>
  );
}

/* DragAndDrop Tests */
describe('DragAndDropTest', () => {
  beforeEach(() => render(<TestingComponent />));

  it('renders drop targets and draggable items', () => {
    const dropTargeTop = screen.getByTestId('drop-target-top');
    const dropTargetBottom = screen.getByTestId('drop-target-bottom');
    expect(dropTargeTop).toBeVisible();
    expect(dropTargetBottom).toBeVisible();

    const draggableOne = screen.getByTestId('draggable-item-spot-one');
    const draggableTwo = screen.getByTestId('draggable-item-spot-two');
    expect(draggableOne).toBeVisible();
    expect(draggableTwo).toBeVisible();

    expect(dropTargeTop.children).toHaveLength(1);
    expect(dropTargetBottom.children).toHaveLength(1);
  });

  it('has ability to drag items from one drop target to another', async () => {
    const dropTargeTop = screen.getByTestId('drop-target-top');
    const dropTargetBottom = screen.getByTestId('drop-target-bottom');
    const draggable = screen.getByTestId('draggable-item-spot-one');

    expect(dropTargeTop.children).toHaveLength(1);
    expect(dropTargetBottom.children).toHaveLength(1);

    await fireEvent.dragStart(draggable);
    await fireEvent.dragEnter(dropTargetBottom);
    await fireEvent.dragOver(dropTargetBottom);
    await fireEvent.drop(dropTargetBottom);

    expect(dropTargeTop.children).toHaveLength(0);
    expect(dropTargetBottom.children).toHaveLength(2);
  });
});
