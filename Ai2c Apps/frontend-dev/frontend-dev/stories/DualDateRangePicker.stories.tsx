import dayjs from 'dayjs';

import type { Meta, StoryObj } from '@storybook/react';

import { DualDateRangePicker } from '../components/DualDateRangePicker';

const meta: Meta<typeof DualDateRangePicker> = {
  title: 'Components/DualDateRangePicker',
  component: DualDateRangePicker,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof DualDateRangePicker>;

export const Primary: Story = {
  args: {
    label: 'Date Range',
    defaultStartDate: dayjs('2024-01-01'),
    defaultEndDate: dayjs('2024-12-31'),
    onDateRangeChange: () => {},
  },
};

export const SmallSize: Story = {
  args: {
    ...Primary.args,
    size: 'small',
  },
};

export const DisableFuture: Story = {
  args: {
    ...Primary.args,
    disableFuture: true,
    defaultStartDate: dayjs().subtract(1, 'month'),
    defaultEndDate: dayjs(),
  },
};

export const DisablePast: Story = {
  args: {
    ...Primary.args,
    disablePast: true,
    defaultStartDate: dayjs(),
    defaultEndDate: dayjs().add(1, 'month'),
  },
};

export const CustomFormat: Story = {
  args: {
    ...Primary.args,
    format: 'YYYY-MM-DD',
  },
};
