import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RHFToggleButtonGroup } from '@components/react-hook-form/RHFToggleButtonGroup';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

type TestForm = {
  selection: string | string[] | null;
};

const renderWithForm = (ui: React.ReactElement) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm<TestForm>({
      defaultValues: { selection: null },
    });

    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  return renderWithProviders(<Wrapper>{ui}</Wrapper>);
};

const stringOptions = ['Option 1', 'Option 2', 'Option 3'];

describe('RHFToggleButtonGroup', () => {
  describe('Basic Rendering', () => {
    it('renders the label when provided', () => {
      renderWithForm(
        <RHFToggleButtonGroup<TestForm> field="selection" label="Select Option" options={stringOptions} />,
      );

      expect(screen.getByText('Select Option')).toBeInTheDocument();
    });

    it('renders toggle buttons for options', () => {
      renderWithForm(<RHFToggleButtonGroup<TestForm> field="selection" options={stringOptions} />);

      stringOptions.forEach((option) => {
        expect(screen.getByRole('button', { name: option })).toBeInTheDocument();
      });
    });
  });

  describe('Functionality - Exclusive Mode', () => {
    it('updates form value when toggle buttons are clicked in exclusive mode', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const methods = useForm<TestForm>({
          defaultValues: { selection: null },
        });

        const [selection, setSelection] = useState<string | null>(null);

        useEffect(() => {
          const subscription = methods.watch((value) => {
            setSelection(value.selection as string);
          });
          return () => subscription.unsubscribe();
        }, [methods]);

        return (
          <FormProvider {...methods}>
            <RHFToggleButtonGroup<TestForm> field="selection" options={stringOptions} exclusive />
            <div data-testid="selection-value">{selection}</div>
          </FormProvider>
        );
      };

      renderWithProviders(<TestComponent />);

      const button1 = screen.getByRole('button', { name: 'Option 1' });
      const button2 = screen.getByRole('button', { name: 'Option 2' });

      await user.click(button1);
      expect(screen.getByTestId('selection-value')).toHaveTextContent('Option 1');

      await user.click(button2);
      expect(screen.getByTestId('selection-value')).toHaveTextContent('Option 2');
    });
  });

  describe('Functionality - Non-Exclusive Mode', () => {
    it('updates form value when toggle buttons are clicked in non-exclusive mode', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const methods = useForm<TestForm>({
          defaultValues: { selection: [] },
        });

        const [selection, setSelection] = useState<string[]>([]);

        useEffect(() => {
          const subscription = methods.watch((value) => {
            setSelection(value.selection as string[]);
          });
          return () => subscription.unsubscribe();
        }, [methods]);

        return (
          <FormProvider {...methods}>
            <RHFToggleButtonGroup<TestForm> field="selection" options={stringOptions} exclusive={false} />
            <div data-testid="selection-value">{JSON.stringify(selection)}</div>
          </FormProvider>
        );
      };

      renderWithProviders(<TestComponent />);

      const button1 = screen.getByRole('button', { name: 'Option 1' });
      const button2 = screen.getByRole('button', { name: 'Option 2' });

      await user.click(button1);
      expect(screen.getByTestId('selection-value')).toHaveTextContent('["Option 1"]');

      await user.click(button2);
      expect(screen.getByTestId('selection-value')).toHaveTextContent('["Option 1","Option 2"]');

      await user.click(button1);
      expect(screen.getByTestId('selection-value')).toHaveTextContent('["Option 2"]');
    });
  });

  describe('Error Handling', () => {
    it('renders without crashing when field has error', () => {
      const TestComponent = () => {
        const methods = useForm<TestForm>({
          defaultValues: { selection: null },
        });

        // Simulate error
        methods.setError('selection', { message: 'Selection is required' });

        return (
          <FormProvider {...methods}>
            <RHFToggleButtonGroup<TestForm> field="selection" options={stringOptions} />
          </FormProvider>
        );
      };

      renderWithProviders(<TestComponent />);

      // Check if component renders toggle buttons
      expect(screen.getByRole('button', { name: 'Option 1' })).toBeInTheDocument();
    });
  });
});
