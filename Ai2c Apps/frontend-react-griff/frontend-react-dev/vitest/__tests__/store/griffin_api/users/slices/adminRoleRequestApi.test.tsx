import { describe, expect, it } from 'vitest';
import { GRIFFIN_MOCK_BASE_URL } from 'vitest/mocks/griffin_api_handlers/users/handlers';

import { adminRoleRequestApi } from '@store/griffin_api/users/slices';

vi.resetModules();

// Mock environment variable
vi.mock('@store/griffin_api/base_urls', () => ({
  GRIFFIN_USER_BASE_URL: GRIFFIN_MOCK_BASE_URL,
}));

describe('adminRoleRequestApi', () => {

  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(adminRoleRequestApi.reducerPath).toBe('adminRoleRequestApi');
    });

    it('should have correct base query configuration', () => {
      expect(adminRoleRequestApi.endpoints).toBeDefined();
      expect(Object.keys(adminRoleRequestApi.endpoints)).toHaveLength(2);
    });

    it('should export all expected hooks', () => {
      expect(adminRoleRequestApi.useGetAllRoleRequestsForAdminQuery).toBeDefined();
      expect(adminRoleRequestApi.useAdjudicateRoleRequestForAdminMutation).toBeDefined();
    });
  });
});
