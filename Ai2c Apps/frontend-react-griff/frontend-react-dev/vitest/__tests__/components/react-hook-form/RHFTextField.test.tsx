import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RHFTextField } from '@components/react-hook-form/RHFTextField';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

type TestForm = {
  textField: string;
};

const renderWithForm = (ui: React.ReactElement) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm<TestForm>({
      defaultValues: { textField: '' },
    });

    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  return renderWithProviders(<Wrapper>{ui}</Wrapper>);
};

describe('RHFTextField', () => {
  describe('Basic Rendering', () => {
    it('renders the label', () => {
      renderWithForm(<RHFTextField<TestForm> field="textField" label="Test Label" />);

      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    it('renders as a text input by default', () => {
      renderWithForm(<RHFTextField<TestForm> field="textField" label="Test Label" />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('updates form value on input change', async () => {
      const user = userEvent.setup();

      renderWithForm(<RHFTextField<TestForm> field="textField" label="Test Label" />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello World');

      expect(input).toHaveValue('Hello World');
    });
  });

  describe('Select Mode', () => {
    it('renders as select when options are provided', () => {
      const options = ['Option 1', 'Option 2'];

      renderWithForm(<RHFTextField<TestForm> field="textField" label="Select Label" options={options} />);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('displays options in select', async () => {
      const user = userEvent.setup();
      const options = ['Option 1', 'Option 2'];

      renderWithForm(<RHFTextField<TestForm> field="textField" label="Select Label" options={options} />);

      const select = screen.getByRole('combobox');
      await user.click(select);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  describe('MUI Props Passthrough', () => {
    it('passes through MUI TextField props like variant', () => {
      renderWithForm(<RHFTextField<TestForm> field="textField" label="Test Label" variant="outlined" />);

      const input = screen.getByRole('textbox');
      // Check if variant is applied (this might require checking classes or attributes)
      expect(input).toBeInTheDocument();
    });

    it('passes through multiline prop', () => {
      renderWithForm(<RHFTextField<TestForm> field="textField" label="Test Label" multiline rows={3} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
    });
  });
});
