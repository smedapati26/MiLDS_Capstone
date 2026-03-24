import { describe, expect, it, vi } from 'vitest';

import { screen } from '@testing-library/react';

import CreateTaskForceTab from '@features/task-forces/pages/CreateTaskForceTab';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

vi.mock('react-router-dom', () => ({ ...vi.importActual('react-router-dom'), useNavigate: () => vi.fn() }));

// Mock the RHFMultiStepFormProvider
vi.mock('@components/react-hook-form', () => ({
  RHFMultiStepFormProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="multi-step-form-provider">{children}</div>
  ),
  MultiStepFormStep: {},
}));

// Mock the create-stepper components
vi.mock('@features/task-forces/components/create-stepper', () => ({
  createTaskForceDefaultValues: {},
  CreateTaskForceSchema: {},
  step1Schema: {},
  step2Schema: {},
  step3Schema: {},
  step4Schema: {},
  step5Schema: {},
  createTaskForceSchema: {},
  Step1TaskForceDetails: () => <div>Step1TaskForceDetails</div>,
  Step2CreateSubordinates: () => <div>Step2CreateSubordinates</div>,
  Step3AddAircraft: () => <div>Step3AddAircraft</div>,
  Step4AddUAS: () => <div>StepAddUAS</div>,
  Step5AddAGSE: () => <div>StepAddAGSE</div>,
  StepReview: () => <div>StepReview</div>,
}));

describe('CreateTaskForceTab', () => {
  it('renders the multi-step form provider', () => {
    renderWithProviders(<CreateTaskForceTab />);

    expect(screen.getByTestId('multi-step-form-provider')).toBeInTheDocument();
  });
});
