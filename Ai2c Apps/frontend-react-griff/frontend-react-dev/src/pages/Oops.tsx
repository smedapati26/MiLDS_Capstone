import { Box, Container, Divider, ThemeProvider, Typography } from '@mui/material';

import { GriffinFullBodyIcon, PmxThemeContextProvider, usePmxMuiTheme } from '@ai2c/pmx-mui';

import { griffinPalette } from '@theme/theme';

const Oops: React.FC = () => {
  const [theme, colorMode] = usePmxMuiTheme(griffinPalette);

  return (
    <PmxThemeContextProvider theme={theme} colorMode={colorMode}>
      <ThemeProvider theme={theme}>
        <Container
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            minWidth: '100vw',
          }}
        >
          <Container
            variant="secondary"
            // component='section'
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '368px',
              height: '210px',
            }}
          >
            <Box sx={{ margin: 4 }}>
              <GriffinFullBodyIcon width="110px" height="104.2px" />
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
