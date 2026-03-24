import { describe, expect, it } from 'vitest';

import { reportsApi } from '@store/griffin_api/reports/slices/reportsApi';

describe('reportsApi', () => {
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(reportsApi.reducerPath).toBe('reportsApi');
    });

    it('should have correct base query configuration', () => {
      expect(reportsApi.endpoints).toBeDefined();
      expect(Object.keys(reportsApi.endpoints)).toHaveLength(2);
    });

    it('should export all expected hooks', () => {
      expect(reportsApi.useExportDsrPDFMutation).toBeDefined();
      expect(reportsApi.useLazyExportDsrCSVQuery).toBeDefined();
    });
  });
});
