import { render } from '@testing-library/react';

import { PaperComponent } from '@ai2c/pmx-mui/components/DraggableDialog';

describe('PaperComponent', () => {
  it('should render Draggable component', () => {
    const { container } = render(<PaperComponent />);
    const draggable = container.querySelector('.react-draggable');
    expect(draggable).toBeInTheDocument();
  });

  it('should pass props to Paper component', () => {
    const { getByTestId } = render(<PaperComponent data-testid="paper" />);
    const paper = getByTestId('paper');
    expect(paper).toBeInTheDocument();
  });
});
