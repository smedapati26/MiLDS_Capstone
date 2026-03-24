import { describe, expect, it } from 'vitest';

import {
    IAdjudicateTransferRequestPayload,
    IAdjudicateTransferRequestResponse,
} from '@store/griffin_api/auto_dsr/models/ITransferRequestAdjudication';

describe('ITransferRequestAdjudication interfaces', () => {
    describe('IAdjudicateTransferRequestPayload', () => {
        it('should accept valid payload structure', () => {
            const payload: IAdjudicateTransferRequestPayload = {
                transfer_request_ids: [1, 2, 3],
                approved: true,
            };

            expect(payload.transfer_request_ids).toEqual([1, 2, 3]);
            expect(payload.approved).toBe(true);
        });

        it('should accept single transfer request id', () => {
            const payload: IAdjudicateTransferRequestPayload = {
                transfer_request_ids: [537],
                approved: false,
            };

            expect(payload.transfer_request_ids).toHaveLength(1);
            expect(payload.transfer_request_ids[0]).toBe(537);
            expect(payload.approved).toBe(false);
        });

        it('should accept empty array of transfer request ids', () => {
            const payload: IAdjudicateTransferRequestPayload = {
                transfer_request_ids: [],
                approved: true,
            };

            expect(payload.transfer_request_ids).toHaveLength(0);
        });

        it('should accept multiple transfer request ids', () => {
            const payload: IAdjudicateTransferRequestPayload = {
                transfer_request_ids: [100, 200, 300, 400, 500],
                approved: true,
            };

            expect(payload.transfer_request_ids).toHaveLength(5);
        });
    });

    describe('IAdjudicateTransferRequestResponse', () => {
        it('should accept valid response structure with all arrays populated', () => {
            const response: IAdjudicateTransferRequestResponse = {
                user_permission: ['1120518'],
                adjudicated: ['1120519', '1120520'],
                partial: ['1120521'],
            };

            expect(response.user_permission).toEqual(['1120518']);
            expect(response.adjudicated).toEqual(['1120519', '1120520']);
            expect(response.partial).toEqual(['1120521']);
        });

        it('should accept response with empty arrays', () => {
            const response: IAdjudicateTransferRequestResponse = {
                user_permission: [],
                adjudicated: [],
                partial: [],
            };

            expect(response.user_permission).toHaveLength(0);
            expect(response.adjudicated).toHaveLength(0);
            expect(response.partial).toHaveLength(0);
        });

        it('should accept response with only adjudicated items (successful approval)', () => {
            const response: IAdjudicateTransferRequestResponse = {
                user_permission: [],
                adjudicated: ['1120518', '1120519', '1120520'],
                partial: [],
            };

            expect(response.adjudicated).toHaveLength(3);
            expect(response.user_permission).toHaveLength(0);
            expect(response.partial).toHaveLength(0);
        });

        it('should accept response with only partial items (partial approval)', () => {
            const response: IAdjudicateTransferRequestResponse = {
                user_permission: [],
                adjudicated: [],
                partial: ['1120518', '1120519'],
            };

            expect(response.partial).toHaveLength(2);
            expect(response.adjudicated).toHaveLength(0);
            expect(response.user_permission).toHaveLength(0);
        });

        it('should accept response with only user_permission items (no permission)', () => {
            const response: IAdjudicateTransferRequestResponse = {
                user_permission: ['1120518'],
                adjudicated: [],
                partial: [],
            };

            expect(response.user_permission).toHaveLength(1);
            expect(response.adjudicated).toHaveLength(0);
            expect(response.partial).toHaveLength(0);
        });

        it('should accept response with mixed results', () => {
            const response: IAdjudicateTransferRequestResponse = {
                user_permission: ['1120518'],
                adjudicated: ['1120519'],
                partial: ['1120520', '1120521'],
            };

            expect(response.user_permission).toHaveLength(1);
            expect(response.adjudicated).toHaveLength(1);
            expect(response.partial).toHaveLength(2);
        });

        it('should handle UAC serial numbers', () => {
            const response: IAdjudicateTransferRequestResponse = {
                user_permission: [],
                adjudicated: ['UAC123', 'UAC456'],
                partial: [],
            };

            expect(response.adjudicated).toContain('UAC123');
            expect(response.adjudicated).toContain('UAC456');
        });

        it('should handle UAV serial numbers', () => {
            const response: IAdjudicateTransferRequestResponse = {
                user_permission: [],
                adjudicated: [],
                partial: ['UAV789', 'UAV012'],
            };

            expect(response.partial).toContain('UAV789');
            expect(response.partial).toContain('UAV012');
        });
    });
});