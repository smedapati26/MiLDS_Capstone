import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChartData, ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import { Box, Stack, Typography, useTheme } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts';

export type ShowGaugeAs = 'percentage' | 'namedResult' | 'asIs';

export interface IGaugeLevel {
  inf: number;
  sup: number;
}

export interface PmxGaugeProps {
  value: number;
  message?: string;
  width?: string | number;
  height?: string | number;
  showAs?: ShowGaugeAs;
  angle?: number | null;
  gaugeLevel?: IGaugeLevel;
  ['data-testid']?: string;
}

const GetText = ({
  value,
  showAs,
  gaugeLevel,
}: {
  value: number;
  showAs: ShowGaugeAs;
  gaugeLevel: IGaugeLevel;
}): string => {
  let result: string = '';

  switch (showAs) {
    case 'percentage':
      result = `${Number((value * 100).toFixed(0))}%`;
      break;
    case 'asIs':
      result = `${value.toFixed(2)}`;
      break;
    case 'namedResult':
      if (value > gaugeLevel.sup) {
        result = 'Good';
      } else if (value >= gaugeLevel.inf && value <= gaugeLevel.sup) {
        result = 'Fair';
      } else if (value < gaugeLevel.inf) {
        result = 'Poor';
      }
      break;
  }

  return result;
};

/**
 * A Pmx modular gauge component
 *
 * @param {PmxGaugeProps} props - The properties interface.
 * @param {number} props.value - the percentage in decimal form
 * @param {string} props.message? - any comments user wishes to add to the bottom
 * @param {number | string} props.height - height used to create the gauge
 * @param {number | string} props.width - width used to create the gauge
 * @param {ShowAs} props.showAs - the type of how to represent th result
 * @param {IGaugeLevel} props.gaugeLevel - the break down of what constitutes as poor, fair and good
 * @returns
 */

export const PmxModularGauge: React.FC<PmxGaugeProps> = ({
  value,
  message,
  height,
  width,
  showAs = 'namedResult',
  gaugeLevel = { inf: 0.5, sup: 0.75 },
  ...rest
}: PmxGaugeProps): JSX.Element => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver(() => {});
      if (containerRef.current) observer.observe(containerRef.current);

      return () => observer.disconnect();
    }
  }, [height, width]);

  // determine which segment should be filled based on the value
  let poorColor = theme.palette.error.main;
  let fairColor = theme.palette.grey.main;
  let goodColor = theme.palette.grey.main;
  const emptyColor = '#1A1A1AB3';
  if (value === 0) {
    poorColor = emptyColor;
  }
  if (value !== 0 && value > 0.5 && value <= 0.75) {
    poorColor = theme.palette.warning.main;
    fairColor = theme.palette.warning.main;
  } else if (value > 0.75) {
    poorColor = theme.palette.success.main;
    fairColor = theme.palette.success.main;
    goodColor = theme.palette.success.main;
  }

  const centerText = GetText({ value, showAs, gaugeLevel });
  const spaceColor = isDarkMode ? theme.palette.layout.base : theme.palette.background.default;

  const isEmpty = value === 0;
  const white = '#fff';
  const getBackGroundColor = (isEmpty: boolean, isDarkMode: boolean) => {
    if (isEmpty) {
      if (isDarkMode) {
        return [white, white, white];
      } else {
        return [emptyColor, emptyColor, emptyColor];
      }
    }
    return [poorColor, fairColor, goodColor];
  };
  const data: ChartData<'doughnut'> = {
    labels: ['poor', 'fair', 'good'],
    datasets: [
      {
        data: [1, 1, 1],
        backgroundColor: getBackGroundColor(isEmpty, isDarkMode),
        borderWidth: 2,
        borderRadius: 0,
        borderColor: isEmpty
          ? [theme.palette.background.paper, theme.palette.background.paper, theme.palette.background.paper]
          : [spaceColor, spaceColor, spaceColor],
        borderAlign: 'inner',
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = useMemo(
    () => ({
      rotation: -90,
      circumference: 180,
      cutout: '75%',
      aspectRatio: 1.5,
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
    }),
    [],
  );

  return (
    <Stack alignItems="center">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          width: width ?? '100%',
          aspectRatio: '2 / 1',
          position: 'relative',
        }}
        ref={containerRef}
        {...rest}
      >
        <Doughnut
          data={data}
          options={options}
          key={`gauge-modular-${showAs}-${gaugeLevel.inf}-${gaugeLevel.sup}-${width}-${height}`}
        />
        <Typography
          variant="h5"
          style={{
            position: 'absolute',
            top: '70%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {centerText}
        </Typography>
      </Box>
      {message && <Typography variant="body1">{message}</Typography>}
    </Stack>
  );
};

/**
 * A Pmx simple gauge component
 *
 * @param {PmxGaugeProps} props - The properties interface.
 * @param {number} props.value - the percentage in decimal form
 * @param {ShowAs} props.showAs - the type of how to represent th result
 * @param {IGaugeLevel} props.gaugeLevel - the break down of what constitutes as poor, fair and good
 * @param {number} props.angle - angle of the gauge
 * @param {number | string} props.width - width used to create the gauge
 * @param {number | string} props.height - height used to create the gauge
 * @param {string} props.message? - any comments user wishes to add to the bottom
 * @returns
 */

export const PmxGauge: React.FC<PmxGaugeProps> = ({
  value,
  showAs = 'percentage',
  gaugeLevel = { inf: 0.5, sup: 0.75 },
  angle = 90,
  width,
  height,
  message,
  ...rest
}: PmxGaugeProps): React.ReactElement => {
  const theme = useTheme();
  const [meterStatus, setMeterStatus] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: string | number; height: string | number }>({
    width: width || 0,
    height: height || 0,
  });

  // to get the proper size
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setMeterStatus(GetText({ value, showAs, gaugeLevel }));
  }, [value, theme.palette.success.main, theme.palette.error.main, theme.palette.warning.main, showAs, gaugeLevel]);

  return (
    <Stack alignItems="center">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        ref={containerRef}
        sx={{ width: '100%', aspectRatio: '2 / 1', position: 'relative' }}
        {...rest}
      >
        <Gauge
          key={`gauge-${showAs}-${gaugeLevel.inf}-${gaugeLevel.sup}-${width}-${height}`}
          width={(width as number) ?? (size.width as number)}
          height={(height as number) ?? (size.height as number)}
          innerRadius={'60%'}
          outerRadius={'80%'}
          value={value * 100}
          startAngle={angle ? angle * -1 : undefined}
          endAngle={angle ?? undefined}
          sx={{
            [`& .${gaugeClasses.valueText}`]: {
              display: 'none',
            },
          }}
        />
        <Typography
          variant="h5"
          sx={{
            position: 'absolute',
            top: '60%',
            left: '50%',
            transform: 'translate(-50%, -5%)',
            pointerEvents: 'none',
          }}
        >
          {meterStatus}
        </Typography>
      </Box>
      {message && <Typography variant="body1">{message}</Typography>}
    </Stack>
  );
};
