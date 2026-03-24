import { describe, expect, it } from 'vitest';

import {
    ITransferRequestDto,
    ITransferRequestUserDto,
    mapToITransferRequest,
    mapToITransferRequestUser,
    TransferObjectType,
    TransferStatus,
} from '@store/griffin_api/auto_dsr/models/ITransferRequest';

describe('ITransferRequest mappers', () => {
    describe('mapToITransferRequestUser', () => {
        it('should map user DTO to user model', () => {
            const userDto: ITransferRequestUserDto = {
                user_id: '1021004460',
                rank: 'CW3',
                first_name: 'Andrew',
                last_name: 'Thomas',
                email: 'andrew.thomas@example.com',
            };

            const result = mapToITransferRequestUser(userDto);

            expect(result.userId).toBe('1021004460');
            expect(result.rank).toBe('CW3');
            expect(result.firstName).toBe('Andrew');
            expect(result.lastName).toBe('Thomas');
            expect(result.email).toBe('andrew.thomas@example.com');
        });

        it('should handle null email', () => {
            const userDto: ITransferRequestUserDto = {
                user_id: '1021004460',
                rank: 'CW3',
                first_name: 'Andrew',
                last_name: 'Thomas',
                email: null,
            };

            const result = mapToITransferRequestUser(userDto);

            expect(result.email).toBeNull();
        });
    });

    describe('mapToITransferRequest', () => {
        it('should map aircraft transfer request DTO to model', () => {
            const dto: ITransferRequestDto = {
                id: 537,
                aircraft: '1120518',
                model: 'UH-60M',
                uac: null,
                uav: null,
                originating_uic: 'WAYCB0',
                originating_name: 'B CO, 2-25 AHB',
                destination_uic: 'TF-000249',
                destination_name: 'Diamondhead Rear Detachment',
                requested_by_user: {
                    user_id: '1021004460',
                    rank: 'CW3',
                    first_name: 'Andrew',
                    last_name: 'Thomas',
                    email: null,
                },
                requested_object_type: TransferObjectType.AIRCRAFT,
                originating_unit_approved: true,
                destination_unit_approved: false,
                permanent_transfer: false,
                date_requested: '2025-02-28',
                status: TransferStatus.NEW,
                last_updated_datetime: '2025-02-28T23:21:09.674Z',
            };

            const result = mapToITransferRequest(dto);

            expect(result.id).toBe(537);
            expect(result.aircraft).toBe('1120518');
            expect(result.model).toBe('UH-60M');
            expect(result.uac).toBeNull();
            expect(result.uav).toBeNull();
            expect(result.originatingUic).toBe('WAYCB0');
            expect(result.originatingName).toBe('B CO, 2-25 AHB');
            expect(result.destinationUic).toBe('TF-000249');
            expect(result.destinationName).toBe('Diamondhead Rear Detachment');
            expect(result.requestedObjectType).toBe(TransferObjectType.AIRCRAFT);
            expect(result.originatingUnitApproved).toBe(true);
            expect(result.destinationUnitApproved).toBe(false);
            expect(result.permanentTransfer).toBe(false);
            expect(result.dateRequested).toBe('2025-02-28');
            expect(result.status).toBe(TransferStatus.NEW);
            expect(result.lastUpdatedDatetime).toBe('2025-02-28T23:21:09.674Z');
        });

        it('should map UAC transfer request DTO to model', () => {
            const dto: ITransferRequestDto = {
                id: 538,
                aircraft: null,
                model: null,
                uac: 'UAC123',
                uav: null,
                originating_uic: 'UNIT001',
                originating_name: 'Unit 001',
                destination_uic: 'UNIT002',
                destination_name: 'Unit 002',
                requested_by_user: {
                    user_id: '1234567890',
                    rank: 'SSG',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                },
                requested_object_type: TransferObjectType.UAC,
                originating_unit_approved: false,
                destination_unit_approved: false,
                permanent_transfer: true,
                date_requested: '2025-03-01',
                status: TransferStatus.PENDING,
                last_updated_datetime: '2025-03-01T10:00:00.000Z',
            };

            const result = mapToITransferRequest(dto);

            expect(result.aircraft).toBeNull();
            expect(result.model).toBeNull();
            expect(result.uac).toBe('UAC123');
            expect(result.requestedObjectType).toBe(TransferObjectType.UAC);
            expect(result.permanentTransfer).toBe(true);
        });

        it('should map UAV transfer request DTO to model', () => {
            const dto: ITransferRequestDto = {
                id: 539,
                aircraft: null,
                model: null,
                uac: null,
                uav: 'UAV456',
                originating_uic: 'UNIT003',
                originating_name: 'Unit 003',
                destination_uic: 'UNIT004',
                destination_name: 'Unit 004',
                requested_by_user: {
                    user_id: '9876543210',
                    rank: 'CPT',
                    first_name: 'Jane',
                    last_name: 'Smith',
                    email: null,
                },
                requested_object_type: TransferObjectType.UAV,
                originating_unit_approved: true,
                destination_unit_approved: true,
                permanent_transfer: false,
                date_requested: '2025-03-02',
                status: TransferStatus.ACCEPTED,
                last_updated_datetime: '2025-03-02T15:30:00.000Z',
            };

            const result = mapToITransferRequest(dto);

            expect(result.uav).toBe('UAV456');
            expect(result.requestedObjectType).toBe(TransferObjectType.UAV);
            expect(result.originatingUnitApproved).toBe(true);
            expect(result.destinationUnitApproved).toBe(true);
        });

        it('should properly map nested user object', () => {
            const dto: ITransferRequestDto = {
                id: 540,
                aircraft: '1120518',
                model: 'UH-60M',
                uac: null,
                uav: null,
                originating_uic: 'WAYCB0',
                originating_name: 'B CO',
                destination_uic: 'TF-000249',
                destination_name: 'Diamondhead',
                requested_by_user: {
                    user_id: '1111111111',
                    rank: 'MAJ',
                    first_name: 'Test',
                    last_name: 'User',
                    email: 'test@example.com',
                },
                requested_object_type: TransferObjectType.AIRCRAFT,
                originating_unit_approved: false,
                destination_unit_approved: false,
                permanent_transfer: false,
                date_requested: '2025-03-03',
                status: TransferStatus.NEW,
                last_updated_datetime: '2025-03-03T12:00:00.000Z',
            };

            const result = mapToITransferRequest(dto);

            expect(result.requestedByUser).toBeDefined();
            expect(result.requestedByUser.userId).toBe('1111111111');
            expect(result.requestedByUser.rank).toBe('MAJ');
            expect(result.requestedByUser.firstName).toBe('Test');
            expect(result.requestedByUser.lastName).toBe('User');
            expect(result.requestedByUser.email).toBe('test@example.com');
        });
    });
});