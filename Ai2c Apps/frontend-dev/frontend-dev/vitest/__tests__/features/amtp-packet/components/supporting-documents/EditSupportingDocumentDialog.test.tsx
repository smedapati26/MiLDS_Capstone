import { describe, expect, it } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';
import { mockSoldierDesignations } from 'vitest/mocks/handlers/amtp-packet/soldier-designation/mock_data';
import {
  mockSupportingDocuments,
  mockSupportingDocumentTypes,
} from 'vitest/mocks/handlers/amtp-packet/supporting-documents/mock_data';

import { screen, waitFor, within } from '@testing-library/react';

import EditSupportingDocumentDialog, {
  EditSupportDocumentDialogProps,
} from '@features/amtp-packet/components/supporting-documents/EditSupporingDocumentDialog';
import { mapToSupportingDocument } from '@store/amap_ai/supporting_documents/models';

const mockSetOpen = vi.fn();

const render = ({ ...props }: EditSupportDocumentDialogProps) => {
  return renderWithProviders(<EditSupportingDocumentDialog {...props} />);
};

describe('EditSupportingDocumentDialog Tests', () => {
  it('Does not render while dialog is not open', () => {
    render({
      document: mapToSupportingDocument(mockSupportingDocuments[0]),
      open: false,
      setOpen: mockSetOpen,
      refetchSupportingDocuments: () => {},
    });

    const divElements = screen.queryByLabelText('Edit Supporting Document Dialog');
    expect(divElements).not.toBeInTheDocument();
  });

  it('Renders when dialog is open and form fields that are populated', async () => {
    await waitFor(() =>
      render({
        document: mapToSupportingDocument(mockSupportingDocuments[0]),
        open: true,
        setOpen: mockSetOpen,
        refetchSupportingDocuments: () => {},
      }),
    );

    const divElements = screen.queryByLabelText('Edit Supporting Document Dialog');
    const documentTitleForm = screen.getByLabelText('Document Title');
    const documentTypeForm = screen.getByRole('combobox', { name: 'Document Type' });
    const initDocumentType = await waitFor(() =>
      within(documentTypeForm).getByText(mockSupportingDocumentTypes[0].type),
    );
    const associateEventCheckbox = screen.getByLabelText('Associate Event Checkbox');
    const associatedEventForm = screen.getByRole('combobox', { name: 'Event' });
    // const initEvent = await waitFor(() => within(associatedEventForm).getByText(`${mockSupportingDocuments[0].related_event?.date} - ${mockSupportingDocuments[0].related_event?.event_type}}`))
    const assignDesignationCheckbox = screen.getByLabelText('Assign Designation Checkbox');
    const assignDesignationForm = screen.getByRole('combobox', { name: 'Designation' });
    const initDesignation = await waitFor(() =>
      within(assignDesignationForm).getByText(
        `${mockSupportingDocuments[0].related_designation!}: ${mockSoldierDesignations[0].start_date} - ${mockSoldierDesignations[0].end_date}`,
      ),
    );

    expect(divElements).toBeInTheDocument();
    expect(documentTitleForm).toBeInTheDocument();
    expect(initDocumentType).toBeInTheDocument();
    expect(documentTypeForm).toBeInTheDocument();
    expect(associateEventCheckbox).toBeInTheDocument();
    expect(associatedEventForm).toBeInTheDocument();
    expect(associatedEventForm).not.toBeDisabled();
    expect(assignDesignationCheckbox).toBeInTheDocument();
    expect(assignDesignationForm).toBeInTheDocument();
    expect(assignDesignationForm).not.toBeDisabled();
    expect(initDesignation).toBeInTheDocument();
  });
});
