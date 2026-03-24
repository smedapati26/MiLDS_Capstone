import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditAircraftStatusStep from '@features/equipment-manager/aircraft/AircraftEditSteps/EditAircraftStatus';
import { LaunchStatusEnum } from '@models/LaunchStatusEnum';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

const mockLaunchStatus = LaunchStatusEnum.RTL;
const mockSetLaunchStatus = vi.fn();
const mockORStatus = OperationalReadinessStatusEnum.FMC;
const mockSetORStatus = vi.fn();
const mockAutoSync = {
  rtl: true,
  status: true,
  location: true,
  remarks: true,
};
const mockSetAutoSync = vi.fn();

describe('EditAircraftStatus Test', () => {
  beforeEach(() => {
    render(
      <EditAircraftStatusStep
        launchStatus={mockLaunchStatus}
        setLaunchStatus={mockSetLaunchStatus}
        ORStatus={mockORStatus}
        setORStatus={mockSetORStatus}
        autoSync={mockAutoSync}
        setAutoSync={mockSetAutoSync}
      />,
    );
  });

  it('should render all components with their labels', () => {
    expect(screen.getByText('RTL')).toBeInTheDocument();
    expect(screen.getByText('NRTL')).toBeInTheDocument();

    expect(screen.getByText('FMC')).toBeInTheDocument();
    expect(screen.getByText('PMCM')).toBeInTheDocument();
    expect(screen.getByText('PMCS')).toBeInTheDocument();
    expect(screen.getByText('NMCS')).toBeInTheDocument();
    expect(screen.getByText('NMCM')).toBeInTheDocument();
    expect(screen.getByText('DADE')).toBeInTheDocument();

    expect(screen.getByLabelText('Auto-sync launch status for all selected aircraft')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Auto-sync operational readiness status for all selected aircraft'),
    ).toBeInTheDocument();
  });

  it('should call setLaunchStatus with the correct values when launch status is updated', async () => {
    const rtlButton = screen.getByText('RTL');
    const nrtlButton = screen.getByText('NRTL');

    expect(rtlButton).toHaveAttribute('aria-pressed', 'true');
    expect(nrtlButton).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(nrtlButton);
    expect(mockSetLaunchStatus).toHaveBeenCalled();
  });

  it('should call setLaunchStatus with the correct values when OR status is updated', async () => {
    const fmcButton = screen.getByText('FMC');
    const pmcButton = screen.getByText('PMCM');
    const nmcButton = screen.getByText('NMCM');
    const dadeButton = screen.getByText('DADE');

    expect(fmcButton).toHaveAttribute('aria-pressed', 'true');
    expect(pmcButton).toHaveAttribute('aria-pressed', 'false');
    expect(nmcButton).toHaveAttribute('aria-pressed', 'false');
    expect(dadeButton).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(pmcButton);
    expect(mockSetORStatus).toHaveBeenCalled();
  });

  it('should call setAutoSync with the correct values when launch auto-sync checkbox is clicked', async () => {
    const autoSyncCheckbox = screen.getByLabelText('Auto-sync launch status for all selected aircraft');
    expect(autoSyncCheckbox).toBeChecked();

    await userEvent.click(autoSyncCheckbox);
    expect(mockSetAutoSync).toHaveBeenCalled();
  });

  it('should call setAutoSync with the correct values when OR auto-sync checkbox is clicked', async () => {
    const autoSyncCheckbox = screen.getByLabelText('Auto-sync operational readiness status for all selected aircraft');
    expect(autoSyncCheckbox).toBeChecked();

    await userEvent.click(autoSyncCheckbox);
    expect(mockSetAutoSync).toHaveBeenCalled();
  });
});
