import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditVariableAndStatusStep from '@features/equipment-manager/mods/ModEditSteps/EditVariableAndStatus';

import { TrackingVariableOptions } from '@store/griffin_api/mods/models';

const mockTrackingVariable =  TrackingVariableOptions.STATUS.value;
const mockSetTrackingVariable = vi.fn();
const mockValue = 'FMC';
const mockSetValue = vi.fn();


describe('EditVariableAndStatus Test', () => {

  beforeEach(() => {
    mockSetTrackingVariable.mockClear();
    mockSetValue.mockClear();
    render(<EditVariableAndStatusStep trackingVariable={mockTrackingVariable} setTrackingVariable={mockSetTrackingVariable} value={mockValue} setValue={mockSetValue}/>);
  });

  it('should render all components with their labels and correct starting values', () => {
    const trackingVarSelect = screen.getByTestId('tracking-var-select-input');
    expect(trackingVarSelect).toBeInTheDocument();
    expect(trackingVarSelect).toHaveValue(mockTrackingVariable);

    expect(screen.getByText('FMC')).toBeInTheDocument();
    expect(screen.getByText('PMC')).toBeInTheDocument();
    expect(screen.getByText('NMC')).toBeInTheDocument();
    expect(screen.getByText('DADE')).toBeInTheDocument();
  });

  
  it('should call setters with the correct values when variable and value are updated', async () => {
    const select = screen.getByRole('combobox', {name: 'Tracking Variable'});
    await userEvent.click(select);

    const installOption = screen.getByRole('option', { name: 'Install' });
    await userEvent.click(installOption);

    expect(mockSetValue).toHaveBeenCalledWith('');
    expect(mockSetTrackingVariable).toHaveBeenCalledWith(TrackingVariableOptions.INSTALL.value);
  });

  it('should call set with the correct values when just value is updated', async () => {
    const fmcButton = screen.getByText('FMC');
    const pmcButton = screen.getByText('PMC');
    const nmcButton = screen.getByText('NMC');
    const dadeButton = screen.getByText('DADE');
  
    expect(fmcButton).toHaveAttribute('aria-pressed', 'true');
    expect(pmcButton).toHaveAttribute('aria-pressed', 'false');
    expect(nmcButton).toHaveAttribute('aria-pressed', 'false');
    expect(dadeButton).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(nmcButton);
    expect(mockSetValue).toHaveBeenCalled();
    expect(mockSetTrackingVariable).not.toHaveBeenCalled();
  });
});
