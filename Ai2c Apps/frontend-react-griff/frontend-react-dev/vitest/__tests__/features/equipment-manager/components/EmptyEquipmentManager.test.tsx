/* eslint-disable @typescript-eslint/no-explicit-any */

import { render, screen } from '@testing-library/react';

import EmptyEquipmentManager from '@features/equipment-manager/components/EmptyEquipmentManager';

// Mock AirframeIcon to avoid dependency issues
vi.mock('@components/AirframeIcon', () => ({
  AirframeIcon: (props: any) => <div data-testid="airframe-icon" {...props} />,
}));

describe('EmptyEquipmentManager', () => {
  it('renders with default label "aircraft"', () => {
    render(<EmptyEquipmentManager />);
    expect(screen.getByTestId('em-empty-data')).toBeInTheDocument();
    expect(screen.getByText(/No aircraft found/i)).toBeInTheDocument();
    expect(screen.getByText(/Aircraft and equipment details/i)).toBeInTheDocument();
    expect(screen.getByTestId('airframe-icon')).toBeInTheDocument();
  });

  it('renders with label "UAS"', () => {
    render(<EmptyEquipmentManager label="UAS" />);
    expect(screen.getByText(/No UAS found/i)).toBeInTheDocument();
  });

  it('renders with label "AGSE"', () => {
    render(<EmptyEquipmentManager label="AGSE" />);
    expect(screen.getByText(/No AGSE found/i)).toBeInTheDocument();
  });

  it('renders the static description text', () => {
    render(<EmptyEquipmentManager />);
    expect(
      screen.getByText(/Aircraft and equipment details of the selected unit will display here/i),
    ).toBeInTheDocument();
  });

  it('renders the Paper with correct test id', () => {
    render(<EmptyEquipmentManager />);
    expect(screen.getByTestId('em-empty-data')).toBeInTheDocument();
  });
});
