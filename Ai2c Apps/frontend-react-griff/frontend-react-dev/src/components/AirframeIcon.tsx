import React from 'react';

import { AIRCRAFT_AIRFRAME_MAP } from '../static/airframes';

type IconKey = keyof typeof AIRCRAFT_AIRFRAME_MAP;

type AirframeProps = {
  name: string;
} & React.SVGProps<SVGSVGElement>;

export const AirframeIcon: React.FC<AirframeProps> = ({ name, ...props }) => {
  const match = (Object.keys(AIRCRAFT_AIRFRAME_MAP) as IconKey[]).find((key) => name.startsWith(key));
  const DefaultIcon = AIRCRAFT_AIRFRAME_MAP['AH-64'];

  if (!match) {
    return <DefaultIcon {...props} />;
  }

  const Icon = AIRCRAFT_AIRFRAME_MAP[match];
  return <Icon {...props} />;
};
