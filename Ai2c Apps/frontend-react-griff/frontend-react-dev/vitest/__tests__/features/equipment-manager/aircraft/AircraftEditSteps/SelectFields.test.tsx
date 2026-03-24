// src/tests/StepOneContent.test.tsx
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SelectFieldsStep, { AircraftEditStepsEnum } from '@features/equipment-manager/aircraft/AircraftEditSteps/SelectFields';


const mockSteps = [AircraftEditStepsEnum.SELECT, AircraftEditStepsEnum.REVIEW];
const mockSetSteps = vi.fn();

describe('SelectFieldsStep Test', () => {

  beforeEach(() => {
    render(<SelectFieldsStep steps={mockSteps} setSteps={mockSetSteps} />);
  });

  it('should render all three checkboxes with their labels', () => {
    expect(screen.getByLabelText('Aircraft Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Remarks')).toBeInTheDocument();
  });

  it('should call setSteps with the correct values when "Aircraft Status" checkbox is clicked', async () => {
    const aircraftStatusCheckbox = screen.getByLabelText('Aircraft Status');
    
    await userEvent.click(aircraftStatusCheckbox);
    expect(mockSetSteps).toHaveBeenCalled();
  });
  
  it('should call setSteps with the correct values when "Location" checkbox is clicked', async () => {
    const locationCheckbox = screen.getByLabelText('Location');
    
    await userEvent.click(locationCheckbox);
    expect(mockSetSteps).toHaveBeenCalled();
  });
  
  it('should call setSteps with the correct values when "Remarks" checkbox is clicked', async () => {
    const remarksCheckbox = screen.getByLabelText('Remarks');
    
    await userEvent.click(remarksCheckbox);
    expect(mockSetSteps).toHaveBeenCalled();
  });
});
