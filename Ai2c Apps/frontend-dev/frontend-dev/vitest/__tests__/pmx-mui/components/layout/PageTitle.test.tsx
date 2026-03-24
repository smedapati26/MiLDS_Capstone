import { createTheme, ThemeProvider } from '@mui/material/styles';
import { PageTitle } from '@pmx-mui-components/layout/PageTitle';
import { render } from '@testing-library/react';

describe('PageTitle component', () => {
  it('should render with correct styles', () => {
    const theme = createTheme({
      typography: {
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
