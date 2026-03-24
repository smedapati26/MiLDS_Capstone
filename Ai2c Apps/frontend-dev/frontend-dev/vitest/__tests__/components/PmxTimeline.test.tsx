import { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { Theme } from '@emotion/react';
import { createTheme, ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';

import PmxTimeline from '@components/PmxTimeline';

const renderWithTheme = (component: ReactNode, themeOptions = { palette: { mode: 'light' } }) => {
  const theme = createTheme(themeOptions as Theme);
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const items = [
  { label: 'Step 1', timeLabel: 'Testing-1', isActive: true },
  { label: 'Step 2', timeLabel: 'Testing-2', isActive: false },
  { label: 'Step 3', timeLabel: 'Testing-3', isActive: false, disabled: true },
];

describe('PmxTimeline', () => {
  it('renders the timeline correctly', () => {
    renderWithTheme(<PmxTimeline items={items} />);

    const step1 = screen.getByText('Step 1');
    const step2 = screen.getByText('Step 2');
    const step3 = screen.getByText('Step 3');

    expect(step1).toBeInTheDocument();
    expect(step2).toBeInTheDocument();
    expect(step3).toBeInTheDocument();
  });
});
