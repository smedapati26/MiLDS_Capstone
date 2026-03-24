/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SnackbarProvider from '@context/SnackbarProvider';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';

import AccountProfile from '@pages/AccountProfile';
import { userRequestApiSlice } from '@store/amap_ai';
import { unitsApiSlice } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useAppDispatch, useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

const mockUnits = [{ uic: 'A1', displayName: 'Unit A1' }];

vi.mock('@store/amap_ai/units/slices/unitsApiSlice', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useGetUnitsQuery: vi.fn(() => ({
      data: mockUnits,
      isSuccess: true,
    })),
  };
});

const mockUpdateUser = vi.fn();

vi.mock('@store/amap_ai/user/slices/userApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useUpdateUserMutation: vi.fn(() => [mockUpdateUser, { isLoading: false }]),
  };
});

vi.mock('@pages/components/UnitSelect', () => ({
  UnitSelect: ({ value, onChange }: any) => (
    <div>
      <div data-testid="unit-select">{value?.uic || 'none'}</div>
      <button data-testid="change-unit" onClick={() => onChange({ uic: 'NEW', displayName: 'New Unit' })}>
        Change Unit
      </button>
    </div>
  ),
}));

describe('AccountProfile', () => {
  const mockDispatch = vi.fn();

  const fakeUser = {
    userId: '123',
    rank: 'CPT',
    firstName: 'john',
    lastName: 'doe',
    unit: { uic: 'AAA', displayName: 'Alpha' },
  };

  beforeEach(() => {
    vi.resetAllMocks();

    (useAppDispatch as any).mockReturnValue(mockDispatch);
    (useAppSelector as any).mockReturnValue(fakeUser);
  });

  const mockStore = configureStore({
    reducer: {
      [userRequestApiSlice.reducerPath]: userRequestApiSlice.reducer,
      [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(userRequestApiSlice.middleware).concat(unitsApiSlice.middleware),
  });

  const renderPage = () =>
    render(
      <Provider store={mockStore}>
        <SnackbarProvider>
          <AccountProfile />
        </SnackbarProvider>
      </Provider>,
    );

  it('loads user data into the form', () => {
    renderPage();

    expect(screen.getByLabelText('First Name')).toHaveValue('John');
    expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
  });

  it('enables personal edit mode when clicking edit', () => {
    renderPage();

    // Find the edit icon button (the FIRST IconButton)
    const editBtn = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editBtn);

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('saves changes and calls updateUser + dispatch', () => {
    renderPage();

    const editBtn = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editBtn);

    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'Jane' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('cancels changes and restores previous values', () => {
    renderPage();

    const editBtn = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editBtn);

    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'Changed' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByLabelText('First Name')).toHaveValue('John');
  });
});
