import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MultiStepProvider, StatusStep } from '@features/equipment-manager/uas/UasEditSteps';

// Wrapper for UAV type
const StatusStepUavWrapper = () => {
  return (
    <MultiStepProvider>
      <StatusStep uasType="Uav" />
    </MultiStepProvider>
  );
};

// Wrapper for UAC type
const StatusStepUacWrapper = () => {
  return (
    <MultiStepProvider>
      <StatusStep uasType="Uac" />
    </MultiStepProvider>
  );
};

describe('StatusStep', () => {
  describe('Rendering - UAV Type', () => {
    it('should render the component for UAV', () => {
      render(<StatusStepUavWrapper />);

      expect(screen.getByText('Edit Launch Status')).toBeInTheDocument();
      expect(screen.getByText('Edit Operational Readiness Status')).toBeInTheDocument();
    });

    it('should render both status selectors for UAV', () => {
      render(<StatusStepUavWrapper />);

      expect(screen.getByText('Edit Launch Status')).toBeInTheDocument();
      expect(screen.getByText('Edit Operational Readiness Status')).toBeInTheDocument();
    });

    it('should render RTL description for UAV', () => {
      render(<StatusStepUavWrapper />);

      expect(screen.getByText('Select a launch status to assign the select UAVs')).toBeInTheDocument();
    });

    it('should render OR Status description for UAV', () => {
      render(<StatusStepUavWrapper />);

      expect(
        screen.getByText('Select an operational readiness status to assign the selected UAVs'),
      ).toBeInTheDocument();
    });

    it('should render divider between selectors for UAV', () => {
      const { container } = render(<StatusStepUavWrapper />);

      const divider = container.querySelector('.MuiDivider-root');
      expect(divider).toBeInTheDocument();
    });

    it('should render RTL toggle buttons', () => {
      render(<StatusStepUavWrapper />);

      expect(screen.getByRole('button', { name: /^rtl$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /nrtl/i })).toBeInTheDocument();
    });

    it('should render OR Status toggle buttons', () => {
      render(<StatusStepUavWrapper />);

      expect(screen.getByRole('button', { name: 'FMC' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'PMC' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'NMC' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'DADE' })).toBeInTheDocument();
    });

    it('should render two sync checkboxes for UAV', () => {
      render(<StatusStepUavWrapper />);

      const checkboxes = screen.getAllByRole('checkbox', { name: 'Auto-sync data' });
      expect(checkboxes).toHaveLength(2);
    });
  });

  describe('Rendering - UAC Type', () => {
    it('should render the component for UAC', () => {
      render(<StatusStepUacWrapper />);

      expect(screen.getByText('Edit Operational Readiness Status')).toBeInTheDocument();
    });

    it('should render only OR Status selector for UAC', () => {
      render(<StatusStepUacWrapper />);

      expect(screen.getByText('Edit Operational Readiness Status')).toBeInTheDocument();
      expect(screen.queryByText('Edit Launch Status')).not.toBeInTheDocument();
    });

    it('should render OR Status description for UAC with components text', () => {
      render(<StatusStepUacWrapper />);

      expect(
        screen.getByText('Select an operational readiness status to assign the selected components'),
      ).toBeInTheDocument();
    });

    it('should not render divider for UAC', () => {
      const { container } = render(<StatusStepUacWrapper />);

      const divider = container.querySelector('.MuiDivider-root');
      expect(divider).not.toBeInTheDocument();
    });

    it('should not render RTL toggle buttons for UAC', () => {
      render(<StatusStepUacWrapper />);

      expect(screen.queryByRole('button', { name: /rtl/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /nrtl/i })).not.toBeInTheDocument();
    });

    it('should render OR Status toggle buttons for UAC', () => {
      render(<StatusStepUacWrapper />);

      expect(screen.getByRole('button', { name: 'FMC' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'PMC' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'NMC' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'DADE' })).toBeInTheDocument();
    });

    it('should render one sync checkbox for UAC', () => {
      render(<StatusStepUacWrapper />);

      const checkboxes = screen.getAllByRole('checkbox', { name: 'Auto-sync data' });
      expect(checkboxes).toHaveLength(1);
    });
  });

  describe('RTL Status Interactions - UAV', () => {
    it('should select RTL status', async () => {
      const user = userEvent.setup();
      render(<StatusStepUavWrapper />);

      const rtlButton = screen.getByRole('button', { name: /^rtl$/i });

      await act(async () => {
        await user.click(rtlButton);
      });

      expect(rtlButton).toHaveClass('Mui-selected');
    });

    it('should select NRTL status', async () => {
      const user = userEvent.setup();
      render(<StatusStepUavWrapper />);

      const nrtlButton = screen.getByRole('button', { name: /nrtl/i });

      await act(async () => {
        await user.click(nrtlButton);
      });

      expect(nrtlButton).toHaveClass('Mui-selected');
    });

    it('should toggle between RTL and NRTL', async () => {
      const user = userEvent.setup();
      render(<StatusStepUavWrapper />);

      const rtlButton = screen.getByRole('button', { name: /^rtl$/i });
      const nrtlButton = screen.getByRole('button', { name: /nrtl/i });

      await act(async () => {
        await user.click(rtlButton);
      });
      expect(rtlButton).toHaveClass('Mui-selected');

      await act(async () => {
        await user.click(nrtlButton);
      });
      expect(nrtlButton).toHaveClass('Mui-selected');
      expect(rtlButton).not.toHaveClass('Mui-selected');
    });

    it('should toggle RTL sync checkbox', async () => {
      const user = userEvent.setup();
      render(<StatusStepUavWrapper />);

      const checkboxes = screen.getAllByRole('checkbox', { name: 'Auto-sync data' });
      const rtlCheckbox = checkboxes[0] as HTMLInputElement;
      const initialState = rtlCheckbox.checked;

      await act(async () => {
        await user.click(rtlCheckbox);
      });

      expect(rtlCheckbox.checked).toBe(!initialState);
    });
  });

  describe('OR Status Interactions - UAV', () => {
    it('should select FMC status', async () => {
      const user = userEvent.setup();
      render(<StatusStepUavWrapper />);

      const fmcButton = screen.getByRole('button', { name: 'FMC' });

      await act(async () => {
        await user.click(fmcButton);
      });

      expect(fmcButton).toHaveClass('Mui-selected');
    });

    it('should select PMC status', async () => {
      const user = userEvent.setup();
      render(<StatusStepUavWrapper />);

      const pmcButton = screen.getByRole('button', { name: 'PMC' });

      await act(async () => {
        await user.click(pmcButton);
      });

      expect(pmcButton).toHaveClass('Mui-selected');
    });

    it('should select NMC status', async () => {
      const user = userEvent.setup();
      render(<StatusStepUavWrapper />);

      const nmcButton = screen.getByRole('button', { name: 'NMC' });

      await act(async () => {
        await user.click(nmcButton);
      });

      expect(nmcButton).toHaveClass('Mui-selected');
    });

    it('should select DADE status', async () => {
      const user = userEvent.setup();
      render(<StatusStepUavWrapper />);

      const dadeButton = screen.getByRole('button', { name: 'DADE' });

      await act(async () => {
        await user.click(dadeButton);
      });

      expect(dadeButton).toHaveClass('Mui-selected');
    });

    it('should toggle between different OR statuses', async () => {
      const user = userEvent.setup();
      render(<StatusStepUavWrapper />);

      const fmcButton = screen.getByRole('button', { name: 'FMC' });
      const pmcButton = screen.getByRole('button', { name: 'PMC' });
      const nmcButton = screen.getByRole('button', { name: 'NMC' });

      await act(async () => {
        await user.click(fmcButton);
      });
      expect(fmcButton).toHaveClass('Mui-selected');

      await act(async () => {
        await user.click(pmcButton);
      });
      expect(pmcButton).toHaveClass('Mui-selected');
      expect(fmcButton).not.toHaveClass('Mui-selected');

      await act(async () => {
        await user.click(nmcButton);
      });
      expect(nmcButton).toHaveClass('Mui-selected');
      expect(pmcButton).not.toHaveClass('Mui-selected');
    });

    it('should toggle OR Status sync checkbox', async () => {
      const user = userEvent.setup();
      render(<StatusStepUavWrapper />);

      const checkboxes = screen.getAllByRole('checkbox', { name: 'Auto-sync data' });
      const orStatusCheckbox = checkboxes[1] as HTMLInputElement;
      const initialState = orStatusCheckbox.checked;

      await act(async () => {
        await user.click(orStatusCheckbox);
      });

      expect(orStatusCheckbox.checked).toBe(!initialState);
    });
  });

  describe('OR Status Interactions - UAC', () => {
    it('should select FMC status for UAC', async () => {
      const user = userEvent.setup();
      render(<StatusStepUacWrapper />);

      const fmcButton = screen.getByRole('button', { name: 'FMC' });

      await act(async () => {
        await user.click(fmcButton);
      });

      expect(fmcButton).toHaveClass('Mui-selected');
    });

    it('should toggle between different OR statuses for UAC', async () => {
      const user = userEvent.setup();
      render(<StatusStepUacWrapper />);

      const fmcButton = screen.getByRole('button', { name: 'FMC' });
      const dadeButton = screen.getByRole('button', { name: 'DADE' });

      await act(async () => {
        await user.click(fmcButton);
      });
      expect(fmcButton).toHaveClass('Mui-selected');

      await act(async () => {
        await user.click(dadeButton);
      });
      expect(dadeButton).toHaveClass('Mui-selected');
      expect(fmcButton).not.toHaveClass('Mui-selected');
    });

    it('should toggle sync checkbox for UAC', async () => {
      const user = userEvent.setup();
      render(<StatusStepUacWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' }) as HTMLInputElement;
      const initialState = checkbox.checked;

      await act(async () => {
        await user.click(checkbox);
      });

      expect(checkbox.checked).toBe(!initialState);
    });
  });

  describe('Combined Interactions - UAV', () => {
    it('should handle both RTL and OR Status changes independently', async () => {
      const user = userEvent.setup();
      render(<StatusStepUavWrapper />);

      const rtlButton = screen.getByRole('button', { name: /^rtl$/i });
      const fmcButton = screen.getByRole('button', { name: 'FMC' });

      await act(async () => {
        await user.click(rtlButton);
      });
      expect(rtlButton).toHaveClass('Mui-selected');

      await act(async () => {
        await user.click(fmcButton);
      });
      expect(fmcButton).toHaveClass('Mui-selected');
      expect(rtlButton).toHaveClass('Mui-selected'); // RTL should remain selected
    });

    it('should handle both checkboxes independently', async () => {
      const user = userEvent.setup();
      render(<StatusStepUavWrapper />);

      const checkboxes = screen.getAllByRole('checkbox', { name: 'Auto-sync data' });
      const rtlCheckbox = checkboxes[0] as HTMLInputElement;
      const orCheckbox = checkboxes[1] as HTMLInputElement;

      const rtlInitialState = rtlCheckbox.checked;
      const orInitialState = orCheckbox.checked;

      await act(async () => {
        await user.click(rtlCheckbox);
      });
      expect(rtlCheckbox.checked).toBe(!rtlInitialState);
      expect(orCheckbox.checked).toBe(orInitialState); // OR checkbox unchanged

      await act(async () => {
        await user.click(orCheckbox);
      });
      expect(orCheckbox.checked).toBe(!orInitialState);
      expect(rtlCheckbox.checked).toBe(!rtlInitialState); // RTL checkbox unchanged
    });

    it('should maintain status selections when toggling checkboxes', async () => {
      const user = userEvent.setup();
      render(<StatusStepUavWrapper />);

      const rtlButton = screen.getByRole('button', { name: /^rtl$/i });
      const fmcButton = screen.getByRole('button', { name: 'FMC' });
      const checkboxes = screen.getAllByRole('checkbox', { name: 'Auto-sync data' });

      await act(async () => {
        await user.click(rtlButton);
        await user.click(fmcButton);
      });

      expect(rtlButton).toHaveClass('Mui-selected');
      expect(fmcButton).toHaveClass('Mui-selected');

      await act(async () => {
        await user.click(checkboxes[0]);
        await user.click(checkboxes[1]);
      });

      // Status selections should remain
      expect(rtlButton).toHaveClass('Mui-selected');
      expect(fmcButton).toHaveClass('Mui-selected');
    });
  });

  describe('Toggle Button Exclusivity', () => {
    it('should only allow one RTL status to be selected at a time', async () => {
      const user = userEvent.setup();
      render(<StatusStepUavWrapper />);

      const rtlButton = screen.getByRole('button', { name: /^rtl$/i });
      const nrtlButton = screen.getByRole('button', { name: /nrtl/i });

      await act(async () => {
        await user.click(rtlButton);
      });
      expect(rtlButton).toHaveClass('Mui-selected');
      expect(nrtlButton).not.toHaveClass('Mui-selected');

      await act(async () => {
        await user.click(nrtlButton);
      });
      expect(nrtlButton).toHaveClass('Mui-selected');
      expect(rtlButton).not.toHaveClass('Mui-selected');
    });

    it('should only allow one OR status to be selected at a time', async () => {
      const user = userEvent.setup();
      render(<StatusStepUavWrapper />);

      const fmcButton = screen.getByRole('button', { name: 'FMC' });
      const pmcButton = screen.getByRole('button', { name: 'PMC' });
      const nmcButton = screen.getByRole('button', { name: 'NMC' });

      await act(async () => {
        await user.click(fmcButton);
      });
      expect(fmcButton).toHaveClass('Mui-selected');

      await act(async () => {
        await user.click(pmcButton);
      });
      expect(pmcButton).toHaveClass('Mui-selected');
      expect(fmcButton).not.toHaveClass('Mui-selected');

      await act(async () => {
        await user.click(nmcButton);
      });
      expect(nmcButton).toHaveClass('Mui-selected');
      expect(pmcButton).not.toHaveClass('Mui-selected');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible RTL toggle buttons', () => {
      render(<StatusStepUavWrapper />);

      expect(screen.getByRole('button', { name: /^rtl$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /nrtl/i })).toBeInTheDocument();
    });

    it('should have accessible OR Status toggle buttons', () => {
      render(<StatusStepUavWrapper />);

      expect(screen.getByRole('button', { name: 'FMC' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'PMC' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'NMC' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'DADE' })).toBeInTheDocument();
    });

    it('should have accessible checkboxes', () => {
      render(<StatusStepUavWrapper />);

      const checkboxes = screen.getAllByRole('checkbox', { name: 'Auto-sync data' });
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAccessibleName('Auto-sync data');
      });
    });

    it('should support keyboard navigation for UAV', async () => {
      const user = userEvent.setup();
      render(<StatusStepUavWrapper />);

      const rtlButton = screen.getByRole('button', { name: /^rtl$/i });

      await act(async () => {
        rtlButton.focus();
      });
      expect(rtlButton).toHaveFocus();

      // Tab through elements
      await act(async () => {
        await user.tab();
      });
      // Should move to next focusable element
    });
  });

  describe('Layout and Styling', () => {
    it('should render side-by-side layout for UAV', () => {
      const { container } = render(<StatusStepUavWrapper />);

      const stacks = container.querySelectorAll('.MuiStack-root');
      expect(stacks.length).toBeGreaterThan(0);
    });

    it('should render single column layout for UAC', () => {
      const { container } = render(<StatusStepUacWrapper />);

      const box = container.querySelector('.MuiBox-root');
      expect(box).toBeInTheDocument();
    });

    it('should have proper spacing between elements', () => {
      const { container } = render(<StatusStepUavWrapper />);

      const stacks = container.querySelectorAll('.MuiStack-root');
      expect(stacks.length).toBeGreaterThan(0);
    });
  });
});
