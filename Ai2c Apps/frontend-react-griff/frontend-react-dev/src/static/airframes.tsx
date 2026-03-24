import ApacheAh64 from './svg/ApacheAH64.svg?react';
import BlackHawkUH60 from './svg/BlackHawkUH60.svg?react';
import ChinookCH47 from './svg/ChinookCH47.svg?react';
import LakotaUH72 from './svg/LakotaUH72.svg?react';
import OtherC12 from './svg/OtherC12.svg?react';
import OtherC27 from './svg/OtherC27.svg?react';
import OtherC147 from './svg/OtherC147.svg?react';
import OtherC212 from './svg/OtherC212.svg?react';
import OtherEO5 from './svg/OtherEO5.svg?react';
import OtherT6 from './svg/OtherT6.svg?react';
import OtherUC35 from './svg/OtherUC35.svg?react';
import OtherUV18 from './svg/OtherUV18.svg?react';

export const AIRCRAFT_AIRFRAME_MAP = {
  'AH-64': ApacheAh64,
  'EH-60': BlackHawkUH60,
  'HH-60': BlackHawkUH60,
  'MH-60': BlackHawkUH60,
  'UH-60': BlackHawkUH60,
  'VH-60': BlackHawkUH60,
  'CH-47': ChinookCH47,
  'MH-47': ChinookCH47,
  'UH-72': LakotaUH72,
  'C-12': OtherC12,
  'MC-12': OtherC12,
  'RC-12': OtherC12,
  'C-27': OtherC27,
  'C-147': OtherC147,
  'C-212': OtherC212,
  'EO-5': OtherEO5,
  'T-6': OtherT6,
  'UC-35': OtherUC35,
  'UV-18': OtherUV18,
};

/* 
Note: if you are getting an error with creating svg element
ex:
Failed to execute 'createElement' on 'Document': The tag name provided ('/src/static/svg/ApacheAH64.svg?react') is not a valid

run command
$ npm run build

to create the svg's locally in the dist folder.

*/
