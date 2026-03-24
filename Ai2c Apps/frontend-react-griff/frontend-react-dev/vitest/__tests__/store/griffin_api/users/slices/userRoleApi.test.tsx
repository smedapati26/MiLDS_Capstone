import { describe, expect, it } from 'vitest';
import { GRIFFIN_MOCK_BASE_URL } from 'vitest/mocks/griffin_api_handlers/users/handlers';

import { userRoleApi } from '@store/griffin_api/users/slices';

vi.resetModules();

// Mock environment variable
vi.mock('@store/griffin_api/base_urls', () => ({
  GRIFFIN_USER_BASE_URL: GRIFFIN_MOCK_BASE_URL,
}));

describe('userRoleApi', () => {

  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(userRoleApi.reducerPath).toBe('userRoleApi');
    });

    it('should have correct base query configuration', () => {
      expect(userRoleApi.endpoints).toBeDefined();
      expect(Object.keys(userRoleApi.endpoints)).toHaveLength(4);
    });

    it('should export all expected hooks', () => {
      expect(userRoleApi.useCreateRoleMutation).toBeDefined();
      expect(userRoleApi.useUpdateRoleMutation).toBeDefined();
      expect(userRoleApi.useGetRolesByUserIdQuery).toBeDefined();
      expect(userRoleApi.useGetRolesQuery).toBeDefined();
    });
  });
});
