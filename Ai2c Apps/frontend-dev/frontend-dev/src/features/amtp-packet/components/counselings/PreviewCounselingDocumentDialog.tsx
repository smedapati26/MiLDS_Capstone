import React, { useMemo } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import PmxFilePreview from '@components/PmxFilePreview';
import { IDA4856, useGetCounselingDocumentQuery } from '@store/amap_ai/counselings';
import { useAppSelector } from '@store/hooks';

/* Props for the PreviewCounselingDocumentDialog component. */
export interface PreviewCounselingDocumentDialogProps {
  counseling: IDA4856;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A functional component that acts as the UI and related forms for the Edit Counseling Dialog.
 *
 * @component
 * @param { IDA4856 } counseling - The document being edited.
 * @param { boolean } open - The state variable for if this dialog is open.
 * @param { React.Dispatch<React.SetStateAction<boolean>> } setOpen - The setState function for the open state for this dialog.
 * @returns {React.JSX.Element} The rendered component.
 */
const PreviewCounselingDocumentDialog: React.FC<PreviewCounselingDocumentDialogProps> = ({
  counseling,
  open,
  setOpen,
}) => {
  const maintainer = useAppSelector((state) => state.amtpPacket.maintainer);

  const { data: file } = useGetCounselingDocumentQuery({
    soldier_id: maintainer?.id ?? '1234567890',
    da_4856_id: counseling.id.toString(),
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
      key={counseling.id}
      onClose={() => setOpen(false)}
      open={open}
      aria-label="Preview Counseling Document Dialog"
    >
      <DialogTitle>Preview Download Counseling</DialogTitle>
      <DialogContent>
        <PmxFilePreview fileName={counseling.document ?? 'No File Name'} filePath={fileUrl} />
      </DialogContent>
      <DialogActions sx={{ p: 4 }}>
        <Button onClick={() => setOpen(false)} variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreviewCounselingDocumentDialog;
