import { ReactNode } from 'react';

import { Box } from '@mui/material';

interface CenterItemProps {
  children: ReactNode;
}

/**
 * CenterItem component centers its children vertically and aligns them to the left.
 *
 * @component
 * @param {CenterItemProps} props - The properties interface.
 * @param {ReactNode} props.children - The child elements to be centered
 * @returns {ReactNode} The rendered centered container.
 */
const CenterItem = ({ children }: CenterItemProps) => {
  return (
    <Box display="flex" justifyContent="left" alignItems="center" sx={{ height: '100%', width: '100%' }}>
      {children}
    </Box>
  );
};

export default CenterItem;
