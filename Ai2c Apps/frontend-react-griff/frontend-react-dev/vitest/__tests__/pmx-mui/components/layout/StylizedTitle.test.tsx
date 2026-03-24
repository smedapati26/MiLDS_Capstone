import React from 'react';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';

import { StylizedTitle } from '@ai2c/pmx-mui/components/layout/StylizedTitle';

describe('StylizedTitle Component', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    const theme = createTheme();
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  it('should render the title with correct styles', () => {
    const { getByText } = renderWithTheme(<StylizedTitle title="exampleTitle.AI" />);

    expect(getByText('E')).toBeInTheDocument();
    expect(getByText('XAMPLETITLE.')).toBeInTheDocument();
    expect(getByText('AI')).toBeInTheDocument();
  });

  it('should apply larger font size for titles ending with ".AI"', () => {
    const { getByText } = renderWithTheme(<StylizedTitle title="exampleTitle.AI" />);
    const lastPart = getByText('AI');

    expect(lastPart).toHaveStyle(`font-size: 1.5rem`); // Assuming theme.typography.h5.fontSize is 1.25rem
  });

  it('should apply default font size for titles not ending with ".AI"', () => {
    const { getByText } = renderWithTheme(<StylizedTitle title="exampleTitle.txt" />);
    const lastPart = getByText('XT');

    expect(lastPart).toHaveStyle(`font-size: 20px`);
  });
});
