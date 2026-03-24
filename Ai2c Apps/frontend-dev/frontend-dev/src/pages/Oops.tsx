import { Box, Container, Divider, ThemeProvider, Typography } from '@mui/material';

import { AmapIcon, PmxThemeContextProvider, usePmxMuiTheme } from '@ai2c/pmx-mui';

import { amapPalette } from '@theme/theme';

const Oops: React.FC = () => {
  const [theme, colorMode] = usePmxMuiTheme(amapPalette);

  return (
    <PmxThemeContextProvider theme={theme} colorMode={colorMode}>
      <ThemeProvider theme={theme}>
        <Container
          aria-label="main-container"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            minWidth: '100vw',
          }}
        >
          <Container
            aria-label="inner-container"
            variant="secondary"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '368px',
              height: '210px',
            }}
          >
            <Box sx={{ margin: 4 }} data-testid="amap-icon">
              <AmapIcon width="110px" height="104.2px" />
            </Box>
            <Divider orientation="horizontal" flexItem sx={{ mx: 2, mb: 4 }} />
            <Box>
              <Typography variant="body1">Oops, we made a mistake...</Typography>
            </Box>
          </Container>
        </Container>
      </ThemeProvider>
    </PmxThemeContextProvider>
  );
};

export default Oops;
