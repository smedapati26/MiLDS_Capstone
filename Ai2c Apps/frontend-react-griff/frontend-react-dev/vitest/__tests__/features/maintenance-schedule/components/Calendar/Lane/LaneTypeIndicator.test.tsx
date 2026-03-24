import * as React from 'react';

import { ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';

import { PmxThemeContextProvider, usePmxMuiTheme } from '@ai2c/pmx-mui/theme';

import LaneTypeIndicator from '@features/maintenance-schedule/components/Calendar/Lane/LaneTypeIndicator';
import { griffinPalette } from '@theme/theme';

import '@testing-library/jest-dom';

const TestingComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, colorMode] = usePmxMuiTheme(griffinPalette);

  return (
    <PmxThemeContextProvider theme={theme} colorMode={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </PmxThemeContextProvider>
  );
};

/* LaneTypeIndicator Tests */
describe('LaneTypeIndicatorTest', () => {
  it('renders LaneTypeIndicator border with correct styles', () => {
    render(
      <TestingComponent>
        <LaneTypeIndicator isInternal={true} isContractor={false} />
      </TestingComponent>,
    );
    const component = screen.getByTestId('lane-type-indicator');
    expect(component).toBeInTheDocument();
    expect(component).toHaveStyle('width: 6px');
    expect(component).toHaveStyle('background-size: 5px 100%,100% 5px,5px 100%,100% 5px');
    expect(component).toHaveStyle('background-color: rgba(0, 0, 0, 0)');
    expect(component).toHaveStyle('border-width: 1.5px');
  });

  it('renders LaneTypeIndicator with styles for non contractors', () => {
    render(
      <TestingComponent>
        <LaneTypeIndicator isInternal={true} isContractor={false} />
      </TestingComponent>,
    );
    const component = screen.getByTestId('lane-type-indicator');
    expect(component).toBeInTheDocument();
    expect(component).toHaveStyle(`border-color: #6FDC8C`);
  });

  it('renders LaneTypeIndicator with styles for contractors', () => {
    render(
      <TestingComponent>
        <LaneTypeIndicator isInternal={true} isContractor={true} />
      </TestingComponent>,
    );
    const component = screen.getByTestId('lane-type-indicator');
    expect(component).toBeInTheDocument();
    expect(component).toHaveStyle(`border-color: #94caff`);
  });

  it('renders outside LaneTypeIndicator', () => {
    render(
      <TestingComponent>
        <LaneTypeIndicator isInternal={false} isContractor={false} />
      </TestingComponent>,
    );
    const component = screen.getByTestId('lane-type-indicator');
    expect(component).toBeInTheDocument();
    expect(component).toHaveStyle(`border-color: #6fdc8c`);
  });
});
