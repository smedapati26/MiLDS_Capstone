import type { Meta, StoryObj } from '@storybook/react';

import { Heading } from '../components/Heading';

const meta: Meta<typeof Heading> = {
  title: 'Components/Heading',
  component: Heading,
};

export default meta;

type Story = StoryObj<typeof Heading>;

export const Primary: Story = {
  args: {
    children: 'Example Heading',
    variant: 'h2',
  },
};

export const WithMargin: Story = {
  args: {
    children: 'Heading with Custom Margin',
    variant: 'h1',
    sx: { marginBottom: 5 },
  },
};
