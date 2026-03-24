import type { Meta, StoryObj } from '@storybook/react';

import { CheckboxTableFilter } from '../components/CheckboxTableFilter';

const meta: Meta<typeof CheckboxTableFilter> = {
  title: 'Components/CheckboxTableFilter',
  component: CheckboxTableFilter,
};

export default meta;

type Story = StoryObj<typeof CheckboxTableFilter>;

export const Primary: Story = {
  args: {
    label: 'Filter Options',
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ],
    onCheckboxChange: (selected) => {
      console.log('Selected values:', selected);
    },
  },
};

export const WithManyOptions: Story = {
  args: {
    label: 'Status Filter',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Pending', value: 'pending' },
      { label: 'Completed', value: 'completed' },
      { label: 'Cancelled', value: 'cancelled' },
      { label: 'On Hold', value: 'on-hold' },
      { label: 'In Review', value: 'in-review' },
    ],
    onCheckboxChange: (selected) => {
      console.log('Selected values:', selected);
    },
  },
};
