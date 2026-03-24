import React from 'react';

import InfoIcon from '@mui/icons-material/Info';
import { Card, Divider, Stack, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';

import { titlecase } from '@ai2c/pmx-mui';

import { IFhpSummaryDetails } from '@store/griffin_api/fhp/models';

interface Props {
  data: IFhpSummaryDetails;
  title: string;
}

const ModelTypography = ({ model, value }: { model: string; value: number }): React.ReactNode => {
  const theme = useTheme();

  return (
    <Stack direction="column" alignItems="center" data-testid="fhp-summary-card-model-text">
      <Typography variant="body2">{Math.round(value)}</Typography>
      <Typography variant="body3" color={theme.palette.text.secondary}>
        {model}
      </Typography>
    </Stack>
  );
};

const PeriodTypography = ({ title, value }: { title: string; value: number }): React.ReactNode => {
  const theme = useTheme();

  return (
    <Stack direction="column" spacing={3} sx={{ minWidth: '133px' }} data-testid="fhp-summary-card-period-text">
      <Typography variant="body1">{title}</Typography>
      <Stack direction="row" spacing={2}>
        <Typography variant="body2">{Math.round(value)}</Typography>
        <Typography variant="body3" color={theme.palette.text.secondary}>
          flight hours
        </Typography>
      </Stack>
    </Stack>
  );
};

/**
 * Helper function to chunk an array into smaller arrays of a given size
 */
const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const cardTitle = (title: string): string => {
  const fixedTitle = title === 'nightGoggles' ? 'NVG' : titlecase(title);
  return fixedTitle;
};

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500,
  },
});

/**
 * Flight Hour summary card
 * @param {Props} props component props
 * @param {IFhpSummaryDetails} props.data flight hour program summary details data
 * @returns React.ReactNode
 */
const FlightCard: React.FC<Props> = (props: Props): React.ReactNode => {
  const { data, title } = props;

  // Chunk the models array into groups of 4
  const modelChunks = chunkArray(data.models, 4);

  return (
    <Card data-testid="fhp-flight-summary-card" sx={{ p: '20px 16px', width: 'fit-content' }}>
      <Stack direction="column" spacing={3}>
        <Typography variant="body2">
          {`${cardTitle(title)} Flight `}
          <StyledTooltip
            title={
              <Stack direction="row" justifyContent="space-between" gap={6}>
                <Typography variant="body3" color="text.secondary">
                  Flying Hours
                </Typography>
                <Typography variant="body3">
                  Flight hours by mode of flight are calculated using -12 flight hours of aircraft currently assigned to
                  the selected global unit. Unit total flight hours use DA1352 flight hours for the selected global unit
                  and its subordinates to ensure its robustness to aircraft transfers. These values may not always equal
                  each other.
                </Typography>
              </Stack>
            }
            placement="bottom"
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 10],
                    },
                  },
                ],
              },
            }}
          >
            <InfoIcon
              sx={{
                fontSize: '1rem',
                cursor: 'help',
              }}
            />
          </StyledTooltip>
        </Typography>
        <Stack direction="row" spacing={2}>
          <PeriodTypography title="Fiscal YTD" value={data.fiscalYearToDate} />
          <PeriodTypography title="Selected Range" value={data.reportingPeriod} />
        </Stack>
        <Divider orientation="horizontal" flexItem />
        <Typography variant="body1">Hours by Model</Typography>
        <Stack direction="column" spacing={3}>
          {modelChunks.map((chunk, rowIndex) => (
            <Stack key={rowIndex} direction="row" spacing={3}>
              {chunk.map((model, modelIndex) => (
                <ModelTypography key={modelIndex} model={model.model} value={model.hours} />
              ))}
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
};

export default FlightCard;
