import React, { useState } from 'react';

import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';

interface ExportProps {
  handleCsv: () => void;
  handlePdf: () => void;
  handleExcel: () => void;
  handleCopy: () => void;
  handlePrint: () => void;
}
/**
 * ExportMenu Component:
 * Displays a menu with "Export", "Copy", and "Print" options.
 * Clicking "Export" reveals a submenu to the left with "CSV", "PDF", and "Excel".
 */
const ExportMenu = ({ handleCsv, handlePdf, handleExcel, handleCopy, handlePrint }: ExportProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [submenuAnchorEl, setSubmenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleMainMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMainMenuClose = () => {
    setAnchorEl(null);
    setSubmenuAnchorEl(null);
  };

  const handleSubmenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSubmenuAnchorEl(event.currentTarget);
  };

  const handleSubmenuClose = () => {
    setSubmenuAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleMainMenuOpen} aria-label="export-btn">
        <MoreVertIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMainMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleSubmenuOpen}>
          <ListItemIcon>
            <ArrowLeftIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Export" />
        </MenuItem>
        <MenuItem onClick={handleCopy}>Copy</MenuItem>
        <MenuItem onClick={handlePrint}>Print</MenuItem>
      </Menu>

      <Menu
        anchorEl={submenuAnchorEl}
        open={Boolean(submenuAnchorEl)}
        onClose={handleSubmenuClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleCsv}>CSV</MenuItem>
        <MenuItem onClick={handlePdf}>PDF</MenuItem>
        <MenuItem onClick={handleExcel}>Excel</MenuItem>
      </Menu>
    </>
  );
};

export default ExportMenu;
