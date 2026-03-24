import { useTheme } from '@mui/material';
import { LineChartProps, MarkElementProps } from '@mui/x-charts';

// Custom legend renderer
interface LegendSlotProps {
  markSlot: React.FC<MarkElementProps>;
  series: LineChartProps['series'];
  padding: number;
  markGap: number;
  itemGap: number;
}

const FaultsOverTimeLegend = ({ series, padding, markGap, itemGap, markSlot }: LegendSlotProps) => {
  const theme = useTheme();
  const size = 16;
  const { top, left } = typeof padding === 'object' ? padding : { top: padding || 0, left: padding || 0 };
  let lastPosition = 0;

  return (
    <svg height={'20px'}>
      <g>
        {series.map((val) => {
          const length = (() => {
            const span = document.createElement('span');
            span.style.fontSize = size + 'px';
            span.style.fontFamily = 'Roboto, Helvetica, Arial, san-serif';
            span.style.fontWeight = '400';
            span.style.lineHeight = '1';
            span.style.visibility = 'hidden';
            span.textContent = val.label?.toString() ?? '';
            document.body.appendChild(span);
            const width = span.offsetWidth;
            document.body.removeChild(span);
            return width;
          })();
          const rectLength = size + (markGap || 0) + length;
          const xPosition = lastPosition;
          lastPosition = rectLength + xPosition + (itemGap || 0);

          return (
            <g
              key={val.id}
              transform={`translate(${xPosition + (left || 0)}, ${top || 0})`}
              style={{ color: 'inherit' }}
              height={24}
            >
              <rect
                x={-2}
                y={-4}
                width={rectLength + 4}
                height={size + 8}
                fill="transparent"
                style={{ pointerEvents: 'none', cursor: 'unset' }}
              />
              {markSlot({
                id: val.id ?? '',
                x: size / 2,
                y: size / 2,
                color: val.color ?? '',
                shape: 'circle',
                dataIndex: 0,
              })}
              <text
                x={size + (markGap || 0)}
                y={size / 2}
                fill={theme.palette.text.primary}
                textAnchor="start"
                dominantBaseline="central"
              >
                <tspan dominantBaseline="central">{val.label?.toString()}</tspan>
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export default FaultsOverTimeLegend;
