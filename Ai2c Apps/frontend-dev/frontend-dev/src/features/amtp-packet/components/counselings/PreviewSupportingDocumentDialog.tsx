import React, { useMemo } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import PmxFilePreview from '@components/PmxFilePreview';
import { SupportingDocument, useGetDocumentFileByIdQuery } from '@store/amap_ai/supporting_documents';

/* Props for the PreviewSupportingDocumentDialog component. */
export interface PreviewSupportingDocumentDialogProps {
  supportingDocument: SupportingDocument;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A functional component that acts as the UI and related forms for the Edit Counseling Dialog.
 *
 * @component
 * @param { SupportingDocument } supportingDocument - The document being viewed.
 * @param { boolean } open - The state variable for if this dialog is open.
 * @param { React.Dispatch<React.SetStateAction<boolean>> } setOpen - The setState function for the open state for this dialog.
 * @returns {React.JSX.Element} The rendered component.
 */
const PreviewSupportingDocumentDialog: React.FC<PreviewSupportingDocumentDialogProps> = ({
  supportingDocument,
  open,
  setOpen,
}) => {
  const { data: file } = useGetDocumentFileByIdQuery({
    document_id: supportingDocument.id.toString(),
  });

  const fileUrl: string | null = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file]);

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      key={supportingDocument.id}
      onClose={() => setOpen(false)}
      open={open}
      aria-label="Preview Supporting Document Dialog"
    >
      <DialogTitle>Preview Download Supporting Document</DialogTitle>
      <DialogContent>
        <PmxFilePreview
          fileName={supportingDocument.documentTitle ? `${supportingDocument.documentTitle}.pdf` : 'No File Name'}
          filePath={fileUrl}
        />
      </DialogContent>
      <DialogActions sx={{ p: 4 }}>
        <Button onClick={() => setOpen(false)} variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreviewSupportingDocumentDialog;
