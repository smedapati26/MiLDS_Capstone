import { BrowserRouter } from 'react-router-dom';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import PmxLaunchButton from '@components/inputs/PmxLaunchButton';

/* PmxLaunchButton Tests */
describe('PmxLaunchButtonTest', () => {
  beforeEach(() =>
    render(
      <BrowserRouter>
        <ThemedTestingComponent>
          <PmxLaunchButton path="/test" />
        </ThemedTestingComponent>
      </BrowserRouter>,
    ),
  );

  it('renders PmxLaunchButton component', () => {
    const component = screen.getByTestId('launch-nav-link');
    expect(component).toBeInTheDocument();
    expect(component.getAttribute('href')).toBe('/test');
  });
});
