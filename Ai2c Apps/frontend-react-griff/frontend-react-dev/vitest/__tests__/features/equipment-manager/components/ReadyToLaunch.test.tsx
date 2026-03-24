import { render, screen } from '@testing-library/react';

import ReadyToLaunch from '@features/equipment-manager/components/ReadyToLaunch';

describe('ReadyToLaunch', () => {
  it('renders the title and value', () => {
    render(<ReadyToLaunch title="Status" value="Ready" />);
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('sets the correct data-testid', () => {
    render(<ReadyToLaunch title="LaunchPad" value="A1" />);
    expect(screen.getByTestId('ready-to-launch-LaunchPad')).toBeInTheDocument();
  });

  it('renders with different values', () => {
    render(<ReadyToLaunch title="Fuel" value="Full" />);
    expect(screen.getByText('Fuel')).toBeInTheDocument();
    expect(screen.getByText('Full')).toBeInTheDocument();
  });
});
