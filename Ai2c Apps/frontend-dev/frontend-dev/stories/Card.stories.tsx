import type { Meta, StoryObj } from '@storybook/react';

import { Card } from '../components/Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Primary: Story = {
  args: {
    children: 'Card Content',
  },
};

export const Basic: Story = {
  args: {
    children: 'Basic Card Content',
  },
};

export const Selected: Story = {
  args: {
    children: 'Selected Card Content',
    className: 'selected',
  },
};
