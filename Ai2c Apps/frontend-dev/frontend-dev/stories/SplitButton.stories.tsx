import type { Meta, StoryObj } from '@storybook/react';

import { SplitButton } from '../components/SplitButton';

const meta: Meta<typeof SplitButton> = {
  title: 'Components/SplitButton',
  component: SplitButton,
};

export default meta;

type Story = StoryObj<typeof SplitButton>;

export const Primary: Story = {
  args: {
    options: ['Option 1', 'Option 2', 'Option 3'],
    handleClick: (value: string) => console.log('Selected:', value),
  },
};
