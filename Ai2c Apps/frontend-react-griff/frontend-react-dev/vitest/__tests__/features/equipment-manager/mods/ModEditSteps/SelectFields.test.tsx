// src/tests/StepOneContent.test.tsx
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SelectFieldsStep, { ModEditStepsEnum } from '@features/equipment-manager/mods/ModEditSteps/SelectFields';


const mockSteps = [ModEditStepsEnum.SELECT, ModEditStepsEnum.REVIEW];
const mockSetSteps = vi.fn();

describe('SelectFieldsStep Test', () => {

  beforeEach(() => {
    render(<SelectFieldsStep steps={mockSteps} setSteps={mockSetSteps} />);
  });

  it('should render all three checkboxes with their labels', () => {
    expect(screen.getByLabelText('Assigned Aircraft')).toBeInTheDocument();
    expect(screen.getByLabelText('Variable and Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Remarks')).toBeInTheDocument();
  });

  it('should call setSteps with the correct values when "Assigned Aircraft" checkbox is clicked', async () => {
    const aircraftAssignmentCheckbox = screen.getByLabelText('Assigned Aircraft');
    
    await userEvent.click(aircraftAssignmentCheckbox);
    expect(mockSetSteps).toHaveBeenCalled();
  });
  
  it('should call setSteps with the correct values when "Variable and Status" checkbox is clicked', async () => {
    const variableAndStatusCheckbox = screen.getByLabelText('Variable and Status');
    
    await userEvent.click(variableAndStatusCheckbox);
    expect(mockSetSteps).toHaveBeenCalled();
  });

  it('should call setSteps with the correct values when "Remarks" checkbox is clicked', async () => {
    const remarksCheckbox = screen.getByLabelText('Remarks');
    
    await userEvent.click(remarksCheckbox);
    expect(mockSetSteps).toHaveBeenCalled();
  });
});
