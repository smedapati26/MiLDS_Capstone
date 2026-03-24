import React, { ReactNode } from 'react';

import CommentIcon from '@mui/icons-material/Comment';
import { Tooltip } from '@mui/material';

import { slugify } from '@ai2c/pmx-mui';

export const PmxCommentTooltip: React.FC<{ title: string | ReactNode }> = ({ title }): React.ReactNode => {
  return (
    <Tooltip
      id={typeof title === 'string' ? slugify(title) : 'comment-tooltip'}
      data-testid={typeof title === 'string' ? slugify(title) : 'comment-tooltip'}
      placement="top"
      sx={{
        maxHeight: '330px',
        overflow: 'auto',
      }}
      title={title}
    >
      <CommentIcon fontSize="small" />
    </Tooltip>
  );
};
