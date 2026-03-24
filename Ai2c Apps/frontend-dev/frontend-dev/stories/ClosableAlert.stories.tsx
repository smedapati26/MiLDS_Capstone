import type { Meta, StoryObj } from '@storybook/react';

import { ClosableAlert } from '../components/ClosableAlert';

const meta: Meta<typeof ClosableAlert> = {
  title: 'Components/ClosableAlert',
  component: ClosableAlert,
};

export default meta;

type Story = StoryObj<typeof ClosableAlert>;

// eslint-disable-next-line sonarjs/no-globals-shadowing
export const Error: Story = {
  args: {
    severity: 'error',
    children: 'This is an error alert',
  },
};

export const Warning: Story = {
  args: {
    severity: 'warning',
    children: 'This is a warning alert',
  },
};

export const Info: Story = {
  args: {
    severity: 'info',
    children: 'This is an info alert',
  },
};

export const Success: Story = {
  args: {
    severity: 'success',
    children: 'This is a success alert',
  },
};

export const WithLongContent: Story = {
  args: {
    severity: 'info',
    children:
      "This is a longer alert message that demonstrates how the component handles more content. It might include multiple sentences or even paragraphs of text to show the alert's flexibility with different content lengths.",
  },
};
