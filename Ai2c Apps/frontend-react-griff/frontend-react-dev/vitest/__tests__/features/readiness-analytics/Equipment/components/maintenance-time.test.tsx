import { describe, expect, it } from 'vitest';

import { render } from '@testing-library/react';

import MaintenanceTime from '@features/readiness-analytics/Equipment/maintenance-time';

describe('MaintenanceTime Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<MaintenanceTime />);
    expect(container).toBeTruthy();
  });

  it('renders with empty data', () => {
    const { getByText } = render(<MaintenanceTime />);
    expect(getByText('Placeholder for the component no data')).toBeInTheDocument();
  });

  it('renders with data', () => {
    const testData = 'Test Data';
    const { getByText } = render(<MaintenanceTime data={testData} />);
    expect(getByText(`Placeholder for the component ${testData}`)).toBeInTheDocument();
  });
});
