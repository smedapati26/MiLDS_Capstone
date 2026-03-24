import { describe, expect, it } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';
import { mockSupportingDocumentTypes } from 'vitest/mocks/handlers/amtp-packet/supporting-documents/mock_data';

import SnackbarProvider from '@context/SnackbarProvider';
import { createTheme, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import AddSupportingDocumentDialog, {
  AddSupportDocumentDialogProps,
} from '@features/amtp-packet/components/supporting-documents/AddSupporingDocumentDialog';

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

const render = ({ ...props }: AddSupportDocumentDialogProps) => {
  return renderWithProviders(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <AddSupportingDocumentDialog {...props} />
        </LocalizationProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );
};

describe('AddSupportingDocumentDialog Tests', () => {
  it('Does not render while dialog is not open', () => {
    render({ open: false, setOpen: mockSetOpen, refetchSupportingDocuments: () => {} });

    const divElements = screen.queryByLabelText('Add Supporting Document Dialog');
    expect(divElements).not.toBeInTheDocument();
  });

  it('Renders when dialog is open and form fields are initialized', async () => {
    render({ open: true, setOpen: mockSetOpen, refetchSupportingDocuments: () => {} });

    const divElements = screen.queryByLabelText('Add Supporting Document Dialog');
    const documentTitleForm = screen.getByRole('textbox', { name: 'Document Title' });
    const documentTypeForm = screen.getByRole('combobox', { name: 'Document Type' });
    const associateEventCheckbox = screen.getByLabelText('Associate Event Checkbox');
    const associatedEventForm = screen.getByRole('combobox', { name: 'Event' });
    const assignDesignationCheckbox = screen.getByLabelText('Assign Designation Checkbox');
    const assignDesignationForm = screen.getByRole('combobox', { name: 'Designation' });
    const dragAndDropFileArea = screen.getByLabelText('Drag and Drop File Area');
    const saveButton = screen.getByRole('button', { name: 'Save Button' });

    expect(divElements).toBeInTheDocument();
    expect(documentTitleForm).toBeInTheDocument();
    expect(documentTypeForm).toBeInTheDocument();
    expect(associateEventCheckbox).toBeInTheDocument();
    expect(associatedEventForm).toBeInTheDocument();
    expect(associatedEventForm).not.toBeDisabled();
    expect(assignDesignationCheckbox).toBeInTheDocument();
    expect(assignDesignationForm).toBeInTheDocument();
    expect(assignDesignationForm).not.toBeDisabled();
    expect(dragAndDropFileArea).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it('Enables Save when forms are filled and clears forms and has alert on save', async () => {
    await waitFor(() => render({ open: true, setOpen: mockSetOpen, refetchSupportingDocuments: () => {} }));

    const documentTitleForm = screen.getByRole('textbox', { name: 'Document Title' });
    const documentTypeForm = screen.getByRole('combobox', { name: 'Document Type' });
    const documentDateForm = screen.getByRole('textbox', { name: 'Document Date' });
    const dragAndDropFileArea = screen.getByLabelText('Drag and Drop File Area');
    const saveButton = screen.getByRole('button', { name: 'Save Button' });

    expect(saveButton).toBeDisabled();

    fireEvent.change(documentTitleForm, { target: { value: 'New Doc' } });

    fireEvent.mouseDown(documentTypeForm);

    await waitFor(() => {
      const docTypeOption = screen.getByText(mockSupportingDocumentTypes[0].type);

      expect(docTypeOption).toBeInTheDocument();

      fireEvent.click(docTypeOption);
    });

    fireEvent.change(documentDateForm, { target: { value: '01/01/2025' } });

    const mockFile = new File(['Mock File Contents'], 'mock.pdf', { type: 'application/pdf' });
    const mockFileTransfer = {
      dataTransfer: {
        files: [mockFile],
      },
      items: [
        {
          kind: 'file',
          type: mockFile.type,
          getAsFile: () => mockFile,
        },
      ],
      types: ['Files'],
    };

    await waitFor(() => fireEvent.drop(dragAndDropFileArea, mockFileTransfer));

    await waitFor(() => {
      const documentTitleDisplay = screen.getByText(mockFile.name);
      expect(documentTitleDisplay).toBeInTheDocument();
    });

    expect(saveButton).not.toBeDisabled();

    fireEvent.click(saveButton);

    await waitFor(() => {
      const successAlert = screen.getByText('Document added');
      expect(successAlert).toBeInTheDocument();
      expect(documentTitleForm).toHaveValue('');
      expect(documentDateForm).toHaveValue('');
      expect(saveButton).toBeDisabled();
    });
  });

  it('Cancel button and clears forms', async () => {
    await waitFor(() => render({ open: true, setOpen: mockSetOpen, refetchSupportingDocuments: () => {} }));

    const documentTitleForm = screen.getByRole('textbox', { name: 'Document Title' });
    const documentTypeForm = screen.getByRole('combobox', { name: 'Document Type' });
    const documentDateForm = screen.getByRole('textbox', { name: 'Document Date' });
    const dragAndDropFileArea = screen.getByLabelText('Drag and Drop File Area');
    const saveButton = screen.getByRole('button', { name: 'Save Button' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel Button' });

    fireEvent.change(documentTitleForm, { target: { value: 'New Doc' } });

    fireEvent.mouseDown(documentTypeForm);

    await waitFor(() => {
      const docTypeOption = screen.getByText(mockSupportingDocumentTypes[0].type);

      expect(docTypeOption).toBeInTheDocument();

      fireEvent.click(docTypeOption);
    });

    fireEvent.change(documentDateForm, { target: { value: '01/01/2025' } });

    const mockFile = new File(['Mock File Contents'], 'mock.pdf', { type: 'application/pdf' });
    const mockFileTransfer = {
      dataTransfer: {
        files: [mockFile],
      },
      items: [
        {
          kind: 'file',
          type: mockFile.type,
          getAsFile: () => mockFile,
        },
      ],
      types: ['Files'],
    };

    await waitFor(() => fireEvent.drop(dragAndDropFileArea, mockFileTransfer));

    await waitFor(() => {
      const documentTitleDisplay = screen.getByText(mockFile.name);
      expect(documentTitleDisplay).toBeInTheDocument();
    });

    expect(saveButton).not.toBeDisabled();

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(documentTitleForm).toHaveValue('');
      expect(documentDateForm).toHaveValue('');
      expect(saveButton).toBeDisabled();
    });
  });
});
