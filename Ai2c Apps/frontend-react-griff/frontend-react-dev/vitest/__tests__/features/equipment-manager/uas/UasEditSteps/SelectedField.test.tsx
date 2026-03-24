import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MultiStepProvider, SelectFieldsStep, UasEditStepsEnum } from '@features/equipment-manager/uas/UasEditSteps';

describe('SelectFieldsStep', () => {
  const mockSetSteps = vi.fn();

  beforeEach(() => {
    mockSetSteps.mockClear();
  });

  // Wrapper for UAV type
  const SelectFieldsStepUavWrapper = ({ initialSteps = [] }: { initialSteps?: UasEditStepsEnum[] } = {}) => {
    const [steps, setSteps] = React.useState<UasEditStepsEnum[]>([
      UasEditStepsEnum.SELECT,
      UasEditStepsEnum.REVIEW,
      ...initialSteps,
    ]);

    return (
      <MultiStepProvider>
        <SelectFieldsStep steps={steps} setSteps={setSteps} uasType="Uav" />
      </MultiStepProvider>
    );
  };

  // Wrapper for UAC type
  const SelectFieldsStepUacWrapper = ({ initialSteps = [] }: { initialSteps?: UasEditStepsEnum[] } = {}) => {
    const [steps, setSteps] = React.useState<UasEditStepsEnum[]>([
      UasEditStepsEnum.SELECT,
      UasEditStepsEnum.REVIEW,
      ...initialSteps,
    ]);

    return (
      <MultiStepProvider>
        <SelectFieldsStep steps={steps} setSteps={setSteps} uasType="Uac" />
      </MultiStepProvider>
    );
  };

  describe('Rendering - UAV Type', () => {
    it('should render the component for UAV', () => {
      render(<SelectFieldsStepUavWrapper />);

      expect(screen.getByText('Select which fields you want to edit.')).toBeInTheDocument();
    });

    it('should render UAV Status checkbox', () => {
      render(<SelectFieldsStepUavWrapper />);

      expect(screen.getByRole('checkbox', { name: 'UAV Status' })).toBeInTheDocument();
    });

    it('should render Period Hrs checkbox for UAV', () => {
      render(<SelectFieldsStepUavWrapper />);

      expect(screen.getByRole('checkbox', { name: 'Period Hrs' })).toBeInTheDocument();
    });

    it('should render Location checkbox', () => {
      render(<SelectFieldsStepUavWrapper />);

      expect(screen.getByRole('checkbox', { name: 'Location' })).toBeInTheDocument();
    });

    it('should render Remarks checkbox', () => {
      render(<SelectFieldsStepUavWrapper />);

      expect(screen.getByRole('checkbox', { name: 'Remarks' })).toBeInTheDocument();
    });

    it('should render all four checkboxes for UAV', () => {
      render(<SelectFieldsStepUavWrapper />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(4);
    });
  });

  describe('Rendering - UAC Type', () => {
    it('should render the component for UAC', () => {
      render(<SelectFieldsStepUacWrapper />);

      expect(screen.getByText('Select which fields you want to edit.')).toBeInTheDocument();
    });

    it('should render Operational Readiness Status checkbox', () => {
      render(<SelectFieldsStepUacWrapper />);

      expect(screen.getByRole('checkbox', { name: 'Operational Readiness Status' })).toBeInTheDocument();
    });

    it('should not render Period Hrs checkbox for UAC', () => {
      render(<SelectFieldsStepUacWrapper />);

      expect(screen.queryByRole('checkbox', { name: 'Period Hrs' })).not.toBeInTheDocument();
    });

    it('should render Location checkbox for UAC', () => {
      render(<SelectFieldsStepUacWrapper />);

      expect(screen.getByRole('checkbox', { name: 'Location' })).toBeInTheDocument();
    });

    it('should render Remarks checkbox for UAC', () => {
      render(<SelectFieldsStepUacWrapper />);

      expect(screen.getByRole('checkbox', { name: 'Remarks' })).toBeInTheDocument();
    });

    it('should render three checkboxes for UAC', () => {
      render(<SelectFieldsStepUacWrapper />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });
  });

  describe('Initial State - UAV', () => {
    it('should have all checkboxes unchecked by default', () => {
      render(<SelectFieldsStepUavWrapper />);

      const statusCheckbox = screen.getByRole('checkbox', { name: 'UAV Status' }) as HTMLInputElement;
      const periodCheckbox = screen.getByRole('checkbox', { name: 'Period Hrs' }) as HTMLInputElement;
      const locationCheckbox = screen.getByRole('checkbox', { name: 'Location' }) as HTMLInputElement;
      const remarksCheckbox = screen.getByRole('checkbox', { name: 'Remarks' }) as HTMLInputElement;

      expect(statusCheckbox.checked).toBe(false);
      expect(periodCheckbox.checked).toBe(false);
      expect(locationCheckbox.checked).toBe(false);
      expect(remarksCheckbox.checked).toBe(false);
    });

    it('should have status checkbox checked if STATUS step is in initial steps', () => {
      render(<SelectFieldsStepUavWrapper initialSteps={[UasEditStepsEnum.STATUS]} />);

      const statusCheckbox = screen.getByRole('checkbox', { name: 'UAV Status' }) as HTMLInputElement;
      expect(statusCheckbox.checked).toBe(true);
    });

    it('should have period checkbox checked if PERIOD step is in initial steps', () => {
      render(<SelectFieldsStepUavWrapper initialSteps={[UasEditStepsEnum.PERIOD]} />);

      const periodCheckbox = screen.getByRole('checkbox', { name: 'Period Hrs' }) as HTMLInputElement;
      expect(periodCheckbox.checked).toBe(true);
    });

    it('should have location checkbox checked if LOCATION step is in initial steps', () => {
      render(<SelectFieldsStepUavWrapper initialSteps={[UasEditStepsEnum.LOCATION]} />);

      const locationCheckbox = screen.getByRole('checkbox', { name: 'Location' }) as HTMLInputElement;
      expect(locationCheckbox.checked).toBe(true);
    });

    it('should have remarks checkbox checked if REMARKS step is in initial steps', () => {
      render(<SelectFieldsStepUavWrapper initialSteps={[UasEditStepsEnum.REMARKS]} />);

      const remarksCheckbox = screen.getByRole('checkbox', { name: 'Remarks' }) as HTMLInputElement;
      expect(remarksCheckbox.checked).toBe(true);
    });

    it('should have multiple checkboxes checked if multiple steps are in initial steps', () => {
      render(
        <SelectFieldsStepUavWrapper
          initialSteps={[UasEditStepsEnum.STATUS, UasEditStepsEnum.PERIOD, UasEditStepsEnum.REMARKS]}
        />,
      );

      const statusCheckbox = screen.getByRole('checkbox', { name: 'UAV Status' }) as HTMLInputElement;
      const periodCheckbox = screen.getByRole('checkbox', { name: 'Period Hrs' }) as HTMLInputElement;
      const remarksCheckbox = screen.getByRole('checkbox', { name: 'Remarks' }) as HTMLInputElement;

      expect(statusCheckbox.checked).toBe(true);
      expect(periodCheckbox.checked).toBe(true);
      expect(remarksCheckbox.checked).toBe(true);
    });
  });

  describe('Initial State - UAC', () => {
    it('should have all checkboxes unchecked by default', () => {
      render(<SelectFieldsStepUacWrapper />);

      const statusCheckbox = screen.getByRole('checkbox', {
        name: 'Operational Readiness Status',
      }) as HTMLInputElement;
      const locationCheckbox = screen.getByRole('checkbox', { name: 'Location' }) as HTMLInputElement;
      const remarksCheckbox = screen.getByRole('checkbox', { name: 'Remarks' }) as HTMLInputElement;

      expect(statusCheckbox.checked).toBe(false);
      expect(locationCheckbox.checked).toBe(false);
      expect(remarksCheckbox.checked).toBe(false);
    });

    it('should have status checkbox checked if STATUS step is in initial steps', () => {
      render(<SelectFieldsStepUacWrapper initialSteps={[UasEditStepsEnum.STATUS]} />);

      const statusCheckbox = screen.getByRole('checkbox', {
        name: 'Operational Readiness Status',
      }) as HTMLInputElement;
      expect(statusCheckbox.checked).toBe(true);
    });
  });

  describe('User Interactions - UAV', () => {
    it('should check status checkbox when clicked', async () => {
      const user = userEvent.setup();
      render(<SelectFieldsStepUavWrapper />);

      const statusCheckbox = screen.getByRole('checkbox', { name: 'UAV Status' }) as HTMLInputElement;
      expect(statusCheckbox.checked).toBe(false);

      await act(async () => {
        await user.click(statusCheckbox);
      });

      await waitFor(() => {
        expect(statusCheckbox.checked).toBe(true);
      });
    });

    it('should check period checkbox when clicked', async () => {
      const user = userEvent.setup();
      render(<SelectFieldsStepUavWrapper />);

      const periodCheckbox = screen.getByRole('checkbox', { name: 'Period Hrs' }) as HTMLInputElement;
      expect(periodCheckbox.checked).toBe(false);

      await act(async () => {
        await user.click(periodCheckbox);
      });

      await waitFor(() => {
        expect(periodCheckbox.checked).toBe(true);
      });
    });

    it('should check location checkbox when clicked', async () => {
      const user = userEvent.setup();
      render(<SelectFieldsStepUavWrapper />);

      const locationCheckbox = screen.getByRole('checkbox', { name: 'Location' }) as HTMLInputElement;
      expect(locationCheckbox.checked).toBe(false);

      await act(async () => {
        await user.click(locationCheckbox);
      });

      await waitFor(() => {
        expect(locationCheckbox.checked).toBe(true);
      });
    });

    it('should check remarks checkbox when clicked', async () => {
      const user = userEvent.setup();
      render(<SelectFieldsStepUavWrapper />);

      const remarksCheckbox = screen.getByRole('checkbox', { name: 'Remarks' }) as HTMLInputElement;
      expect(remarksCheckbox.checked).toBe(false);

      await act(async () => {
        await user.click(remarksCheckbox);
      });

      await waitFor(() => {
        expect(remarksCheckbox.checked).toBe(true);
      });
    });

    it('should uncheck checkbox when clicked again', async () => {
      const user = userEvent.setup();
      render(<SelectFieldsStepUavWrapper initialSteps={[UasEditStepsEnum.STATUS]} />);

      const statusCheckbox = screen.getByRole('checkbox', { name: 'UAV Status' }) as HTMLInputElement;
      expect(statusCheckbox.checked).toBe(true);

      await act(async () => {
        await user.click(statusCheckbox);
      });

      await waitFor(() => {
        expect(statusCheckbox.checked).toBe(false);
      });
    });

    it('should allow multiple checkboxes to be checked', async () => {
      const user = userEvent.setup();
      render(<SelectFieldsStepUavWrapper />);

      const statusCheckbox = screen.getByRole('checkbox', { name: 'UAV Status' }) as HTMLInputElement;
      const periodCheckbox = screen.getByRole('checkbox', { name: 'Period Hrs' }) as HTMLInputElement;
      const locationCheckbox = screen.getByRole('checkbox', { name: 'Location' }) as HTMLInputElement;

      await act(async () => {
        await user.click(statusCheckbox);
        await user.click(periodCheckbox);
        await user.click(locationCheckbox);
      });

      await waitFor(() => {
        expect(statusCheckbox.checked).toBe(true);
        expect(periodCheckbox.checked).toBe(true);
        expect(locationCheckbox.checked).toBe(true);
      });
    });

    it('should toggle checkboxes independently', async () => {
      const user = userEvent.setup();
      render(<SelectFieldsStepUavWrapper />);

      const statusCheckbox = screen.getByRole('checkbox', { name: 'UAV Status' }) as HTMLInputElement;
      const periodCheckbox = screen.getByRole('checkbox', { name: 'Period Hrs' }) as HTMLInputElement;

      await act(async () => {
        await user.click(statusCheckbox);
      });

      await waitFor(() => {
        expect(statusCheckbox.checked).toBe(true);
        expect(periodCheckbox.checked).toBe(false);
      });

      await act(async () => {
        await user.click(periodCheckbox);
      });

      await waitFor(() => {
        expect(statusCheckbox.checked).toBe(true);
        expect(periodCheckbox.checked).toBe(true);
      });

      await act(async () => {
        await user.click(statusCheckbox);
      });

      await waitFor(() => {
        expect(statusCheckbox.checked).toBe(false);
        expect(periodCheckbox.checked).toBe(true);
      });
    });
  });

  describe('User Interactions - UAC', () => {
    it('should check status checkbox when clicked', async () => {
      const user = userEvent.setup();
      render(<SelectFieldsStepUacWrapper />);

      const statusCheckbox = screen.getByRole('checkbox', {
        name: 'Operational Readiness Status',
      }) as HTMLInputElement;
      expect(statusCheckbox.checked).toBe(false);

      await act(async () => {
        await user.click(statusCheckbox);
      });

      await waitFor(() => {
        expect(statusCheckbox.checked).toBe(true);
      });
    });

    it('should allow multiple checkboxes to be checked for UAC', async () => {
      const user = userEvent.setup();
      render(<SelectFieldsStepUacWrapper />);

      const statusCheckbox = screen.getByRole('checkbox', {
        name: 'Operational Readiness Status',
      }) as HTMLInputElement;
      const locationCheckbox = screen.getByRole('checkbox', { name: 'Location' }) as HTMLInputElement;
      const remarksCheckbox = screen.getByRole('checkbox', { name: 'Remarks' }) as HTMLInputElement;

      await act(async () => {
        await user.click(statusCheckbox);
        await user.click(locationCheckbox);
        await user.click(remarksCheckbox);
      });

      await waitFor(() => {
        expect(statusCheckbox.checked).toBe(true);
        expect(locationCheckbox.checked).toBe(true);
        expect(remarksCheckbox.checked).toBe(true);
      });
    });
  });

  describe('Checkbox Labels', () => {
    it('should have correct label for UAV status', () => {
      render(<SelectFieldsStepUavWrapper />);

      expect(screen.getByText('UAV Status')).toBeInTheDocument();
    });

    it('should have correct label for UAC status', () => {
      render(<SelectFieldsStepUacWrapper />);

      expect(screen.getByText('Operational Readiness Status')).toBeInTheDocument();
    });

    it('should have correct label for Period Hrs', () => {
      render(<SelectFieldsStepUavWrapper />);

      expect(screen.getByText('Period Hrs')).toBeInTheDocument();
    });

    it('should have correct label for Location', () => {
      render(<SelectFieldsStepUavWrapper />);

      expect(screen.getByText('Location')).toBeInTheDocument();
    });

    it('should have correct label for Remarks', () => {
      render(<SelectFieldsStepUavWrapper />);

      expect(screen.getByText('Remarks')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible checkboxes', () => {
      render(<SelectFieldsStepUavWrapper />);

      expect(screen.getByRole('checkbox', { name: 'UAV Status' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Period Hrs' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Location' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Remarks' })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SelectFieldsStepUavWrapper />);

      const statusCheckbox = screen.getByRole('checkbox', { name: 'UAV Status' });
      const periodCheckbox = screen.getByRole('checkbox', { name: 'Period Hrs' });

      await act(async () => {
        statusCheckbox.focus();
      });
      expect(statusCheckbox).toHaveFocus();

      await act(async () => {
        await user.tab();
      });
      expect(periodCheckbox).toHaveFocus();
    });

    it('should support space key for checkbox', async () => {
      const user = userEvent.setup();
      render(<SelectFieldsStepUavWrapper />);

      const statusCheckbox = screen.getByRole('checkbox', { name: 'UAV Status' }) as HTMLInputElement;

      await act(async () => {
        statusCheckbox.focus();
        await user.keyboard(' ');
      });

      await waitFor(() => {
        expect(statusCheckbox.checked).toBe(true);
      });
    });
  });

  describe('Layout and Styling', () => {
    it('should render FormControl component', () => {
      const { container } = render(<SelectFieldsStepUavWrapper />);

      const formControl = container.querySelector('.MuiFormControl-root');
      expect(formControl).toBeInTheDocument();
    });

    it('should render FormGroup component', () => {
      const { container } = render(<SelectFieldsStepUavWrapper />);

      const formGroup = container.querySelector('.MuiFormGroup-root');
      expect(formGroup).toBeInTheDocument();
    });

    it('should render Box component', () => {
      const { container } = render(<SelectFieldsStepUavWrapper />);

      const box = container.querySelector('.MuiBox-root');
      expect(box).toBeInTheDocument();
    });
  });

  describe('Typography', () => {
    it('should render instruction text', () => {
      render(<SelectFieldsStepUavWrapper />);

      expect(screen.getByText('Select which fields you want to edit.')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all checkboxes being checked', async () => {
      const user = userEvent.setup();
      render(<SelectFieldsStepUavWrapper />);

      const checkboxes = screen.getAllByRole('checkbox');

      await act(async () => {
        for (const checkbox of checkboxes) {
          await user.click(checkbox);
        }
      });

      await waitFor(() => {
        checkboxes.forEach((checkbox) => {
          expect((checkbox as HTMLInputElement).checked).toBe(true);
        });
      });
    });

    it('should handle rapid checkbox toggling', async () => {
      const user = userEvent.setup();
      render(<SelectFieldsStepUavWrapper />);

      const statusCheckbox = screen.getByRole('checkbox', { name: 'UAV Status' }) as HTMLInputElement;

      await act(async () => {
        await user.click(statusCheckbox);
        await user.click(statusCheckbox);
        await user.click(statusCheckbox);
      });

      await waitFor(() => {
        expect(statusCheckbox.checked).toBe(true);
      });
    });
  });
});
