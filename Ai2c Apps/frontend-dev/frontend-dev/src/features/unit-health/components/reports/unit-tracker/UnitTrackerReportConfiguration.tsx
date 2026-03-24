import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

import CheckIcon from '@mui/icons-material/Check';
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  styled,
  ToggleButton,
  Typography,
  useTheme,
} from '@mui/material';

import { DualDateRangePicker } from '@ai2c/pmx-mui';

import { PmxDropdown } from '@components/dropdowns';
import { Column } from '@components/PmxTable';
import { UnitSelect } from '@components/UnitSelect';
import { UnitEventsReportColumns } from '@features/unit-health/constants';
import { useLazyGetTrainingTypesQuery } from '@store/amap_ai/events/slices';
import {
  IEventReportFiltersOut,
  IEventReportSoldier,
  IMOSMLReportData,
  ITaskReportFilterOut,
  ITaskReportSoldier,
  IUnitMOSMLReport,
} from '@store/amap_ai/unit_health';
import {
  useGetUnitEventsReportMutation,
  useGetUnitTasksReportMutation,
  useLazyGetUnitTasksQuery,
} from '@store/amap_ai/unit_health/slices/unitHealthApi';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { MONTHS } from '@utils/enums';
import { getReportingPeriod, IReportingPeriod } from '@utils/helpers/reportingPeriods';

export interface IUnitTrackerReportConfigurationsProps {
  units: IUnitBrief[] | undefined;
  reportUnit: IUnitBrief | undefined;
  setReportUnit: React.Dispatch<React.SetStateAction<IUnitBrief | undefined>>;
  setFilterValue: React.Dispatch<React.SetStateAction<string>>;
  setReportTitle: React.Dispatch<React.SetStateAction<string>>;
  setReportData: React.Dispatch<
    React.SetStateAction<IUnitMOSMLReport | IEventReportSoldier[] | ITaskReportSoldier[] | undefined>
  >;
  setReportColumns: React.Dispatch<
    React.SetStateAction<Column<IMOSMLReportData>[] | Column<IEventReportSoldier>[] | null>
  >;
  setReportEvents: React.Dispatch<React.SetStateAction<string[]>>;
}

export const UnitTrackerReportConfigurations: React.FC<IUnitTrackerReportConfigurationsProps> = ({
  units,
  reportUnit,
  setReportUnit,
  setFilterValue,
  setReportTitle,
  setReportData,
  setReportColumns,
  setReportEvents,
}) => {
  const theme = useTheme();
  const [eventFilter, setEventFilter] = useState<'events' | 'task-numbers' | ''>('');
  const [canGenerateReport, setCanGenerateReport] = useState<boolean>(false);
  const [eventTypeFilters, setEventTypeFilters] = useState<('evaluations' | 'trainings' | '')[]>(['']);
  const [eventCompletionFilters, setEventCompletionFilters] = useState<('complete' | 'incomplete' | '')[]>(['']);
  const [eventBirthMonths, setEventBirthMonths] = useState<string[]>([]);
  const [eventDateRange, setEventDateRange] = useState<number | 30 | 90 | 180 | 365 | 'all' | ''>('');
  const [useCustomDateRange, setUseCustomDateRange] = useState<boolean>(false);
  const [customDateRange, setCustomDateRange] = useState<IReportingPeriod>(getReportingPeriod());
  const [selectedEvaluations, setSelectedEvaluations] = useState<string[]>([]);
  const [selectedTrainings, setSelectedTrainings] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const [getUnitEventsReport] = useGetUnitEventsReportMutation();
  const [getUnitTasksReport] = useGetUnitTasksReportMutation();
  const [getTrainingTypes, { data: trainingTypes }] = useLazyGetTrainingTypesQuery();
  const [getTasks, { data: taskNumbers }] = useLazyGetUnitTasksQuery();

  const taskNumberOptions = useMemo(() => {
    return taskNumbers
      ? [
          ...[...taskNumbers.unitTasks]
            .sort((task1, task2) => task1.uctlTitle.localeCompare(task2.uctlTitle))
            .map((task) => ({ label: task.uctlTitle, value: task.uctlId.toString() })),
          ...[...taskNumbers.individualTasks]
            .sort((task1, task2) => task1.taskTitle.localeCompare(task2.taskTitle))
            .map((task) => ({ label: task.taskTitle, value: task.taskNumber })),
        ]
      : [];
  }, [taskNumbers]);

  useEffect(() => {
    getTrainingTypes(null);
  }, [getTrainingTypes]);

  useEffect(() => {
    if (reportUnit) {
      getTasks({ unit_uic: reportUnit?.uic });
    }
  }, [reportUnit, getTasks]);

  useEffect(() => {
    if (
      reportUnit &&
      eventBirthMonths.length > 0 &&
      (eventDateRange.toString().length > 0 || useCustomDateRange) &&
      ((eventFilter === 'events' &&
        ((eventTypeFilters.includes('evaluations') && selectedEvaluations.length > 0) ||
          (eventTypeFilters.includes('trainings') && selectedTrainings.length > 0)) &&
        (eventCompletionFilters.includes('complete') || eventCompletionFilters.includes('incomplete'))) ||
        eventFilter === 'task-numbers')
    ) {
      setCanGenerateReport(true);
    } else {
      setCanGenerateReport(false);
    }
  }, [
    reportUnit,
    eventBirthMonths,
    eventDateRange,
    useCustomDateRange,
    eventFilter,
    eventTypeFilters,
    selectedEvaluations,
    selectedTrainings,
    eventCompletionFilters,
  ]);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const generateUnitTrackerReport = async () => {
    if (reportUnit) {
      setFilterValue('');
      try {
        let endDate = '';
        let startDate = '';

        if (useCustomDateRange) {
          endDate = customDateRange.endDate.format('YYYY-MM-DD');
          startDate = customDateRange.startDate.format('YYYY-MM-DD');
        } else {
          endDate = dayjs().format('YYYY-MM-DD');

          if (typeof eventDateRange === 'number') {
            startDate = dayjs().subtract(eventDateRange, 'days').format('YYYY-MM-DD');
          } else {
            startDate = '2000-01-01';
          }
        }
        if (eventFilter === 'events') {
          if (eventCompletionFilters.includes('complete') && eventCompletionFilters.includes('incomplete')) {
            setReportTitle('Personnel with Record of Completion or Incompletion');
          } else if (eventCompletionFilters.includes('complete')) {
            setReportTitle('Personnel with Record of Completion');
          } else {
            setReportTitle('Personnel with Record of Incompletion');
          }

          const filterData: IEventReportFiltersOut = {
            unit_uic: reportUnit.uic,
            birth_months: eventBirthMonths.map((month) => (month === MONTHS.Unknown ? 'UNK' : month)),
            start_date: startDate,
            end_date: endDate,
            completion_types: eventCompletionFilters,
            evaluation_types: selectedEvaluations,
            training_types: selectedTrainings,
          };

          const reportEventsData = await getUnitEventsReport(filterData).unwrap();

          setReportData(reportEventsData);
          setReportColumns(UnitEventsReportColumns as Column<IEventReportSoldier>[]);
          setReportEvents([...selectedEvaluations, ...selectedTrainings]);
        } else if (eventFilter === 'task-numbers') {
          const ictls = selectedTasks.filter((task) => isNaN(Number(task)) && !isFinite(Number(task)));
          const uctls = selectedTasks.filter((task) => !isNaN(Number(task)) && isFinite(Number(task)));

          const filterData: ITaskReportFilterOut = {
            unit_uic: reportUnit.uic,
            birth_months: eventBirthMonths.map((month) => (month === MONTHS.Unknown ? 'UNK' : month)),
            start_date: startDate,
            end_date: endDate,
            uctl_ids: uctls,
            task_numbers: ictls,
          };

          const reportTasksData = await getUnitTasksReport(filterData).unwrap();

          setReportData(reportTasksData);
          setReportColumns([]);
        }
      } catch (error) {
        console.error('Error fetching unit tracker data:\t', error);
      }
    }
  };

  const ThemedToggleButton = styled(ToggleButton)({
    textTransform: 'none',
    color: theme.palette.text.primary,
    borderColor: theme.palette.grey.main,
    '&.Mui-selected': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.d60 : '#99C7F5',
      borderColor: theme.palette.primary.main,
    },
  });

  return (
    <React.Fragment>
      <Grid size={{ xs: 6 }}>
        <Typography variant="body2" sx={{ pb: 4 }}>
          Event Filters*
        </Typography>
        <Box sx={{ pb: 4 }}>
          <ThemedToggleButton
            aria-label="Events Filter Button"
            value="events"
            selected={eventFilter.includes('events')}
            onChange={() => setEventFilter('events')}
            sx={{ borderRadius: 2, width: '48%' }}
          >
            {eventFilter.includes('events') && (
              <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="events-checked" />
            )}
            Events
          </ThemedToggleButton>
          <ThemedToggleButton
            aria-label="Task Numbers Filter Button"
            value="task-numers"
            selected={eventFilter.includes('task-numbers')}
            onChange={() => setEventFilter('task-numbers')}
            sx={{ mr: 2, borderRadius: 2, width: '48%' }}
          >
            {eventFilter.includes('task-numbers') && (
              <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="task-numbers-checked" />
            )}
            Task Numbers
          </ThemedToggleButton>
        </Box>
      </Grid>
      <Grid size={{ xs: 6 }} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ width: '100%', pr: 4 }}>
          <Typography variant="body2" sx={{ pb: 2 }}>
            Unit*
          </Typography>
          <Box sx={{ pb: 4 }}>
            <UnitSelect
              units={units ?? []}
              onChange={(unit: IUnitBrief) => setReportUnit(unit)}
              value={reportUnit}
              readOnly={false}
              width="100%"
              label="Unit"
              displayEmpty
            />
          </Box>
          <PmxDropdown
            multiple
            options={Object.values(MONTHS)}
            value={eventBirthMonths}
            shrinkLabel
            label="Birth Month*"
            onChange={(value: string | string[]) => {
              if (Array.isArray(value)) {
                setEventBirthMonths(value);
              } else {
                setEventBirthMonths([value]);
              }
            }}
          />

          <Typography sx={{ py: 4 }} variant="body2">
            Date Range in Days*
          </Typography>
          <ButtonGroup variant="contained" disabled={useCustomDateRange} sx={{ width: '100%' }}>
            <ThemedToggleButton
              aria-label="30-days"
              value="30"
              selected={eventDateRange === 30}
              onChange={() => setEventDateRange(30)}
              disabled={useCustomDateRange}
              sx={{ borderRadius: 0, borderTopLeftRadius: 2, borderBottomLeftRadius: 2 }}
            >
              30
            </ThemedToggleButton>
            <ThemedToggleButton
              aria-label="90-days"
              value="90"
              selected={eventDateRange === 90}
              onChange={() => setEventDateRange(90)}
              disabled={useCustomDateRange}
              sx={{ borderRadius: 0 }}
            >
              90
            </ThemedToggleButton>
            <ThemedToggleButton
              aria-label="180-days"
              value="180"
              selected={eventDateRange === 180}
              onChange={() => setEventDateRange(180)}
              disabled={useCustomDateRange}
              sx={{ borderRadius: 0 }}
            >
              180
            </ThemedToggleButton>
            <ThemedToggleButton
              aria-label="365-days"
              value="365"
              selected={eventDateRange === 365}
              onChange={() => setEventDateRange(365)}
              disabled={useCustomDateRange}
              sx={{ borderRadius: 0 }}
            >
              365
            </ThemedToggleButton>
            <ThemedToggleButton
              aria-label="all-days"
              value="all"
              selected={eventDateRange === 'all'}
              onChange={() => setEventDateRange('all')}
              disabled={useCustomDateRange}
              sx={{ borderRadius: 0, borderTopRightRadius: 2, borderBottomRightRadius: 2 }}
            >
              ALL
            </ThemedToggleButton>
          </ButtonGroup>

          <FormControlLabel
            control={
              <Checkbox
                checked={useCustomDateRange}
                onClick={() => {
                  setUseCustomDateRange((prev) => !prev);
                  setEventDateRange('');
                }}
              />
            }
            label="Custom"
            sx={{ pt: 2, pl: 2 }}
          />

          {useCustomDateRange && (
            <Box sx={{ py: 4 }}>
              <DualDateRangePicker
                defaultStartDate={customDateRange.startDate}
                defaultEndDate={customDateRange.endDate}
                onDateRangeChange={(_valid, startDate, endDate) => {
                  setCustomDateRange({ startDate: startDate!.date(15), endDate: endDate!.date(16) });
                }}
                views={['month', 'year']}
                format={'MM/YYYY'}
                sx={{ my: -3 }}
              />
            </Box>
          )}
        </Box>
        <Divider orientation="vertical" sx={{ mr: -1 }} />
      </Grid>
      <Grid size={{ xs: 6 }} display="flex" flexDirection={'column'}>
        {eventFilter === 'events' && (
          <Box>
            <Typography variant="body2" sx={{ pb: 4 }}>
              Event Type*
            </Typography>
            <Box sx={{ mt: 'auto', pb: 4 }}>
              <ThemedToggleButton
                aria-label="Event Evaluations"
                value="evaluations"
                selected={eventTypeFilters.includes('evaluations')}
                onChange={() =>
                  setEventTypeFilters((prev) =>
                    prev.includes('evaluations')
                      ? prev.filter((viewBy) => viewBy !== 'evaluations')
                      : [...prev, 'evaluations'],
                  )
                }
                sx={{ borderRadius: 2, mr: 2 }}
              >
                {eventTypeFilters.includes('evaluations') && (
                  <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="evaluations-checked" />
                )}
                Evaluations
              </ThemedToggleButton>
              <ThemedToggleButton
                aria-label="Event Trainings"
                value="trainings"
                selected={eventTypeFilters.includes('trainings')}
                onChange={() =>
                  setEventTypeFilters((prev) =>
                    prev.includes('trainings')
                      ? prev.filter((viewBy) => viewBy !== 'trainings')
                      : [...prev, 'trainings'],
                  )
                }
                sx={{ mr: 2, borderRadius: 2 }}
              >
                {eventTypeFilters.includes('trainings') && (
                  <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="trainings-checked" />
                )}
                Trainings
              </ThemedToggleButton>
            </Box>
            <Box display="flex" alignItems={'center'}>
              <Typography variant="body2" sx={{ pr: 4 }}>
                View By Completion*:
              </Typography>
              <Box sx={{ mt: 'auto' }}>
                <ThemedToggleButton
                  aria-label="Complete Event"
                  value="complete"
                  selected={eventCompletionFilters.includes('complete')}
                  onChange={() =>
                    setEventCompletionFilters((prev) =>
                      prev.includes('complete')
                        ? prev.filter((viewBy) => viewBy !== 'complete')
                        : [...prev, 'complete'],
                    )
                  }
                  sx={{ borderRadius: 2, mr: 2 }}
                >
                  {eventCompletionFilters.includes('complete') && (
                    <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="evaluations-checked" />
                  )}
                  Complete
                </ThemedToggleButton>
                <ThemedToggleButton
                  aria-label="Incomplete Event"
                  value="incomplete"
                  selected={eventCompletionFilters.includes('incomplete')}
                  onChange={() =>
                    setEventCompletionFilters((prev) =>
                      prev.includes('incomplete')
                        ? prev.filter((viewBy) => viewBy !== 'incomplete')
                        : [...prev, 'incomplete'],
                    )
                  }
                  sx={{ mr: 2, borderRadius: 2 }}
                >
                  {eventCompletionFilters.includes('incomplete') && (
                    <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="trainings-checked" />
                  )}
                  Incomplete
                </ThemedToggleButton>
              </Box>
            </Box>
            <Divider sx={{ pt: 4 }} />
            {eventTypeFilters.includes('evaluations') && (
              <Box sx={{ py: 4 }}>
                <PmxDropdown
                  multiple
                  renderChips
                  options={['Annual', 'CDR', 'No Notice'].flatMap((val) => ({ label: val, value: val }))}
                  value={selectedEvaluations}
                  label="Evaluation Type*"
                  onChange={(value: string | string[]) => {
                    if (Array.isArray(value)) {
                      setSelectedEvaluations(value);
                    } else {
                      setSelectedEvaluations([value]);
                    }
                  }}
                />
              </Box>
            )}
            {eventTypeFilters.includes('trainings') && (
              <PmxDropdown
                multiple
                renderChips
                options={trainingTypes?.flatMap((type) => ({ label: type.type, value: type.type })) || []}
                value={selectedTrainings}
                label="Training Type*"
                onChange={(value: string | string[]) => {
                  if (Array.isArray(value)) {
                    setSelectedTrainings(value);
                  } else {
                    setSelectedTrainings([value]);
                  }
                }}
              />
            )}
          </Box>
        )}
        {eventFilter === 'task-numbers' && (
          <PmxDropdown
            multiple
            renderChips
            options={taskNumberOptions}
            value={selectedTasks}
            label="Tasks"
            onChange={(value: string | string[]) => {
              if (Array.isArray(value)) {
                setSelectedTasks(value);
              } else {
                setSelectedTasks([value]);
              }
            }}
          />
        )}
      </Grid>
      <Grid size={{ xs: 12 }} display={'flex'} justifyContent={'end'}>
        <Button variant="contained" onClick={() => generateUnitTrackerReport()} disabled={!canGenerateReport}>
          Generate
        </Button>
      </Grid>
    </React.Fragment>
  );
};
