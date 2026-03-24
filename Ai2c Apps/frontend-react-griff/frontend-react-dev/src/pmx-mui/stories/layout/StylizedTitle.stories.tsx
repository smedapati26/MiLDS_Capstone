import type { Meta, StoryObj } from '@storybook/react';

import { StylizedTitle } from '../../components/layout/StylizedTitle';

const meta: Meta<typeof StylizedTitle> = {
  title: 'Components/StylizedTitle',
  component: StylizedTitle,
};

export default meta;

type Story = StoryObj<typeof StylizedTitle>;

export const Primary: Story = {
  args: {
    title: 'Example Title',
  },
};
