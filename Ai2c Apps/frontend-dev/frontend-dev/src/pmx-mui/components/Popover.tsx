import { styled } from '@mui/material';
import MuiPopover from '@mui/material/Popover';

/* Styled MUI Popover Component to look like Context Menu */
export const ContextPopover = styled(MuiPopover)(({ theme }) => ({
  '& .MuiBackdrop-root': {
    opacity: '0 !important',
  },
  '& .MuiBackdrop': {
    backgroundColor: 'transparent',
  },
  '& .MuiPopover-paper': {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.layout?.background11,
  },
}));

/* Styled MUI Popover Component to look like default Menu */
export const Popover = styled(MuiPopover)(({ theme, spacing }) => ({
  '& .MuiPopover-paper': {
    padding: spacing ? theme.spacing(spacing) : theme.spacing(0),
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.layout?.background11 : theme.palette.layout?.base,
    borderWidth: '1px',
    borderColor: theme.palette.layout?.background5,
  },
  '& .MuiBackdrop-root': {
    opacity: '0 !important',
  },
  '& .MuiBackdrop': {
    backgroundColor: 'transparent',
  },
}));
