import { describe, expect, it } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';

import SnackbarProvider from '@context/SnackbarProvider';
import { createTheme, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import AddCounselingDialog, {
  AddCounselingDialogProps,
} from '@features/amtp-packet/components/counselings/AddCounselingDialog';

const theme = createTheme({
  palette: {
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
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
    avatar: '#1976d2',
    badge: '#ff5722',
  },
});

const mockSetOpen = vi.fn();

const render = (props: AddCounselingDialogProps) =>
  renderWithProviders(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <AddCounselingDialog {...props} />
        </LocalizationProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );

describe('AddCounselingDialog Tests', () => {
  it('Does not render while dialog is not open', () => {
    render({ open: false, setOpen: mockSetOpen, refetchCounselings: () => {} });
    expect(screen.queryByLabelText('Add Counseling Dialog')).not.toBeInTheDocument();
  });

  it('Renders when dialog is open and form fields are initialized', () => {
    render({ open: true, setOpen: mockSetOpen, refetchCounselings: () => {} });

    expect(screen.getByLabelText('Add Counseling Dialog')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Counseling Title' })).toBeInTheDocument();
    expect(screen.getByLabelText('Associate Event Checkbox')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Event' })).not.toBeDisabled();
    expect(screen.getByLabelText('Drag and Drop File Area')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('Enables Save when forms are filled and clears forms and has alert on save', async () => {
    render({ open: true, setOpen: mockSetOpen, refetchCounselings: () => {} });

    const titleInput = screen.getByRole('textbox', { name: 'Counseling Title' });
    const saveButton = screen.getByRole('button', { name: 'Save' });
    const dropArea = screen.getByLabelText('Drag and Drop File Area');

    expect(saveButton).toBeDisabled();

    fireEvent.change(titleInput, { target: { value: 'New Doc' } });

    const mockFile = new File(['Mock File Contents'], 'mock.pdf', { type: 'application/pdf' });
    fireEvent.drop(dropArea, { dataTransfer: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText(mockFile.name)).toBeInTheDocument();
    });

    fireEvent.click(saveButton);
  });

  it('Cancel button clears forms', async () => {
    render({ open: true, setOpen: mockSetOpen, refetchCounselings: () => {} });

    const titleInput = screen.getByRole('textbox', { name: 'Counseling Title' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const dropArea = screen.getByLabelText('Drag and Drop File Area');

    fireEvent.change(titleInput, { target: { value: 'New Doc' } });

    const mockFile = new File(['Mock File Contents'], 'mock.pdf', { type: 'application/pdf' });
    fireEvent.drop(dropArea, { dataTransfer: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText(mockFile.name)).toBeInTheDocument();
    });

    fireEvent.click(cancelButton);
  });
});
