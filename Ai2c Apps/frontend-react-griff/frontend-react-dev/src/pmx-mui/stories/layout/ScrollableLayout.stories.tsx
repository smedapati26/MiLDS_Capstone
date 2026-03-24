import type { Meta, StoryObj } from '@storybook/react';

import { ScrollableLayout } from '../../components/layout/ScrollableLayout';

const meta: Meta<typeof ScrollableLayout> = {
  title: 'Components/Layout/ScrollableLayout',
  component: ScrollableLayout,
};

export default meta;
type Story = StoryObj<typeof ScrollableLayout>;

const LongContent = () => (
  <div style={{ height: '2000px' }}>
    <h1>Scrollable Content</h1>
    <p>This content is long enough to cause scrolling</p>
  </div>
);

export const WithTitle: Story = {
  args: {
    title: 'Page Title',
    children: <LongContent />,
  },
};

export const WithoutTitle: Story = {
  args: {
    children: <LongContent />,
  },
};
