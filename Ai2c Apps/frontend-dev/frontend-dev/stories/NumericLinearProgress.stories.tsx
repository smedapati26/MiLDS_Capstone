import type { Meta, StoryObj } from '@storybook/react';

import { NumericLinearProgress } from '../components/NumericLinearProgress';

const meta: Meta<typeof NumericLinearProgress> = {
  title: 'Components/NumericLinearProgress',
  component: NumericLinearProgress,
};

export default meta;

type Story = StoryObj<typeof NumericLinearProgress>;

export const Primary: Story = {
  args: {
    progress: 50,
  },
};

export const Complete: Story = {
  args: {
    progress: 100,
  },
};

export const Starting: Story = {
  args: {
    progress: 0,
  },
};
