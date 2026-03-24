import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

/**
 * Represents a styled heading component.
 *
 * Adds 15px to any Heading
 * @component
 * @example
 * ```tsx
 * <Heading variant='h2' />
 * ```
 */
export const Heading = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));
