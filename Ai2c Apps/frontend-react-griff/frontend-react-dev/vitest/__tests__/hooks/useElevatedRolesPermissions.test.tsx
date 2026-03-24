import { Provider } from 'react-redux';
import { useElevatedRolesPermissions } from 'src/hooks/useElevatedRolesPermissions';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import { useGetAmapUserElevatedRolesQuery } from '@store/amap_api/users/slices/amapUsersApi';
import { useGetUserElevatedRolesQuery } from '@store/griffin_api/users/slices';
import { useAppDispatch } from '@store/hooks';
import { setAmapUnitPermissions, setUnitPermissions } from '@store/slices/appSettingsSlice';
import { store } from '@store/store';

// Mock the dependencies
vi.mock('@store/amap_api/users/slices/amapUsersApi');
vi.mock('@store/griffin_api/users/slices');
vi.mock('@store/hooks');
vi.mock('@store/store');

const mockUseGetUserElevatedRolesQuery = useGetUserElevatedRolesQuery as unknown as ReturnType<typeof vi.fn>;
const mockUseGetAmapUserElevatedRolesQuery = useGetAmapUserElevatedRolesQuery as unknown as ReturnType<typeof vi.fn>;
const mockUseAppDispatch = useAppDispatch as unknown as ReturnType<typeof vi.fn>;
const mockStore = store as unknown as { getState: ReturnType<typeof vi.fn> };

const mockDispatch = vi.fn();
mockUseAppDispatch.mockReturnValue(mockDispatch);

const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>;

describe('useElevatedRolesPermissions', () => {
  const userId = 'test-user';
  const currentUic = 'TEST_UIC';
  const mockElevatedRoles = { admin: ['ADMIN_UIC'], write: ['WRITE_UIC'] };
  const mockAmapElevatedRoles = { viewer: ['TEST_UIC'], recorder: ['TEST_UIC'], manager: ['TEST_UIC'] };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.getState.mockReturnValue({
      appSettings: {
        currentUnitAmapManager: false,
        currentUnitAmapRecorder: false,
        currentUnitAmapViewer: false,
      },
    });
  });

  it('dispatches setUnitPermissions when elevatedRoles and currentUic are available', () => {
    mockUseGetUserElevatedRolesQuery.mockReturnValue({ data: mockElevatedRoles });
    mockUseGetAmapUserElevatedRolesQuery.mockReturnValue({ data: undefined });

    renderHook(() => useElevatedRolesPermissions(userId, currentUic), { wrapper });

    expect(mockDispatch).toHaveBeenCalledWith(
      setUnitPermissions({
        adminUics: mockElevatedRoles.admin,
        writeUics: mockElevatedRoles.write,
      }),
    );
  });

  it('does not dispatch setUnitPermissions when elevatedRoles is undefined', () => {
    mockUseGetUserElevatedRolesQuery.mockReturnValue({ data: undefined });
    mockUseGetAmapUserElevatedRolesQuery.mockReturnValue({ data: undefined });

    renderHook(() => useElevatedRolesPermissions(userId, currentUic), { wrapper });

    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });

  it('does not dispatch setUnitPermissions when currentUic is undefined', () => {
    mockUseGetUserElevatedRolesQuery.mockReturnValue({ data: mockElevatedRoles });
    mockUseGetAmapUserElevatedRolesQuery.mockReturnValue({ data: undefined });

    renderHook(() => useElevatedRolesPermissions(userId, undefined), { wrapper });

    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });

  it('dispatches setAmapUnitPermissions when amapElevatedRoles and currentUic are available and not already set', () => {
    mockUseGetUserElevatedRolesQuery.mockReturnValue({ data: undefined });
    mockUseGetAmapUserElevatedRolesQuery.mockReturnValue({ data: mockAmapElevatedRoles });

    renderHook(() => useElevatedRolesPermissions(userId, currentUic), { wrapper });

    expect(mockDispatch).toHaveBeenCalledWith(
      setAmapUnitPermissions({
        viewerUics: mockAmapElevatedRoles.viewer,
        recorderUics: mockAmapElevatedRoles.recorder,
        managerUics: mockAmapElevatedRoles.manager,
      }),
    );
  });

  it('does not dispatch setAmapUnitPermissions when already set', () => {
    // Set state to match the includes, so alreadySet is true
    mockStore.getState.mockReturnValue({
      appSettings: {
        currentUnitAmapManager: true,
        currentUnitAmapRecorder: true,
        currentUnitAmapViewer: true,
      },
    });
    mockUseGetUserElevatedRolesQuery.mockReturnValue({ data: undefined });
    mockUseGetAmapUserElevatedRolesQuery.mockReturnValue({ data: mockAmapElevatedRoles });

    renderHook(() => useElevatedRolesPermissions(userId, currentUic), { wrapper });

    // Since state matches the expected values, alreadySet is true, so no dispatch
    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });

  it('does not dispatch setAmapUnitPermissions when amapElevatedRoles is undefined', () => {
    mockUseGetUserElevatedRolesQuery.mockReturnValue({ data: undefined });
    mockUseGetAmapUserElevatedRolesQuery.mockReturnValue({ data: undefined });

    renderHook(() => useElevatedRolesPermissions(userId, currentUic), { wrapper });

    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });

  it('does not dispatch setAmapUnitPermissions when currentUic is undefined', () => {
    mockUseGetUserElevatedRolesQuery.mockReturnValue({ data: undefined });
    mockUseGetAmapUserElevatedRolesQuery.mockReturnValue({ data: mockAmapElevatedRoles });

    renderHook(() => useElevatedRolesPermissions(userId, undefined), { wrapper });

    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });
});
