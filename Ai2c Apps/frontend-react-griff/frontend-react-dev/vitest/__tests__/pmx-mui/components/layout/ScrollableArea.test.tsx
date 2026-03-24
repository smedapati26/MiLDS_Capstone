import { render, screen } from '@testing-library/react';

import { ScrollableArea } from '@ai2c/pmx-mui/components/layout';

import '@testing-library/jest-dom';

/* Scrollable Area Tests */
describe('ScrollableAreaTest', () => {
  beforeEach(() => (window.HTMLElement.prototype.scroll = function () {}));

  beforeEach(() =>
    render(
      <ScrollableArea>
        <div>TESTING</div>
      </ScrollableArea>,
    ),
  );

  it('renders scrollable area', () => {
    const container = screen.getByTestId('scrollable-container');
    expect(container).toBeInTheDocument();

    const area = screen.getByTestId('scrollable-area');
    expect(area).toBeInTheDocument();
    expect(area).toHaveTextContent('TESTING');
  });
});
