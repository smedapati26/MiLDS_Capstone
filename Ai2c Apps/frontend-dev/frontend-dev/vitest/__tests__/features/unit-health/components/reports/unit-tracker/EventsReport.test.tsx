import { MemoryRouter } from 'react-router-dom';
import { describe, it } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';
import { mockEventReportSoldierData } from 'vitest/mocks/handlers/unit-health/unit-report-data/mock_data';

import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import { Column } from '@components/PmxTable';
import { EventsReport } from '@features/unit-health/components/reports/unit-tracker/EventsReport';
import { UnitEventsReportColumns } from '@features/unit-health/constants';
import { IEventReportSoldier, mapToIEventReportSoldier } from '@store/amap_ai/unit_health';

describe('EventsReport Test', () => {
  it('renders nothing with no report data', () => {
    renderWithProviders(
      <MemoryRouter>
        <EventsReport
          reportTitle="Report Table"
          filterValue=""
          reportColumns={UnitEventsReportColumns as Column<IEventReportSoldier>[]}
          reportData={undefined}
          reportEvents={['Test Eval', 'Test Train']}
          setFilterValue={() => {}}
        />
      </MemoryRouter>,
    );

    const eventsTable = screen.queryByLabelText('Events Report Table');
    const dateButton = screen.queryByRole('button', { name: 'Latest Date View By Button' });
    const countButton = screen.queryByRole('button', { name: 'Total Count View By Button' });

    expect(eventsTable).not.toBeInTheDocument();
    expect(dateButton).not.toBeInTheDocument();
    expect(countButton).not.toBeInTheDocument();
  });

  it('renders the components correctly', async () => {
    renderWithProviders(
      <MemoryRouter>
        <EventsReport
          reportTitle="Report Table"
          filterValue=""
          reportColumns={UnitEventsReportColumns as Column<IEventReportSoldier>[]}
          reportData={mockEventReportSoldierData.map(mapToIEventReportSoldier)}
          reportEvents={['Test Eval', 'Test Train']}
          setFilterValue={() => {}}
        />
      </MemoryRouter>,
    );

    const eventsTable = screen.getByLabelText('Events Report Table');
    const dateButton = screen.getByRole('button', { name: 'Latest Date View By Button' });
    const dateButtonCheck = screen.getByLabelText('date-checked');
    const countButton = screen.getByRole('button', { name: 'Total Count View By Button' });
    const searchFilter = screen.getByRole('textbox');
    const table = screen.getByRole('table');
    const tableDate = within(table).getByText(mockEventReportSoldierData[0].events[0].date);

    expect(eventsTable).toBeInTheDocument();
    expect(dateButton).toBeInTheDocument();
    expect(dateButtonCheck).toBeInTheDocument();
    expect(countButton).toBeInTheDocument();
    expect(searchFilter).toBeInTheDocument();
    expect(table).toBeInTheDocument();
    expect(tableDate).toBeInTheDocument();

    await waitFor(() => {
      fireEvent.click(countButton);

      const table = screen.getByRole('table');
      const tableCount = within(table).getByText(mockEventReportSoldierData[0].events[0].occurences!.length);

      expect(table).toBeInTheDocument();
      expect(tableCount).toBeInTheDocument();
    });
  });
});
