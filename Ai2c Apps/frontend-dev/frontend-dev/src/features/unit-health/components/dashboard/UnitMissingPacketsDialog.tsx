import React from 'react';

import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import { IUnitMissingPacketsSoldierData } from '@store/amap_ai/unit_health';

import { MissingPacketsTable } from '../tables/UnitMissingPackets/MissingPacketsTable';

export interface IUnitMissingPacketsDialogProps {
  unitMissingPacketsData: IUnitMissingPacketsSoldierData[] | undefined;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UnitMissingPacketsDialog: React.FC<IUnitMissingPacketsDialogProps> = ({
  unitMissingPacketsData,
  open,
  setOpen,
}) => {
  return (
    <Dialog
      maxWidth={'xl'}
      fullWidth
      open={open}
      onClose={() => setOpen(false)}
      aria-label="Unit MissingPackets Dialog"
    >
      <DialogTitle>Unit MissingPackets</DialogTitle>
      <DialogContent>
        <MissingPacketsTable unitMissingPacketsData={unitMissingPacketsData} />
      </DialogContent>
    </Dialog>
  );
};
