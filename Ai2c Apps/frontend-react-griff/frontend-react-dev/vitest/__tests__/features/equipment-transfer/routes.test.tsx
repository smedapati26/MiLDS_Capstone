import { describe, expect, it } from 'vitest';

import { equipmentTransferRoutes } from '@features/equipment-transfer/routes';

describe('equipmentTransferRoutes', () => {
    it('should have a route for Transfer', () => {
        const transferRoute = equipmentTransferRoutes.find((route) => route.path === 'transfer');
        expect(transferRoute).toBeDefined();
    });

    it('should have a route for Requests', () => {
        const requestsRoute = equipmentTransferRoutes.find((route) => route.path === 'requests');
        expect(requestsRoute).toBeDefined();
    });

    it('should have a child route for Aircraft under Transfer', () => {
        const transferRoute = equipmentTransferRoutes.find((route) => route.path === 'transfer');
        const aircraftRoute = transferRoute?.children?.find((child) => child.path === 'aircraft');
        expect(aircraftRoute).toBeDefined();
    });

    it('should have a child route for UAS under Transfer', () => {
        const transferRoute = equipmentTransferRoutes.find((route) => route.path === 'transfer');
        const uasRoute = transferRoute?.children?.find((child) => child.path === 'uas');
        expect(uasRoute).toBeDefined();
    });

    it('should have a child route for AGSE under Transfer', () => {
        const transferRoute = equipmentTransferRoutes.find((route) => route.path === 'transfer');
        const agseRoute = transferRoute?.children?.find((child) => child.path === 'agse');
        expect(agseRoute).toBeDefined();
    });
});