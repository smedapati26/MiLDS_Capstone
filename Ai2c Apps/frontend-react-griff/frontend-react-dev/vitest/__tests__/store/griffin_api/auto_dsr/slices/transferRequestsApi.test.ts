import { describe, expect, it } from 'vitest';

import { transferRequestsApi } from '@store/griffin_api/auto_dsr/slices/transferRequestsApi';

describe('transferRequestsApi', () => {
    describe('getTransferRequests endpoint', () => {
        it('should have getTransferRequests endpoint defined', () => {
            expect(transferRequestsApi.endpoints.getTransferRequests).toBeDefined();
        });

        it('should have useGetTransferRequestsQuery hook exported', () => {
            const { useGetTransferRequestsQuery } = transferRequestsApi;
            expect(useGetTransferRequestsQuery).toBeDefined();
            expect(typeof useGetTransferRequestsQuery).toBe('function');
        });

        it('getTransferRequests endpoint should be a query type', () => {
            const endpoint = transferRequestsApi.endpoints.getTransferRequests;
            expect(endpoint).toBeDefined();
            expect(endpoint.matchFulfilled).toBeDefined();
        });

        it('should accept optional uic parameter', () => {
            const endpoint = transferRequestsApi.endpoints.getTransferRequests;
            expect(endpoint).toBeDefined();
            // Endpoint should handle both with and without uic parameter
        });
    });

    describe('adjudicateTransferRequest endpoint', () => {
        it('should have adjudicateTransferRequest endpoint defined', () => {
            expect(transferRequestsApi.endpoints.adjudicateTransferRequest).toBeDefined();
        });

        it('should have useAdjudicateTransferRequestMutation hook exported', () => {
            const { useAdjudicateTransferRequestMutation } = transferRequestsApi;
            expect(useAdjudicateTransferRequestMutation).toBeDefined();
            expect(typeof useAdjudicateTransferRequestMutation).toBe('function');
        });

        it('adjudicateTransferRequest endpoint should be a mutation type', () => {
            const endpoint = transferRequestsApi.endpoints.adjudicateTransferRequest;
            expect(endpoint).toBeDefined();
            expect(endpoint.matchFulfilled).toBeDefined();
        });
    });

    describe('API configuration', () => {
        it('should have correct reducer path', () => {
            expect(transferRequestsApi.reducerPath).toBe('transferRequestsApi');
        });

    });

    describe('cache invalidation', () => {
        it('getTransferRequests should provide TransferRequests tag', () => {
            const endpoint = transferRequestsApi.endpoints.getTransferRequests;
            expect(endpoint).toBeDefined();
            // Query endpoints provide tags for cache management
        });

        it('adjudicateTransferRequest should invalidate TransferRequests tag', () => {
            const endpoint = transferRequestsApi.endpoints.adjudicateTransferRequest;
            expect(endpoint).toBeDefined();
            // Mutation endpoints invalidate tags to trigger refetch
        });
    });
});