import React, { ReactNode } from 'react';

import { Icon, Link, Tooltip } from '@mui/material';

export interface IPmxIconLinkProps {
  ComponentIcon?: React.ElementType;
  text: string;
  label?: string;
  onClick: () => void;
  align?: 'left' | 'right';
  isUnderlined?: boolean;
  tooltipTitle?: string | ReactNode;
}

export const PmxIconLink: React.FC<IPmxIconLinkProps> = ({
  ComponentIcon,
  text,
  label,
  tooltipTitle,
  align = 'left',
  isUnderlined = true,
  onClick,
}) => {
  const linkContent = (
    <Link
      component="span"
      aria-label={label ?? ''}
      onClick={onClick}
      sx={{
        mb: 2,
        display: 'inline-block',
        cursor: 'pointer',
        textDecoration: 'none',
        color: (theme) => theme.palette.primary.main,
        ...(isUnderlined && { borderBottom: (theme) => `1px solid ${theme.palette.primary.main}` }),
        '&:hover': {
          color: (theme) => theme.palette.primary.light,
          ...(isUnderlined && { borderBottomColor: (theme) => theme.palette.primary.light }),
        },
      }}
    >
      {ComponentIcon && align === 'left' && (
        <Icon sx={{ mb: -1 }}>
          <ComponentIcon sx={{ width: '20px', height: '20px' }} />
        </Icon>
      )}
      {text}
      {ComponentIcon && align === 'right' && (
        <Icon sx={{ mb: -1 }}>
          <ComponentIcon sx={{ width: '20px', height: '20px' }} />
        </Icon>
      )}
    </Link>
  );

  return tooltipTitle ? <Tooltip title={tooltipTitle}>{linkContent}</Tooltip> : linkContent;
};
