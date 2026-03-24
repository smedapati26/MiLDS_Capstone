import React from 'react';

import { Box, Tooltip } from '@mui/material';

/* Props for the PmxStatusCountBar component. */
export type PmxStatusCountBarProps = {
  data: { title: string; color: string; count: number }[];
  total: number;
};

/**
 * PmxStatusCountBar component renders a box that takes up 100% width of its parent component with percentages of the passed in data.
 *
 * @component
 * @param {PmxStatusCountBarProps} props - The properties object.
 *
 * @returns {React.JSX.Element} The rendered accordion component.
 */
const PmxAccordion: React.FC<PmxStatusCountBarProps> = (props) => {
  const { data, total } = props;

  return (
    <Box display={'flex'} justifyContent={'center'} sx={{ width: '100%', height: '63px', my: 4 }}>
      {data.map((obj, index) => (
        <Tooltip title={obj.count} key={`${obj.title}-count-tooltip`} followCursor>
          <Box
            key={`${obj.title}-display-bar`}
            aria-label={`${obj.title}-display-bar`}
            sx={{
              background: obj.color,
              width: `${(obj.count / total) * 100}%`,
              height: '100%',
              borderRadius:
                index === 0
                  ? '4px 0px 0px 4px'
                  : // eslint-disable-next-line sonarjs/no-nested-conditional
                    index === data.length - 1
                    ? '0px 4px 4px 0px'
                    : '',
            }}
          />
        </Tooltip>
      ))}
    </Box>
  );
};

export default PmxAccordion;
