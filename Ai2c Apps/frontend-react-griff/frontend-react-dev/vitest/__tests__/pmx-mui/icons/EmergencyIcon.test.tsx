import React from 'react';

import { configure, render, screen } from '@testing-library/react';

import { EmergencyIcon } from '@ai2c/pmx-mui/icons/index';

configure({ testIdAttribute: 'data-icon' });

/* EmergencyIcon.test Tests */
describe('EmergencyIconTest', () => {
  test('icon is SVG', () => {
    render(<EmergencyIcon />);
    const icon = screen.getByTestId('emergency');
    expect(icon).toBeInTheDocument();
    expect(icon.nodeName).toBe('svg');
  });

  test('icon size equals 50px', () => {
    render(<EmergencyIcon size={50} />);
    const icon = screen.getByTestId('emergency');
    expect(icon).toBeInTheDocument();
    expect(icon.getAttribute('width')).toBe('50');
    expect(icon.getAttribute('height')).toBe('50');
  });

  it.each([
    ['height', 25],
    ['width', 25],
  ])('%p should changes %p styles property', (prop, value) => {
    render(React.cloneElement(<EmergencyIcon />, { prop: value }));
    expect(screen.getByTestId('emergency').getAttribute(prop)).toBe(String(value));
  });
});
