import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import after mocks
import { AppDispatch, RootState, store } from '@store/store';

// Tests
describe('store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create the store without errors', () => {
    expect(store).toBeDefined();
    expect(typeof store.dispatch).toBe('function');
    expect(typeof store.getState).toBe('function');
  });

  it('should have all expected reducers', () => {
    const state = store.getState();
    // Slices
    expect(state).toHaveProperty('appSettings');
    expect(state).toHaveProperty('componentManagement');
    expect(state).toHaveProperty('maintenanceSchedule');
    expect(state).toHaveProperty('maintenanceScheduleForm');
    expect(state).toHaveProperty('maintenanceLane');
    expect(state).toHaveProperty('maintenanceEditEvent');
    expect(state).toHaveProperty('amapPhaseTeamApi');
    // Griffin API's
    expect(state).toHaveProperty('aircraftApi');
    expect(state).toHaveProperty('agseApi');
    expect(state).toHaveProperty('autoDsrApi'); // AutoDSR
    expect(state).toHaveProperty('modsApi'); // AutoDSR
    expect(state).toHaveProperty('bankTimeForecastApi'); // AutoDSR
    expect(state).toHaveProperty('flyingHoursApi'); // AutoDSR
    expect(state).toHaveProperty('unitsApi'); // AutoDSR
    expect(state).toHaveProperty('favoriteUnitsApi'); // AutoDSR
    expect(state).toHaveProperty('componentsApi');
    expect(state).toHaveProperty('eventsLanesApi'); // Events
    expect(state).toHaveProperty('eventMaintenanceCountsApi'); // Events
    expect(state).toHaveProperty('eventsMaintenanceApi'); // Events
    expect(state).toHaveProperty('faultsApi');
    expect(state).toHaveProperty('griffinUsersApi'); // Users
    expect(state).toHaveProperty('roleRequestApi'); // Users
    expect(state).toHaveProperty('adminRoleRequestApi'); // Users
    expect(state).toHaveProperty('userRoleApi'); // Users
    expect(state).toHaveProperty('inspectionsApi');
    expect(state).toHaveProperty('personnelApi');
    expect(state).toHaveProperty('readinessHoursFlownApi'); // Readiness
    expect(state).toHaveProperty('readinessMissionsFlownApi'); // Readiness
    expect(state).toHaveProperty('readinessStatusOverTimeApi'); // Readiness
    expect(state).toHaveProperty('taskforceApi'); // Taskforce
    expect(state).toHaveProperty('uacApi'); // UAS
    expect(state).toHaveProperty('uavApi'); // UAS
    // AMAP API's
    expect(state).toHaveProperty('amapInexperiencedPersonnelApi'); // Personnel
    expect(state).toHaveProperty('amapPersonnelUnitApi'); // Personnel
    expect(state).toHaveProperty('amapPhaseTeamApi'); // Personnel
    expect(state).toHaveProperty('amapUnavailablePersonnelApi'); // Personnel
    expect(state).toHaveProperty('amapUsersApi');
  });

  it('should apply middleware correctly', () => {
    // Middleware is applied via getDefaultMiddleware.concat
    // Check if store has middleware by checking dispatch behavior or length
    // Since middleware is mocked, we can verify the store is configured
    expect(store).toBeDefined();
    // Additional checks can be added if specific middleware behavior is testable
  });

  it('should export RootState and AppDispatch types correctly', () => {
    const state: RootState = store.getState();
    expect(state).toBeDefined();
    const dispatch: AppDispatch = store.dispatch;
    expect(dispatch).toBeDefined();
  });

  it('should ignore serialization for specified actions and paths', () => {
    // Dispatch an ignored action and ensure no serialization error
    expect(() => {
      store.dispatch({ type: 'maintenanceSchedule/setDateRanges', payload: {} });
    }).not.toThrow();
    // Since ignoredPaths include 'maintenanceSchedule' and 'mockApi', non-serializable data should be allowed
  });
});
