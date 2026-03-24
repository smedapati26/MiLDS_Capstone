import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import PmxCheckboxTree from '@components/PmxCheckboxTree';

const sampleCheckboxes = [
  {
    id: '1',
    label: 'Parent 1',
    children: [
      { id: '2', label: 'Child 1' },
      { id: '3', label: 'Child 2' },
    ],
  },
  { id: '4', label: 'Parent 2' },
];

describe('PmxCheckboxTree', () => {
  it('renders checkboxes correctly', () => {
    render(<PmxCheckboxTree checkboxes={sampleCheckboxes} values={{}} onChange={() => {}} />);
    const parent1 = screen.getByLabelText('Parent 1');
    const child1 = screen.getByLabelText('Child 1');
    const child2 = screen.getByLabelText('Child 2');
    const parent2 = screen.getByLabelText('Parent 2');

    expect(parent1).toBeInTheDocument();
    expect(child1).toBeInTheDocument();
    expect(child2).toBeInTheDocument();
    expect(parent2).toBeInTheDocument();
  });

  it('handles checkbox state changes', () => {
    const handleChange = vi.fn();
    render(
      <PmxCheckboxTree
        checkboxes={sampleCheckboxes}
        values={{ '1': false, '2': false, '3': false, '4': false }}
        onChange={handleChange}
      />,
    );

    const parent1 = screen.getByLabelText('Parent 1');
    const child1 = screen.getByLabelText('Child 1');

    fireEvent.click(parent1);
    expect(handleChange).toHaveBeenCalledWith({ '1': true, '2': true, '3': true, '4': false });

    fireEvent.click(child1);
    expect(handleChange).toHaveBeenCalledWith({ '1': true, '2': false, '3': true, '4': false });

    const parent2 = screen.getByLabelText('Parent 2');
    fireEvent.click(parent2);
    expect(handleChange).toHaveBeenCalledWith({ '1': true, '2': false, '3': true, '4': true });
  });
});
