import { vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';

import AmapIcon from '@components/AmapIcon';

// Mock the SVG imports (they resolve to strings when bundled)
vi.mock('../assets/logo/amap_dark.svg', () => ({ default: 'amap_dark.svg' }));
vi.mock('../assets/logo/amap_light.svg', () => ({ default: 'amap_light.svg' }));

const renderWithTheme = (ui: React.ReactElement, mode: 'light' | 'dark') =>
  render(
    <ThemeProvider
      theme={createTheme({
        palette: {
          mode,
          operational_readiness_status: {
            fmc: '#007A00',
            pmcs: '#664300',
            pmcm: '#996500',
            nmcs: '#EC0000',
            nmcm: '#BD0000',
            dade: '#007892',
          },
          avatar: '#1976d2',
          badge: '#ff5722',
          stacked_bars: {
            magenta: '#CE0094',
            blue: '#002D9C',
            cyan2: '#012749',
            teal2: '#1C7877',
            purple: '#6929C4',
          },
          layout: {
            base: '#FFFFFF',
            background5: '#F2F2F2',
            background7: '#EDEDED',
            background8: '#EBEBEB',
            background9: '#E8E8E8',
            background11: '#E3E3E3',
            background12: '#E0E0E0',
            background14: '#DBDBDB',
            background15: '#D9D9D9',
            background16: '#D6D6D6',
          },
          boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
          graph: {
            purple: '#6929C4',
            cyan: '#0072B1',
            teal: '#005D5D',
            pink: '#9F1853',
            green: '#117D31',
            blue: '#002D9C',
            magenta: '#CE0094',
            yellow: '#8C6900',
            teal2: '#1C7877',
            cyan2: '#012749',
            orange: '#8A3800',
            purple2: '#7C58B7',
          },
          classification: {
            unclassified: '',
            cui: '',
            confidential: '',
            secret: '',
            top_secret: '',
            top_secret_sci: '',
          },
        },
      })}
    >
      {ui}
    </ThemeProvider>,
  );

describe('AmapIcon', () => {
  it('renders dark logo when theme mode is dark', () => {
    renderWithTheme(<AmapIcon />, 'dark');
    const img = screen.getByAltText('Amap logo');
    expect(img).toHaveAttribute('src', '/src/assets/logo/amap_dark.svg');
  });

  it('renders light logo when theme mode is light', () => {
    renderWithTheme(<AmapIcon />, 'light');
    const img = screen.getByAltText('Amap logo');
    expect(img).toHaveAttribute('src', '/src/assets/logo/amap_light.svg');
  });
});
