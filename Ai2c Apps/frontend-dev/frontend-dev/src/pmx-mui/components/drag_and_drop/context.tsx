import { createContext } from 'react';

import { DropLocationEnum } from './models';

/**
 * Drag and Drop Context
 */
export const DragAndDropContext = createContext({
  moveLocation: (_id: string | number, _location: DropLocationEnum | string) => {},
});
