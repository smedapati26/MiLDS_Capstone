import type { Meta, StoryObj } from '@storybook/react';

import { ClassificationBanner } from '../../components/layout/ClassificationBanner';
import { Classification } from '../../models/Classification';

const meta: Meta<typeof ClassificationBanner> = {
  title: 'Components/Layout/ClassificationBanner',
  component: ClassificationBanner,
};

export default meta;
type Story = StoryObj<typeof ClassificationBanner>;

export const UNCLASSIFIED: Story = {
  args: {
    type: Classification.UNCLASSIFIED,
  },
};

export const CONFIDENTIAL: Story = {
  args: {
    type: Classification.CONFIDENTIAL,
  },
};
