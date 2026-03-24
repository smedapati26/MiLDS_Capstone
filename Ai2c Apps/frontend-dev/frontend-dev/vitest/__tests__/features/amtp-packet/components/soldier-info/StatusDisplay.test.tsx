import { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { Theme } from '@emotion/react';
import { createTheme, ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';

import StatusDisplay from '@features/amtp-packet/components/soldier-info/StatusDisplay';

const renderWithTheme = (component: ReactNode, themeOptions = { palette: { mode: 'light', layout: {base: '#FFFFFF'} } }) => {
  const theme = createTheme(themeOptions as Theme);
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('StatusDisplay', () => {
  it('renders correctly with "available" status', () => {
    renderWithTheme(<StatusDisplay status="Available" />);

    const labelElement = screen.getAllByText('Status:');
    const chipElement = screen.getAllByText('Available');
    expect(labelElement).toHaveLength(1);
    expect(chipElement).toHaveLength(1);
  });

  it('renders correctly with "disabled" status', () => {
    renderWithTheme(<StatusDisplay status="Flagged - Limited" />);

    const labelElement = screen.getAllByText('Status:');
    const chipElement = screen.getAllByText('Limited');
    expect(labelElement).toHaveLength(1);
    expect(chipElement).toHaveLength(1);
  });
});
