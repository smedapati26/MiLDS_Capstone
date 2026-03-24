import '@mui/material';
import '@mui/material/Paper';
import '@mui/material/Popover';
import '@mui/material/styles';
import '@mui/material/styles/createPalette';
import '@mui/material/Typography';

declare module '@mui/material/styles' {
  // Allows you to use any key value pair with MUI Theme Options components
  interface Components {
    [key: string]: unknown;
  }

  // Extra props
  interface TypographyVariants {
    body3: React.CSSProperties;
  }

  // Extra props
  interface TypographyVariantsOptions {
    body3?: React.CSSProperties;
  }

  // Extended palette to match PMx Style Guide
  export interface SimplePaletteColorOptions {
    white?: string;
    black?: string;
    l90?: string;
    l80?: string;
    l60?: string;
    l40?: string;
    l20?: string;
    d20?: string;
    d40?: string;
    d60?: string;
    d80?: string;
    d90?: string;
  }
}

declare module '@mui/material' {
  // Extended Color to match PMx Style Guide
  export interface Color {
    black?: string;
    white?: string;
    l90?: string;
    l80?: string;
    l60?: string;
    l40?: string;
    l20?: string;
    main?: string;
    d20?: string;
    d40?: string;
    d60?: string;
    d80?: string;
    d90?: string;
  }
}

declare module '@mui/material/styles/createPalette' {
  // Palette with layout props
  export interface Palette {
    boxShadow: string;
    layout: {
      base: string;
      background5: string;
      background7: string;
      background8: string;
      background9: string;
      background11: string;
      background12: string;
      background14: string;
      background15: string;
      background16: string;
    };
    graph: {
      purple: string;
      cyan: string;
      teal: string;
      pink: string;
      green: string;
      blue: string;
      magenta: string;
      yellow: string;
      teal2: string;
      cyan2: string;
      orange: string;
      purple2: string;
    };
    stacked_bars: {
      magenta: string;
      blue: string;
      cyan2: string;
      teal2: string;
      purple: string;
    };
    classification: {
      unclassified: string;
      cui: string;
      confidential: string;
      secret: string;
      top_secret: string;
      top_secret_sci: string;
    };
    operational_readiness_status?: {
      fmc: string;
      pmcs: string;
      pmcm: string;
      nmcs: string;
      nmcm: string;
      dade: string;
    };
    avatar: string;
    badge: string;
  }

  // Palette Options with additional parameters to sync up with PMx Style Guide
  export interface PaletteOptions {
    boxShadow: string;
    layout: {
      base?: string;
      background5?: string;
      background7?: string;
      background8?: string;
      background9?: string;
      background11?: string;
      background12?: string;
      background14?: string;
      background15?: string;
      background16?: string;
    };
    graph?: {
      purple?: string;
      cyan?: string;
      teal?: string;
      pink?: string;
      green?: string;
      blue?: string;
      magenta?: string;
      yellow?: string;
      teal2?: string;
      cyan2?: string;
      orange?: string;
      purple2?: string;
    };
    stacked_bars?: {
      magenta?: string;
      blue?: string;
      cyan2?: string;
      teal2?: string;
      purple?: string;
    };
    classification?: {
      unclassified?: string;
      cui?: string;
      confidential?: string;
      secret?: string;
      top_secret?: string;
      top_secret_sci?: string;
    };
    operational_readiness_status?: {
      fmc: string;
      pmcs: string;
      pmcm: string;
      nmcs: string;
      nmcm: string;
      dade: string;
    };
    avatar: string;
    badge: string;
  }

  // Extending Palette Color
  export interface PaletteColor {
    l90?: string;
    l80?: string;
    l60?: string;
    l40?: string;
    l20?: string;
    d20?: string;
    d40?: string;
    d60?: string;
    d80?: string;
    d90?: string;
  }

  // Color Partial extra props
  export type ColorPartial = {
    white: string;
    black: string;
  };

  // Adding contrast text to have black and white text
  export interface TypeText {
    contrastText: string;
  }
}

/**
 * Custom properties to set for secondary Container
 */
declare module '@mui/material/Container' {
  export interface ContainerOwnProps {
    variant?: string;
  }
}

/**
 * Custom basic Variant
 */
declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    basic: true;
    selected: true;
  }
}

/**
 * Custom properties to set for styled components
 */
declare module '@mui/material/Popover' {
  export interface PopoverProps {
    spacing?: number;
    sx?: SxProps<Theme>;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    h7: true;
    body3: true;
  }
}

/**
 * Button Base extended for Tabs
 */
declare module '@mui/material/ButtonBase' {
  export interface ButtonBaseOwnProps {
    to?: string;
  }
}
