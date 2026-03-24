import { SxProps, Theme } from '@mui/material/styles';

/**
 * Represents the props for an icon component.
 *
 * @interface IconProps
 * @property {string | number} [width] - The width of the icon.
 * @property {string | number} [height] - The height of the icon.
 * @property {string} [fill] - The fill color of the icon.
 * @property {string | number} [size] - The size of the icon.
 * @property {SxProps<Theme>} [sx] - The style props for the icon.
 */
export interface IconProps {
  width?: string | number;
  height?: string | number;
  fill?: string;
  size?: string | number;
  sx?: SxProps<Theme>;
}
