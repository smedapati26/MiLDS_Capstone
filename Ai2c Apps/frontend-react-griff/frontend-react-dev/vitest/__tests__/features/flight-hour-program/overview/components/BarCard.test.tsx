import { render, screen } from '@testing-library/react';

import BarCard from '@features/flight-hour-program/overview/components/BarCard';

describe('BarCard', () => {
  it('renders children correctly', () => {
    render(
      <BarCard data-testid="bar-card">
        <div data-testid="child">Hello World</div>
      </BarCard>,
    );
    expect(screen.getByTestId('child')).toHaveTextContent('Hello World');
  });

  it('applies width 100% when isCarousel is false', () => {
    render(
      <BarCard data-testid="bar-card" isCarousel={false}>
        <div>Test</div>
      </BarCard>,
    );
    const card = screen.getByTestId('bar-card');
    expect(card).toHaveStyle({ width: '100%' });
  });

  it('does not apply width 100% when isCarousel is true (default)', () => {
    render(
      <BarCard data-testid="bar-card">
        <div>Test</div>
      </BarCard>,
    );
    const card = screen.getByTestId('bar-card');
    expect(card).not.toHaveStyle({ width: '100%' });
  });
});
