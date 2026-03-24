import React, { useState } from 'react';

import { ClickAwayListener, Link, Tooltip } from '@mui/material';

interface ITooltip {
  value?: React.ReactNode;
  title: React.ReactNode;
}

export const PmxClickableTooltip: React.FC<ITooltip> = ({ value, title }: ITooltip): React.ReactNode => {
  const [open, setOpen] = useState<boolean>(false);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!value) return '--';

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Tooltip
        open={open}
        onClose={handleClose}
        title={title}
        data-testid="table-value-with-tooltip"
        placement="top"
        disableFocusListener
        disableHoverListener
      >
        <Link href="#" onClick={handleClick}>
          {value}
        </Link>
      </Tooltip>
    </ClickAwayListener>
  );
};
