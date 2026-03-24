import React, { ReactNode } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';
import { Box, Button, IconButton, Popover, Stack, SxProps, Theme, Typography, useTheme } from '@mui/material';

/**
 * Props for the PmxFormPopover component.
 */
export type Props = {
  /** The title displayed in the popover header. */
  title: string;
  /** Optional children to render inside the popover body, typically UI components. */
  children?: ReactNode;
  /** Optional callback function invoked when the clear button is clicked. */
  onClose?: () => void;
  /** Optional callback function invoked when the Apply button is clicked. */
  onFormSubmit?: () => void;
  /** Adds button text next to Icon */
  openButtonText?: string;
  /** Replaces default button Icon */
  openButtonIcon?: ReactNode;
  /** Adds button text next to Icon */
  closeButtonText?: string;
  /** Replaces default Icon */
  closeButtonIcon?: ReactNode;
  /** Replaces submit button text */
  submitText?: string;
  /** SX styles */
  sx?: SxProps<Theme>;
};

/**
 * PmxFormPopover component.
 * Manages the state of a popover, including opening, closing, and applying.
 */
export const PmxFormPopover: React.FC<Props> = ({
  title,
  children,
  onClose,
  onFormSubmit,
  openButtonText,
  openButtonIcon = <LaunchIcon />,
  closeButtonText,
  closeButtonIcon = <CloseIcon />,
  submitText = 'Submit',
  sx,
}) => {
  // State to manage the anchor element for the popover
  const [popoverAnchorEl, setPopoverAnchorEl] = React.useState<null | HTMLElement>(null);
  // Boolean to determine if the popover is open
  const open = Boolean(popoverAnchorEl);
  const { palette } = useTheme();

  /**
   * Handles opening the popover by setting the anchor element to the clicked button.
   * @param event - The mouse event from the icon button click.
   */
  const handleOnOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPopoverAnchorEl(event.currentTarget);
  };

  /**
   * Handles closing the popover by clearing the anchor element.
   */
  const handleOnCancel = () => setPopoverAnchorEl(null);

  /**
   * Handles applying the: calls the onAppl callback if provided, then closes the popover.
   */
  const handleOnClose = () => {
    if (onClose) {
      onClose(); // Handle Clearing outside of Component
    }
    setPopoverAnchorEl(null);
  };

  const handleOnFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (onFormSubmit) {
      event.preventDefault();
      onFormSubmit(); // Handle Clearing outside of Component
    }
    setPopoverAnchorEl(null);
  };

  return (
    <Box id="popover-wrapper" sx={{ ...sx }}>
      {/* Icon button to open the popover */}
      {openButtonText ? (
        <Button
          aria-label={`${title} open button`}
          startIcon={openButtonIcon}
          onClick={handleOnOpen}
          sx={{ color: 'text.primary' }}
        >
          {openButtonText /* Text & Icon */}
        </Button>
      ) : (
        <IconButton aria-label={`${title} open button`} onClick={handleOnOpen} sx={{ color: 'text.primary' }}>
          {openButtonIcon /* Icon Only */}
        </IconButton>
      )}

      {/* Popover containing the menu */}
      <Popover
        open={open}
        anchorEl={popoverAnchorEl}
        onClose={handleOnCancel}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPaper-root': {
            p: 4,
            width: 400,
            backgroundColor: palette.mode === 'dark' ? palette.layout.background7 : palette.layout.base,
          },
        }}
      >
        {/* Header section with title and clear link */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <Typography variant="body2" gutterBottom>
            {title}
          </Typography>
          {/* Icon button to open the popover */}
          {closeButtonText ? (
            <Button
              aria-label={`${title} close button`}
              startIcon={closeButtonIcon}
              onClick={handleOnClose}
              sx={{ color: 'text.primary' }}
            >
              {closeButtonText /* Text & Icon */}
            </Button>
          ) : (
            <IconButton aria-label={`${title} close button`} onClick={handleOnClose} sx={{ color: 'text.primary' }}>
              {closeButtonIcon /* Icon Only */}
            </IconButton>
          )}
        </Box>

        {/* Body section containing the children */}
        <form onSubmit={(event) => handleOnFormSubmit(event)}>
          <Stack direction="column" gap={4}>
            {/** Form */}
            {children}
          </Stack>

          {/* Footer section with Cancel and Apply buttons */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              marginTop: 6,
            }}
          >
            <Button variant="outlined" color="primary" onClick={handleOnCancel}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" type="submit">
              {submitText}
            </Button>
          </Box>
        </form>
      </Popover>
    </Box>
  );
};
