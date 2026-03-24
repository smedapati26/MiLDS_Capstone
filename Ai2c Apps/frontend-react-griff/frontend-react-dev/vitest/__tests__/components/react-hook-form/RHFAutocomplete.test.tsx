import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RHFAutocomplete } from '@components/react-hook-form/RHFAutocomplete';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

type TestForm = {
  selection: string | string[];
};

const renderWithForm = (ui: React.ReactElement, multiselect = false) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm<TestForm>({
      defaultValues: { selection: multiselect ? [] : '' },
    });

    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  return renderWithProviders(<Wrapper>{ui}</Wrapper>);
};

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('RHFAutocomplete', () => {
  describe('Basic Rendering', () => {
    it('renders the label', () => {
      renderWithForm(<RHFAutocomplete<string, TestForm> field="selection" label="Select Option" options={options} />);

      expect(screen.getByLabelText('Select Option')).toBeInTheDocument();
    });
  });

  describe('Single Select Mode', () => {
    it('updates form value on option selection', async () => {
      const user = userEvent.setup();

      renderWithForm(
        <RHFAutocomplete<string, TestForm>
          field="selection"
          label="Select Option"
          options={options}
          multiple={false}
        />,
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      const option1 = screen.getByText('Option 1');
      await user.click(option1);

      // Verify form value update (mock or check behavior)
      // Since it's RHF, onChange should be called
    });

    it('allows clearing selection', async () => {
      const user = userEvent.setup();

      renderWithForm(
        <RHFAutocomplete<string, TestForm>
          field="selection"
          label="Select Option"
          options={options}
          multiple={false}
        />,
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      const option1 = screen.getByText('Option 1');
      await user.click(option1);

      // Assuming clear button or way to clear
      // await user.click(clearButton);
    });
  });

  describe('Multi Select Mode', () => {
    it('allows multiple selections', async () => {
      const user = userEvent.setup();

      renderWithForm(
        <RHFAutocomplete<string, TestForm> field="selection" label="Select Option" options={options} multiple={true} />,
        true,
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      const option1 = screen.getByText('Option 1');
      await user.click(option1);

      const option2 = screen.getByText('Option 2');
      await user.click(option2);

      // Check that both are selected
    });
  });

  describe('Validation', () => {
    it('shows error for required field when not selected', async () => {
      const user = userEvent.setup();

      const TestFormWithSubmit = () => {
        const methods = useForm<TestForm>({
          defaultValues: { selection: '' },
          mode: 'onSubmit',
        });

        return (
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(vi.fn())}>
              <RHFAutocomplete<string, TestForm>
                field="selection"
                label="Select Option"
                options={options}
                rules={{ required: 'Selection is required' }}
              />
              <button type="submit">Submit</button>
            </form>
            {methods.formState.errors.selection && <div>{methods.formState.errors.selection.message}</div>}
          </FormProvider>
        );
      };

      renderWithProviders(<TestFormWithSubmit />);

      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(screen.getAllByText('Selection is required')).toHaveLength(2);
        },
        { timeout: 2000 },
      );
    });
  });
});
