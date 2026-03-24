import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import AddEditFormWrapper from '@features/maintenance-schedule/components/Calendar/VerticalToolbar/AddEditFormWrapper';

import { store } from '@store/store';

interface AddEditMaintenanceFormProps {
  buttonLabel: string;
  onCancel: () => void;
  onSubmit: () => void;
}
interface AddEditLaneFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

vi.mock('@features/maintenance-schedule/components/Calendar/AddEditMaintenance/AddEditMaintenanceForm', () => ({
  default: ({ buttonLabel, onCancel, onSubmit }: AddEditMaintenanceFormProps) => (
    <div data-testid="add-edit-maint-form">
      Maint Form - {buttonLabel}
      <button onClick={onCancel}>Cancel Maint</button>
      <button onClick={onSubmit}>Submit Maint</button>
    </div>
  ),
}));

vi.mock('@features/maintenance-schedule/components/Calendar/AddEditLaneForm/AddEditLaneForm', () => ({
  default: ({ onCancel, onSubmit }: AddEditLaneFormProps) => (
    <div data-testid="add-edit-lane-form">
      Lane Form
      <button onClick={onCancel}>Cancel Lane</button>
      <button onClick={onSubmit}>Submit Lane</button>
    </div>
  ),
}));

const renderComponent = (props = {}) =>
  render(
    <Provider store={store}>
      <AddEditFormWrapper type="add" onCancel={vi.fn()} onSubmit={vi.fn()} {...props} />
    </Provider>,
  );

describe('<AddEditFormWrapper />', () => {
  it('renders with default form type as "lane"', () => {
    renderComponent({ defaultFormType: 'lane' });
    expect(screen.getByTestId('add-edit-lane-form')).toBeInTheDocument();
    expect(screen.queryByTestId('add-edit-maint-form')).not.toBeInTheDocument();
  });

  it('renders with default form type as "maint"', () => {
    renderComponent({ defaultFormType: 'maint' });
    expect(screen.getByTestId('add-edit-maint-form')).toBeInTheDocument();
    expect(screen.queryByTestId('add-edit-lane-form')).not.toBeInTheDocument();
  });

  it('renders with type="edit" and shows correct button label', () => {
    renderComponent({ type: 'edit', defaultFormType: 'maint' });
    expect(screen.getByText(/Maint Form - Update/)).toBeInTheDocument();
  });

  it('toggles form type using buttons', () => {
    renderComponent({ defaultFormType: 'maint' });

    // Initially renders maintenance
    expect(screen.getByTestId('add-edit-maint-form')).toBeInTheDocument();

    // Click lane button
    fireEvent.click(screen.getByRole('button', { name: /lane/i }));
    expect(screen.getByTestId('add-edit-lane-form')).toBeInTheDocument();

    // Click maintenance button
    fireEvent.click(screen.getByRole('button', { name: /maint/i }));
    expect(screen.getByTestId('add-edit-maint-form')).toBeInTheDocument();
  });

  it('calls onCancel and onSubmit correctly in maintenance form', () => {
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    renderComponent({ defaultFormType: 'maint', onCancel, onSubmit });

    fireEvent.click(screen.getByText('Cancel Maint'));
    fireEvent.click(screen.getByText('Submit Maint'));

    expect(onCancel).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
  });

  it('calls onCancel and onSubmit correctly in lane form', () => {
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    renderComponent({ defaultFormType: 'lane', onCancel, onSubmit });

    fireEvent.click(screen.getByText('Cancel Lane'));
    fireEvent.click(screen.getByText('Submit Lane'));

    expect(onCancel).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
  });
});
