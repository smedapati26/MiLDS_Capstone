import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';

import { PageTitle } from '@ai2c/pmx-mui/components/layout/PageTitle';

describe('PageTitle component', () => {
  it('should render with correct styles', () => {
    const theme = createTheme({
      typography: {
        body3: {
          fontFamily: 'Arial',
          fontSize: '2rem',
          fontWeight: 500,
          lineHeight: 1.5,
        },
        body4: {
          fontFamily: 'Arial',
          fontSize: '2rem',
          fontWeight: 500,
          lineHeight: 1.5,
        },
        h4: {
          fontFamily: 'Arial',
          fontSize: '2rem',
          fontWeight: 700,
          lineHeight: 1.5,
        },
      },
      spacing: (factor: number) => `${0.25 * factor}rem`,
    });

    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <PageTitle>Test Title</PageTitle>
      </ThemeProvider>,
    );

    const titleElement = getByText('Test Title');
    expect(titleElement).toHaveStyle({
      fontFamily: 'Arial',
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.5,
      paddingBottom: '1rem',
    });
  });
});
