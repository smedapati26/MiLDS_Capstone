import React from 'react';

import { ClockLoaderIcon } from '@icons/index';
import { configure, render, screen } from '@testing-library/react';

configure({ testIdAttribute: 'data-icon' });

/* ClockLoaderIcon.test Tests */
describe('ClockLoaderIconTest', () => {
  test('icon is SVG', () => {
    render(<ClockLoaderIcon />);
    const icon = screen.getByTestId('clock-loader');
    expect(icon).toBeInTheDocument();
    expect(icon.nodeName).toBe('svg');
  });

  test('icon size equals 50px', () => {
    render(<ClockLoaderIcon size={50} />);
    const icon = screen.getByTestId('clock-loader');
    expect(icon).toBeInTheDocument();
    expect(icon.getAttribute('width')).toBe('50');
    expect(icon.getAttribute('height')).toBe('50');
  });

  it.each([
    ['height', 25],
    ['width', 25],
  ])('%p should changes %p styles property', (prop, value) => {
    render(React.cloneElement(<ClockLoaderIcon />, { prop: value }));
    expect(screen.getByTestId('clock-loader').getAttribute(prop)).toBe(String(value));
  });
});
