import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import { MaintenanceTitle } from '@features/equipment-manager/aircraft/components/MaintenanceTitle';

describe('MaintenanceTitle', () => {
  it('should render maintenance details correctly', () => {
    const maintenance = {
      eventStart: '2023-10-01',
      eventEnd: '2023-10-10',
      lane: 'Lane 1',
      name: 'test',
    };

    render(<MaintenanceTitle title="Maintenance Event" tillDue={100} maintenance={maintenance} />);

    expect(screen.getByText('Maintenance Event')).toBeInTheDocument();
    expect(screen.getByText('Hours to Event:')).toBeInTheDocument();
    expect(screen.getByText('100 hours')).toBeInTheDocument();
    expect(screen.getByText('Date:')).toBeInTheDocument();
    expect(screen.getByText('10/01/2023 - 10/10/2023')).toBeInTheDocument();
    expect(screen.getByText('Lane')).toBeInTheDocument();
    expect(screen.getByText('Lane 1')).toBeInTheDocument();
  });

  it('should render "Not yet scheduled" and "-" when maintenance is null', () => {
    render(<MaintenanceTitle title="Maintenance Event" tillDue={100} maintenance={null} />);

    expect(screen.getByText('Maintenance Event')).toBeInTheDocument();
    expect(screen.getByText('Hours to Event:')).toBeInTheDocument();
    expect(screen.getByText('100 hours')).toBeInTheDocument();
    expect(screen.getByText('Date:')).toBeInTheDocument();
    expect(screen.getByText('Not yet scheduled')).toBeInTheDocument();
    expect(screen.getByText('Lane')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
