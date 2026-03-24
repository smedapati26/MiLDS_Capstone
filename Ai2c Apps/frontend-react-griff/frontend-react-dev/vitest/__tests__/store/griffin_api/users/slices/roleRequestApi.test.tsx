import { describe, expect, it } from 'vitest';
import { GRIFFIN_MOCK_BASE_URL } from 'vitest/mocks/griffin_api_handlers/users/handlers';

import { roleRequestApi } from '@store/griffin_api/users/slices';

vi.resetModules();

// Mock environment variable
vi.mock('@store/griffin_api/base_urls', () => ({
  GRIFFIN_USER_BASE_URL: GRIFFIN_MOCK_BASE_URL,
}));

describe('roleRequestApi', () => {

  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(roleRequestApi.reducerPath).toBe('roleRequestApi');
    });

    it('should have correct base query configuration', () => {
      expect(roleRequestApi.endpoints).toBeDefined();
      expect(Object.keys(roleRequestApi.endpoints)).toHaveLength(3);
    });

    it('should export all expected hooks', () => {
      expect(roleRequestApi.useCreateRoleRequestMutation).toBeDefined();
      expect(roleRequestApi.useDeleteRoleRequestMutation).toBeDefined();
      expect(roleRequestApi.useGetRoleRequestsByUserIdQuery).toBeDefined();
    });
  });
});
