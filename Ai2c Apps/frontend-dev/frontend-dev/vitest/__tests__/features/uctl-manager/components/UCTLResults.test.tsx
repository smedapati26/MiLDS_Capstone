/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
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

// @ts-expect-error
const makeUnit = (id, title, mos, skillLevels, children = []) => ({
  id,
  title,
  metaData: mos.map((m: any) => ({
    name: m,
    children: skillLevels.map((sl: any) => ({ name: sl })),
  })),
  children,
});

describe('UnitListDisplay', () => {
  const grandparent = makeUnit('G1', 'Grandparent Unit', ['11B'], ['3']);
  const childOne = makeUnit('C1', 'Child One', ['91B'], ['1', '2']);
  const childTwo = makeUnit('C2', 'Child Two', ['15F'], ['3']);
  //@ts-expect-error
  const parent = makeUnit('P1', 'Parent Unit', ['12B'], ['2'], [childOne, childTwo]);

  const onSelect = vi.fn();

  const renderList = (props = {}) =>
    render(
      <UnitListDisplay
        //@ts-expect-error
        grandparent={grandparent}
        //@ts-expect-error
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

  it('filters by MOS', () => {
    renderList({ selectedTableMOS: ['91B'] });
    expect(screen.getByText('Child One')).toBeInTheDocument();
    expect(screen.queryByText('Child Two')).not.toBeInTheDocument();
    expect(screen.queryByText('Parent Unit')).not.toBeInTheDocument();
  });

  it('filters by skill level', () => {
    renderList({ tableSkillLevels: ['3'] });
    expect(screen.getByText('Grandparent Unit')).toBeInTheDocument();
    expect(screen.getByText('Child Two')).toBeInTheDocument();
    expect(screen.queryByText('Parent Unit')).not.toBeInTheDocument();
  });

  it('highlights the selected unit', () => {
    renderList({ selectedUnit: parent });
    const item = screen.getByText('Parent Unit').closest('li');
    expect(item).toHaveStyle('background-color: #1976d2');
  });

  it('calls onSelect when a unit is clicked', () => {
    renderList();
    fireEvent.click(screen.getByText('Child One'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'C1' }));
  });

  it('displays MOS and aggregated skill levels', () => {
    renderList();

    expect(screen.getByText('11B')).toBeInTheDocument();
    expect(screen.getByText('12B')).toBeInTheDocument();
    expect(screen.getByText('91B')).toBeInTheDocument();
    expect(screen.getByText('15F')).toBeInTheDocument();

    expect(screen.getAllByText('(3)')).toHaveLength(2); // grandparent + child two
    expect(screen.getByText('(2)')).toBeInTheDocument(); // parent
    expect(screen.getByText('(1, 2)')).toBeInTheDocument(); // child one
  });
});
