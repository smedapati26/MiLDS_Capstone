import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface PaletteColor {
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

  interface SimplePaletteColorOptions {
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

  interface TypeText {
    contrastText: string;
  }

  interface Palette {
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

    operational_readiness_status: {
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

  interface PaletteOptions {
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
      fmc?: string;
      pmcs?: string;
      pmcm?: string;
      nmcs?: string;
      nmcm?: string;
      dade?: string;
    };

    avatar: string;
    badge: string;
  }
}
