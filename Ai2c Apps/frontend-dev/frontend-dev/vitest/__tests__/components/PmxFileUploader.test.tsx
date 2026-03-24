import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { fireEvent, render, screen } from '@testing-library/react';

import PmxFileUploader from '@components/PmxFileUploader';

const theme = createTheme({
  palette: {
    error: {
      light: '#ffcccc',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#ffffff',
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
    avatar: '#1976d2',
    badge: '#ff5722',
    
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
  stacked_bars: {
    magenta: '#CE0094',
    blue: '#002D9C',
    cyan2: '#012749',
    teal2: '#1C7877',
    purple: '#6929C4',
  },
  classification: {
    unclassified: '#007A33',
    cui: '#502B85',
    confidential: '#0033A0',
    secret: '#C8102E',
    top_secret: '#FF8C00',
    top_secret_sci: '#FCE83A',
  },
  operational_readiness_status: {
    fmc: '#007A00',
    pmcs: '#664300',
    pmcm: '#996500',
    nmcs: '#EC0000',
    nmcm: '#BD0000',
    dade: '#007892',
  },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MemoryRouter>{ui}</MemoryRouter>
      </LocalizationProvider>
    </ThemeProvider>,
  );
};

describe('PmxFileUploader', () => {
  const mockSetAttachedFile = vi.fn();

  const renderComponent = (attachedFile: File | null = null) =>
    renderWithProviders(<PmxFileUploader attachedFile={attachedFile} setAttachedFile={mockSetAttachedFile} />);

  it('renders drag-and-drop area and browse button', () => {
    renderComponent();

    expect(screen.getByLabelText(/drag and drop file area/i)).toBeInTheDocument();
    expect(screen.getByText(/browse/i)).toBeInTheDocument();
  });

  it('handles file selection via file input', () => {
    renderComponent();

    const file = new File(['dummy content'], 'test-file.txt', { type: 'text/plain' });
    const fileInput = screen.getByTestId('file-input');

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    expect(mockSetAttachedFile).toHaveBeenCalledWith(file);
  });

  it('handles file drop into drag-and-drop area', () => {
    renderComponent();

    const file = new File(['dummy content'], 'dropped-file.txt', { type: 'text/plain' });
    const dropArea = screen.getByLabelText(/drag and drop file area/i);

    fireEvent.drop(dropArea, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(mockSetAttachedFile).toHaveBeenCalledWith(file);
  });

  it('displays uploaded file and allows removal', () => {
    const file = new File(['dummy content'], 'uploaded-file.txt', { type: 'text/plain' });
    renderComponent(file);

    expect(screen.getByText('uploaded-file.txt')).toBeInTheDocument();

    const removeButton = screen.getByLabelText('remove-btn');
    fireEvent.click(removeButton);

    expect(mockSetAttachedFile).toHaveBeenCalledWith(null);
  });
});
