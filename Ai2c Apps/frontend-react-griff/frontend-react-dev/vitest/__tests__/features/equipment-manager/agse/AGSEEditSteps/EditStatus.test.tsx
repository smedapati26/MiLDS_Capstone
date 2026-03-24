import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditStatusStep from '@features/equipment-manager/agse/AGSEEditSteps/EditStatus';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

const mockORStatus = OperationalReadinessStatusEnum.FMC;
const mockSetORStatus = vi.fn();
const mockAutoSync = {
  status: true,
  location: true,
};
const mockSetAutoSync = vi.fn();


describe('EditStatus Test', () => {

  beforeEach(() => {
    render(<EditStatusStep ORStatus={mockORStatus} setORStatus={mockSetORStatus} autoSync={mockAutoSync} setAutoSync={mockSetAutoSync} />);
  });

  it('should render all components with their labels', () => {
    expect(screen.getByText('FMC')).toBeInTheDocument();
    expect(screen.getByText('PMC')).toBeInTheDocument();
    expect(screen.getByText('NMC')).toBeInTheDocument();
    expect(screen.getByText('DADE')).toBeInTheDocument();

    expect(screen.getByLabelText('Auto-sync operational readiness status for all selected aircraft')).toBeInTheDocument();
  });

  it('should call setLaunchStatus with the correct values when OR status is updated', async () => {
    const fmcButton = screen.getByText('FMC');
    const pmcButton = screen.getByText('PMC');
    const nmcButton = screen.getByText('NMC');
    const dadeButton = screen.getByText('DADE');
  
    expect(fmcButton).toHaveAttribute('aria-pressed', 'true');
    expect(pmcButton).toHaveAttribute('aria-pressed', 'false');
    expect(nmcButton).toHaveAttribute('aria-pressed', 'false');
    expect(dadeButton).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(pmcButton);
    expect(mockSetORStatus).toHaveBeenCalled();
  });
  
  it('should call setAutoSync with the correct values when OR auto-sync checkbox is clicked', async () => {
    const autoSyncCheckbox = screen.getByLabelText('Auto-sync operational readiness status for all selected aircraft');
    expect(autoSyncCheckbox).toBeChecked();

    await userEvent.click(autoSyncCheckbox);
    expect(mockSetAutoSync).toHaveBeenCalled();
  });
});
