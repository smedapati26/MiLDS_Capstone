import SyncDisabledIcon from '@mui/icons-material/SyncDisabled';
import { Stack, Typography, useTheme } from '@mui/material';

interface HeaderProps {
  title: string;
  value?: string;
}

export const AddSyncField: React.FC<{ field: string; syncs: Record<string, boolean>; children: React.ReactNode }> = ({
  syncs,
  field,
  children,
}: {
  field: string;
  syncs: Record<string, boolean>;
  children: React.ReactNode;
}): React.ReactNode => {
  let unSynced = false;

  if (syncs && field in syncs) {
    unSynced = !syncs[field];
  }

  return (
    <Stack direction="row" spacing={3} alignItems="center">
      {children}
      {unSynced && <SyncDisabledIcon />}
    </Stack>
  );
};

/**
 * The component that displays serial top part of single edits
 * @param {string} title to display
 * @param {string} value to display
 * @returns ReactNode
 */
export const HeaderContent: React.FC<HeaderProps> = ({ title, value }: HeaderProps): React.ReactNode => {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={2}>
      <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
        {title}:
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Stack>
  );
};
