import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const PageTitle = styled(Typography)(({ theme }) => ({
  fontFamily: theme.typography.h4?.fontFamily,
  fontSize: theme.typography.h4?.fontSize,
  fontWeight: theme.typography.h4?.fontWeight,
  lineHeight: theme.typography.h4?.lineHeight,
  paddingBottom: theme.spacing(4),
}));
