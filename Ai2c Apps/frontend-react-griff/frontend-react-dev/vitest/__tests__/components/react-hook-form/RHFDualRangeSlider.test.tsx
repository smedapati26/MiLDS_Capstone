import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RHFDualRangeSlider } from '@components/react-hook-form/RHFDualRangeSlider';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

type TestForm = {
  range: number[];
  enableRange?: boolean;
};

const renderWithForm = (ui: React.ReactElement) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm<TestForm>({
      defaultValues: { range: [20, 80], enableRange: true },
    });

    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  return renderWithProviders(<Wrapper>{ui}</Wrapper>);
};

describe('RHFDualRangeSlider', () => {
  it('renders the label and slider without checkbox', () => {
    renderWithForm(<RHFDualRangeSlider<TestForm> field="range" label="Select Range" />);

    expect(screen.getByText('Select Range')).toBeInTheDocument();
    // Assuming PmxDualSlider renders sliders
    expect(screen.getAllByRole('slider')).toHaveLength(2);
  });

  it('renders the checkbox when checkboxField is provided', () => {
    renderWithForm(<RHFDualRangeSlider<TestForm> field="range" label="Select Range" checkboxField="enableRange" />);

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('disables slider when checkbox is unchecked', async () => {
    const user = userEvent.setup();

    renderWithForm(<RHFDualRangeSlider<TestForm> field="range" label="Select Range" checkboxField="enableRange" />);

    const checkbox = screen.getByRole('checkbox');
    const sliders = screen.getAllByRole('slider');

    // Initially enabled
    expect(checkbox).toBeChecked();
    sliders.forEach((s) => expect(s).not.toBeDisabled());

    // Uncheck
    await user.click(checkbox);
    sliders.forEach((s) => expect(s).toBeDisabled());
  });

  it('enables slider when checkbox is checked', async () => {
    const user = userEvent.setup();

    renderWithForm(<RHFDualRangeSlider<TestForm> field="range" label="Select Range" checkboxField="enableRange" />);

    const checkbox = screen.getByRole('checkbox');

    // Uncheck first
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();

    // Check again
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    const sliders = screen.getAllByRole('slider');
    sliders.forEach((s) => expect(s).not.toBeDisabled());
  });

  it('disables the slider when disabled prop is true', () => {
    renderWithForm(<RHFDualRangeSlider<TestForm> field="range" label="Select Range" disabled />);

    const sliders = screen.getAllByRole('slider');
    sliders.forEach((s) => expect(s).toBeDisabled());
  });
});
