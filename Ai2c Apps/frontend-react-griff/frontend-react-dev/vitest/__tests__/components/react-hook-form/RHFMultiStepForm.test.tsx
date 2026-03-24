import { describe, expect, it, vi } from 'vitest';
import z from 'zod';

import { fireEvent, render, screen } from '@testing-library/react';

import { RHFMultiStepFormProvider } from '@components/react-hook-form';

const StepOne = () => <div data-testid="step-one">Step One</div>;
const StepTwo = () => <div data-testid="step-two">Step Two</div>;

const steps = [
  { title: 'Step 1', component: <StepOne />, schema: z.object({ name: z.string().min(1) }) },
  { title: 'Step 2', component: <StepTwo />, schema: z.object({ age: z.number().min(1) }) },
];

const schema = z.object({
  name: z.string().min(1),
  age: z.number().min(1),
});

describe('RHFMultiStepFormProvider', () => {
  it('renders first step initially', () => {
    render(
      <RHFMultiStepFormProvider name="test-form" steps={steps} schema={schema} defaultValues={{ name: '', age: 0 }} />,
    );

    expect(screen.getByTestId('step-one')).toBeInTheDocument();
    expect(screen.queryByTestId('step-two')).not.toBeInTheDocument();
  });

  it('moves to next step when Next is clicked and valid', async () => {
    render(
      <RHFMultiStepFormProvider
        name="test-form"
        steps={steps}
        schema={schema}
        defaultValues={{ name: 'John', age: 0 }}
      />,
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    expect(await screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('opens reset modal when reset is clicked', async () => {
    render(
      <RHFMultiStepFormProvider
        name="test-form"
        steps={steps}
        schema={schema}
        defaultValues={{ name: 'John', age: 0 }}
      />,
    );

    // Move to step 2
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Click reset
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(await screen.getByText('Step One')).toBeInTheDocument();
  });

  it('calls onSubmit when submitting final step', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(
      <RHFMultiStepFormProvider
        name="test-form"
        steps={steps}
        schema={schema}
        defaultValues={{ name: 'John', age: 20 }}
        onSubmit={onSubmit}
      />,
    );

    // Move to step 2
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
  });
});
