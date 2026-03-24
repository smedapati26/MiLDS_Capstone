import React from 'react';

import { ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';

import { PmxThemeContextProvider, usePmxMuiTheme } from '@ai2c/pmx-mui/theme';

import { LaneGroup, LaneGroupLeft, LaneGroupRight } from '@features/maintenance-schedule/components/Calendar';
import { griffinPalette } from '@theme/theme';

import '@testing-library/jest-dom';

const TestingComponent: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const [theme, colorMode] = usePmxMuiTheme(griffinPalette);

  return (
    <PmxThemeContextProvider theme={theme} colorMode={colorMode}>
      <ThemeProvider theme={theme}>
        <div data-testid="lane-group">{children}</div>
      </ThemeProvider>
    </PmxThemeContextProvider>
  );
};

/* LaneGroup Tests */
describe('LaneGroupTest', () => {
  it('renders LaneGroup', () => {
    render(
      <TestingComponent>
        <LaneGroup />
      </TestingComponent>,
    );
    const component = screen.getByTestId('lane-group');
    expect(component).toBeInTheDocument();

    if (component.firstChild instanceof Element) {
      expect(component.firstChild).toHaveStyle('background-color: rgb(39, 39, 39)');
      expect(component.firstChild).toHaveStyle('border: 1px solid #252525');
    } else {
      console.error('Error: component.firstChild is null');
    }
  });

  it('renders LaneGroupLeft', () => {
    render(
      <TestingComponent>
        <LaneGroupLeft />
      </TestingComponent>,
    );
    const component = screen.getByTestId('lane-group');
    expect(component).toBeInTheDocument();

    if (component.firstChild instanceof Element) {
      expect(component.firstChild).toHaveStyle('background-color: rgb(39, 39, 39)');
      expect(component.firstChild).toHaveStyle('border: 1px solid #252525');
      expect(component.firstChild).toHaveStyle('border-top-right-radius: 0');
      expect(component.firstChild).toHaveStyle('border-bottom-right-radius: 0');
    } else {
      console.error('Error: component.firstChild is null');
    }
  });

  it('renders LaneGroupRight', () => {
    render(
      <TestingComponent>
        <LaneGroupRight />
      </TestingComponent>,
    );
    const component = screen.getByTestId('lane-group');
    expect(component).toBeInTheDocument();

    if (component.firstChild instanceof Element) {
      expect(component.firstChild).toHaveStyle('background-color: rgb(39, 39, 39)');
      expect(component.firstChild).toHaveStyle('border: 1px solid #252525');
      expect(component.firstChild).toHaveStyle('border-top-left-radius: 0');
      expect(component.firstChild).toHaveStyle('border-bottom-left-radius: 0');
    } else {
      console.error('Error: component.firstChild is null');
    }
  });
});
