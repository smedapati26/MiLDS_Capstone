import { Avatar, Typography } from '@mui/material';

import { titlecaseAcronym } from '@ai2c/pmx-mui/helpers/titlecase';

/**
 * @typedef Props
 * @prop
 */
export type Props = {
  dataURL: string | null;
  alt: string;
};

/**
 * LogoImage Functional Component
 * @param { Props } props
 */
export const LogoImage: React.FC<Props> = (props) => {
  const { dataURL, alt } = props;

  return (
    <Avatar
      data-testid="logo-image"
      aria-label={alt}
      src={dataURL as string}
      sx={{ width: 100, height: 100, bgcolor: 'grey.300' }}
    >
      {!dataURL && <Typography>{titlecaseAcronym(alt)}</Typography>}
    </Avatar>
  );
};
