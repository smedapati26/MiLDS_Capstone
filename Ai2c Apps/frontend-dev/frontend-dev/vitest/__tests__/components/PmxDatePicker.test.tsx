import { describe, expect, it } from 'vitest';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { fireEvent, render, screen } from '@testing-library/react';

import PmxDatePicker from '@components/PmxDatePicker'; // Adjust the import path as necessary

import '@testing-library/jest-dom';

describe('PmxDatePicker', () => {
  it('renders correctly', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <PmxDatePicker label="Test Label" value={null} onChange={() => {}} />
      </LocalizationProvider>,
    );
    const labelElement = screen.getByLabelText('Test Label');
    expect(labelElement).toBeInTheDocument();
  });

  it('opens the calendar on input focus', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <PmxDatePicker label="Test Label" value={null} onChange={() => {}} />
      </LocalizationProvider>,
    );
    const input = screen.getByLabelText('Test Label');
    fireEvent.focus(input);

    const calendarDialog = screen.getByRole('textbox');
    expect(calendarDialog).toBeInTheDocument();
  });

  it('disables on prop input', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <PmxDatePicker label="Test Label" value={null} onChange={() => {}} disabled/>
      </LocalizationProvider>,
    );
    const input = screen.getByLabelText('Test Label');

    expect(input).toBeInTheDocument();
    expect(input).toBeDisabled();
  });
});
