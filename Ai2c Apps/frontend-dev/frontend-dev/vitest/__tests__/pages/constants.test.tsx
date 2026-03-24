import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import { currentPermissionsColumn, requestPermissionsColumns } from '@pages/constants';
import { ISoldier } from '@store/amap_ai/soldier';

describe('Permission Columns Config', () => {
  it('currentPermissionsColumn has correct headers', () => {
    expect(currentPermissionsColumn.map((c) => c.header)).toEqual(['Unit', 'Permissions']);
  });

  it('requestPermissionsColumns has correct headers', () => {
    expect(requestPermissionsColumns.map((c) => c.header)).toEqual(['Unit', 'Permissions', 'Approver(s)']);
  });

  it('requestPermissionsColumns capitalizes permission values', () => {
    const col = requestPermissionsColumns.find((c) => c.field === 'permission');
    expect(col).toBeDefined();

    // @ts-expect-error renderCell exists
    const rendered = col!.renderCell('manager');
    expect(rendered).toBe('Manager');
  });

  it('requestPermissionsColumns renders approvers as JSX with tooltip', () => {
    const approvers: ISoldier[] = [
      {
        userId: '1',
        rank: 'CPT',
        firstName: 'John',
        lastName: 'Doe',
        dodEmail: 'john.doe@army.mil',
        allMosAndMl: [],
        unitId: 'UNIT1',
        unit: 'Alpha Company',
        isAdmin: false,
        isMaintainer: false,
        receiveEmails: true,
        birthMonth: 'January',
      },
      {
        userId: '2',
        rank: 'SSG',
        firstName: 'Jane',
        lastName: 'Smith',
        dodEmail: undefined,
        allMosAndMl: [],
        unitId: 'UNIT2',
        unit: 'Bravo Company',
        isAdmin: false,
        isMaintainer: false,
        receiveEmails: true,
        birthMonth: 'February',
      },
    ];

    const col = requestPermissionsColumns.find((c) => c.field === 'approvers');
    expect(col).toBeDefined();

    // Render the JSX returned by renderCell
    // @ts-expect-error renderCell exists
    const jsx = col!.renderCell(approvers);
    render(<>{jsx}</>);

    // Should show the names in the tooltip content
    expect(screen.getByText('CPT John Doe,')).toBeInTheDocument();
    expect(screen.getByText('SSG Jane Smith')).toBeInTheDocument();
  });

  it('requestPermissionsColumns returns null for empty approvers', () => {
    const col = requestPermissionsColumns.find((c) => c.field === 'approvers');
    expect(col).toBeDefined();

    // @ts-expect-error renderCell exists
    expect(col!.renderCell([])).toBeNull();
  });
});
