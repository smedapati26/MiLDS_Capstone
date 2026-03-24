import type { Meta, StoryObj } from '@storybook/react';

import { SearchBar } from '../components/SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'Components/SearchBar',
  component: SearchBar,
};

export default meta;

type Story = StoryObj<typeof SearchBar>;

export const Primary: Story = {
  args: {
    options: ['Option 1', 'Option 2', 'Option 3'],
    small: false,
    variant: 'standard',
    color: 'default',
  },
};

export const Small: Story = {
  args: {
    options: ['Option 1', 'Option 2', 'Option 3'],
    small: true,
    variant: 'standard',
    color: 'default',
  },
};

export const Secondary: Story = {
  args: {
    options: ['Option 1', 'Option 2', 'Option 3'],
    small: false,
    variant: 'underline',
    color: 'secondary',
  },
};
