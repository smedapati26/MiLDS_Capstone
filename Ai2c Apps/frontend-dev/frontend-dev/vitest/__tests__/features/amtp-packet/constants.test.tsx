/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, expect, it } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';

import { criticalTaskCols, maintainerRecordCols, supportingDocumentsCols } from '@features/amtp-packet/constants';
import { IDa7817s } from '@store/amap_ai/events';

// Setup
const theme = createTheme();

describe('Table Columns', () => {
  // Critical Task Columns Tests
  describe('criticalTaskCols', () => {
    it('renders task title and triggers download on click', () => {
      const handleDownload = vi.fn();

      const columns = criticalTaskCols(theme, handleDownload);

      const { getByText } = render(
        <ThemeProvider theme={theme}>
          {columns
            .find((col) => col.field === 'taskTitle')
            ?.renderCell?.('Sample Task', {
              documentLink: 'http://example.com',
              taskTitle: 'Sample Task',
              taskNumber: '12345',
              ictlIctlTitle: '',
              frequency: '',
              subjectArea: '',
              skillLevel: '',
              mos: '',
              lastTrained: null,
              lastTrainedId: null,
              lastEvaluated: null,
              lastEvaluatedById: null,
              nextDue: null,
            })}
        </ThemeProvider>,
      );

      const link = getByText('Sample Task');

      expect(link).toBeInTheDocument();
    });

    it('renders nextDue with appropriate styling', () => {
      const columns = criticalTaskCols(theme);
      const { container } = render(
        <ThemeProvider theme={theme}>
          {columns
            .find((col) => col.field === 'nextDue')
            ?.renderCell?.('2025-06-01', {
              documentLink: 'http://example.com',
              taskTitle: 'Sample Task',
              ictlIctlTitle: '',
              taskNumber: '',
              frequency: '',
              subjectArea: '',
              skillLevel: '',
              mos: '',
              lastTrained: null,
              lastTrainedId: null,
              lastEvaluated: null,
              lastEvaluatedById: null,
              nextDue: null,
            })}
        </ThemeProvider>,
      );

      expect(container.querySelector('span')).toHaveTextContent(/days$/);
    });
  });

  // Maintainer Record Columns Tests
  describe('maintainerRecordCols', () => {
    it('renders event info correctly', () => {
      const columns = maintainerRecordCols;
      const { container } = render(
        columns
          .find((col) => col.field === 'evaluationType')
          ?.renderCell?.('' as string & { number: string; name: string; goNoGo: string }[], {
            eventType: 'Training',
            evaluationType: 'Exam',
            awardType: null,
            tcsLocation: null,
            trainingType: null,
            // @ts-expect-error
            gainingUnit: { displayName: 'Unit 123' },
          }),
      );

      expect(container.textContent).toBe('Training - Exam');
    });

    it('renders associated tasks correctly', () => {
      const columns = maintainerRecordCols;
      const { container } = render(
        columns
          .find((col) => col.field === 'eventTasks')
          ?.renderCell?.(
            [
              //@ts-expect-error
              { number: '1234', name: 'Task A', goNoGo: 'GO' },
              //@ts-expect-error
              { number: '56789', name: 'Task B', goNoGo: 'NOGO' },
            ],
            {},
          ),
      );

      expect(container.querySelectorAll('li')).toHaveLength(0);
    });

    it('renders go/nogo values correctly', () => {
      const columns = maintainerRecordCols;
      const { container } = render(
        columns
          .find((col) => col.field === 'goNogo')
          ?.renderCell?.('GO' as string & { number: string; name: string; goNoGo: string }[], {} as IDa7817s),
      );

      expect(container.textContent).toBe('GO');
    });
  });

  // Supporting Documents Columns Tests
  describe('supportingDocumentsCols', () => {
    it('renders associated event correctly', () => {
      const columns = supportingDocumentsCols();
      const { container } = render(
        columns
          .find((col) => col.field === 'relatedEvent')
          ?.renderCell?.({
            date: '2025-05-30',
            eventType: 'Exam',
            eventSubType: 'Final',
            id: 0,
          }),
      );

      expect(container.querySelector('a')).toHaveTextContent('2025-05-30 - Exam - Final');
    });

    it('renders fallback when event data is missing', () => {
      const columns = supportingDocumentsCols();
      const { container } = render(columns.find((col) => col.field === 'relatedEvent')?.renderCell?.(null));

      expect(container.textContent).toBe('--');
    });
  });
});
