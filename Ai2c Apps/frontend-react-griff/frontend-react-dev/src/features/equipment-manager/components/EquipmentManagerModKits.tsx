import React, { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Button, Stack, Typography, useTheme } from '@mui/material';

import PmxAccordion from '@components/PmxAccordion';

import AddModificationModal from '../mods/AddModificationModal';

export type modsKitsToggle = 'modifications' | 'kits';

interface ChildProps {
  mkToggle: modsKitsToggle;
}

interface Props {
  isLoading: boolean;
  children?: React.ReactElement<ChildProps>;
}

/**
 * Mods and Kits accordion component
 * @param {Props} props - component props
 * @param {boolean} props.isLoading - loading props
 * @param {React.ReactNode} props.children - child component based on equipment-manager type
 * @returns ReactNode
 */

const EquipmentManagerModKits: React.FC<Props> = (props: Props): React.ReactElement => {
  const { isLoading, children } = props;
  const mkToggle: modsKitsToggle = 'modifications';
  const [openAddMod, setOpenAddMod] = useState<boolean>(false);
  const theme = useTheme();

  const handleAddModification = (): void => {
    setOpenAddMod(true);
  };

  return (
    <PmxAccordion
      sx={{ bgcolor: theme.palette.layout.background5 }}
      heading={<Typography variant="body2">Modifications</Typography>}
      isLoading={isLoading}
      data-testid="mods-kits-accordion"
    >
      <Stack direction="column" spacing={3} data-testid="equipment-mods-kits">
        <Typography variant="body1">Click a modification to filter your equipment</Typography>
        <Button
          variant="contained"
          size="medium"
          startIcon={<AddIcon sx={{ fill: `${theme.palette.text.contrastText} !important` }} />}
          sx={{ width: 'fit-content' }}
          onClick={handleAddModification}
        >
          Add Modification
        </Button>
        {React.Children.map(children, (child) =>
          React.isValidElement(child) ? React.cloneElement(child, { mkToggle }) : child,
        )}
      </Stack>
      <AddModificationModal open={openAddMod} setOpen={setOpenAddMod} />
    </PmxAccordion>
  );
};

export default EquipmentManagerModKits;
