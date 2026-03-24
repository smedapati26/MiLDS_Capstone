import { useTheme } from '@mui/material';

import AmapDark from '../assets/logo/amap_dark.svg';
import AmapLight from '../assets/logo/amap_light.svg';

const AmapIcon: React.FC = () => {
  const theme = useTheme();
  const src = theme.palette.mode === 'dark' ? AmapDark : AmapLight;

  return <img src={src} alt="Amap logo" style={{ width: 25, height: 25 }} />;
};

export default AmapIcon;
