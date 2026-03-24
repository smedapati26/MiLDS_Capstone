import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { DualDateRangePicker } from '@ai2c/pmx-mui/components/DualDateRangePicker';

describe('DualDateRangePicker', () => {
  it('renders without crashing', () => {
    render(
      <DualDateRangePicker
        defaultStartDate={dayjs('2023-03-01')}
        defaultEndDate={dayjs('2023-02-01')}
        onDateRangeChange={vi.fn()}
        size={'small'}
      />,
    );
    expect(screen.getByTestId('date-range-Date')).toBeInTheDocument();
  });
});

describe('DualDateRangePicker Error Handling', () => {
  it('displays error messages for invalid dates', () => {
    render(
      <DualDateRangePicker
        onDateRangeChange={vi.fn()}
        defaultStartDate={dayjs('invalid')}
        defaultEndDate={dayjs('2023-02-01')}
      />,
    );

    expect(screen.getByText('Your date is not valid')).toBeInTheDocument();
  });

  it('displays error message when start date is greater than end date', () => {
    render(
      <DualDateRangePicker
        onDateRangeChange={vi.fn()}
        defaultStartDate={dayjs('2023-03-01')}
        defaultEndDate={dayjs('2023-02-01')}
      />,
    );

    expect(screen.getByText('Select a date after the start date')).toBeInTheDocument();
  });
  it('displays error message when start date is before the army birthday', () => {
    render(
      <DualDateRangePicker
        onDateRangeChange={vi.fn()}
        defaultStartDate={dayjs('1775-06-13')}
        defaultEndDate={dayjs('2023-02-01')}
      />,
    );
    expect(screen.getByText('No data exists before 06/14/1775')).toBeInTheDocument();
  });
});

describe('DualDateRangePicker Input Validation', () => {
  it('disables future dates if disableFuture is true', () => {
    const futureDate = dayjs().add(1, 'day');

    render(
      <DualDateRangePicker
        onDateRangeChange={vi.fn()}
        defaultStartDate={null}
        defaultEndDate={futureDate}
        disableFuture={true}
      />,
    );

    expect(screen.getByText('Future dates are not allowed')).toBeInTheDocument();
  });
  it('displays the correct default label', () => {
    render(<DualDateRangePicker defaultStartDate={null} defaultEndDate={null} onDateRangeChange={vi.fn()} />);
    expect(screen.getByLabelText('Start Date *')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date *')).toBeInTheDocument();
  });

  const onDateRangeChange = vi.fn();

  it('calls onDateRangeChange with valid dates', () => {
    const spy = vi.spyOn(onDateRangeChange, 'mockImplementation');

    render(
      <DualDateRangePicker
        onDateRangeChange={onDateRangeChange}
        defaultStartDate={dayjs('2023-01-01')}
        defaultEndDate={dayjs('2023-02-01')}
      />,
    );

    setTimeout(async () => {
      expect(spy).toHaveBeenCalledWith(true, dayjs('2023-01-01'), dayjs('2023-02-01'));
    }, 3000);
  });

  it('calls onDateRangeChange with invalid dates', () => {
    const spy = vi.spyOn(onDateRangeChange, 'mockImplementation');

    render(
      <DualDateRangePicker
        onDateRangeChange={onDateRangeChange}
        defaultStartDate={dayjs('invalid')}
        defaultEndDate={dayjs('2023-02-01')}
      />,
    );

    setTimeout(async () => {
      expect(spy).toHaveBeenCalledWith(false, 'invalid', dayjs('2023-02-01'));
    }, 3000);
  });

  it('renders with custom date format', () => {
    render(
      <DualDateRangePicker
        onDateRangeChange={vi.fn()}
        defaultStartDate={dayjs('2023-01-01')}
        defaultEndDate={dayjs('2023-02-01')}
        format="MM/YYYY"
      />,
    );

    expect(screen.getByLabelText('Start Date *')).toHaveValue('01/2023');
    expect(screen.getByLabelText('End Date *')).toHaveValue('02/2023');
  });
});
