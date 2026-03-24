import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import UnitListDisplay from '@features/uctl-manager/components/UnitListDisplay';

vi.mock('@mui/material/styles', () => ({
  useTheme: () => ({
    palette: {
      mode: 'light',
      primary: { main: '#1976d2', contrastText: '#fff', dark: '#115293' },
      grey: { l40: '#ccc', d40: '#444' },
      action: { hover: '#eee' },
    },
  }),
}));

const makeUnit = (id: string, title: string, mos: string[], skillLevels: string[]) => ({
  id,
  title,
  metaData: mos.map((m) => ({
    name: m,
    children: skillLevels.map((sl) => ({ name: sl })),
  })),
  children: [],
});

describe('UnitListDisplay', () => {
  const grandparent = makeUnit('G1', 'Grandparent Unit', ['11B'], ['3']);
  const parent = {
    ...makeUnit('P1', 'Parent Unit', ['12B'], ['2']),
    children: [makeUnit('C1', 'Child One', ['91B'], ['1', '2']), makeUnit('C2', 'Child Two', ['15F'], ['3'])],
  };

  const onSelect = vi.fn();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderList = (props: any = {}) =>
    render(
      <UnitListDisplay
        grandparent={grandparent}
        parent={parent}
        selectedTableMOS={[]}
        tableSkillLevels={[]}
        selectedUnit={null}
        onSelect={onSelect}
        {...props}
      />,
    );

  it('renders grandparent, parent, and children', () => {
    renderList();

    expect(screen.getByText('Grandparent Unit')).toBeInTheDocument();
    expect(screen.getByText('Parent Unit')).toBeInTheDocument();
    expect(screen.getByText('Child One')).toBeInTheDocument();
    expect(screen.getByText('Child Two')).toBeInTheDocument();
  });

  it('filters units by MOS', () => {
    renderList({ selectedTableMOS: ['91B'] });

    expect(screen.getByText('Child One')).toBeInTheDocument();
    expect(screen.queryByText('Child Two')).not.toBeInTheDocument();
    expect(screen.queryByText('Parent Unit')).not.toBeInTheDocument();
  });

  it('filters units by Skill Level', () => {
    renderList({ tableSkillLevels: ['3'] });

    expect(screen.getByText('Grandparent Unit')).toBeInTheDocument();
    expect(screen.getByText('Child Two')).toBeInTheDocument();
    expect(screen.queryByText('Parent Unit')).not.toBeInTheDocument();
  });

  it('highlights selected unit', () => {
    renderList({ selectedUnit: parent });

    const parentItem = screen.getByText('Parent Unit').closest('li');
    expect(parentItem).toHaveStyle('background-color: #1976d2');
  });

  it('calls onSelect when a unit is clicked', () => {
    renderList();

    fireEvent.click(screen.getByText('Child One'));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'C1', title: 'Child One' }));
  });

  it('displays MOS list and aggregated skill levels', () => {
    renderList();

    expect(screen.getByText('11B')).toBeInTheDocument();
    expect(screen.getByText('12B')).toBeInTheDocument();
    expect(screen.getByText('91B')).toBeInTheDocument();

    // Skill levels appear in parentheses
    expect(screen.getAllByText('(3)')).toHaveLength(2);
    expect(screen.getAllByText('(2)')).toHaveLength(1);
  });
});
