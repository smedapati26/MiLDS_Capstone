export enum TransferObjectType {
  AIRCRAFT = 'AIR',
  UAC = 'UAC',
  UAV = 'UAV',
  AGSE = 'AGSE',
}

export enum TransferStatus {
  ACCEPTED = 'Accepted',
  PENDING = 'Pending',
  REJECTED = 'Rejected',
  NEW = 'New',
}

// User DTO from backend
export interface ITransferRequestUserDto {
  user_id: string;
  rank: string;
  first_name: string;
  last_name: string;
  email: string | null;
}

// User model for frontend
export interface ITransferRequestUser {
  userId: string;
  rank: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

// DTO - matches backend response (snake_case)
export interface ITransferRequestDto {
  id: number;
  aircraft: string | null;
  model: string | null;
  uac: string | null;
  uav: string | null;
  originating_uic: string;
  originating_name: string;
  destination_uic: string;
  destination_name: string;
  requested_by_user: ITransferRequestUserDto;
  requested_object_type: TransferObjectType;
  originating_unit_approved: boolean;
  destination_unit_approved: boolean;
  permanent_transfer: boolean;
  date_requested: string;
  status: TransferStatus;
  last_updated_datetime: string;
}

// Frontend model (camelCase)
export interface ITransferRequest {
  id: number;
  aircraft: string | null;
  model: string | null;
  uac: string | null;
  uav: string | null;
  originatingUic: string;
  originatingName: string;
  destinationUic: string;
  destinationName: string;
  requestedByUser: ITransferRequestUser;
  requestedObjectType: TransferObjectType;
  originatingUnitApproved: boolean;
  destinationUnitApproved: boolean;
  permanentTransfer: boolean;
  dateRequested: string;
  status: TransferStatus;
  lastUpdatedDatetime: string;
}

// DTO Backend model for new Transfer Request (snakecase)
export interface ITransferRequestInDto {
  aircraft?: string[] | null;
  uac?: string[] | null;
  uav?: string[] | null;
  originating_uic: string;
  destination_uic: string;
  requested_by_user: string | null;
  requested_object_type: TransferObjectType;
  permanent_transfer: boolean;
  status: TransferStatus;
}

// Backend and Frontend model for new Transfer Request response
interface ConflictMessage {
  originating_unit: string;
  destination_unit: string;
}

export interface ITransferRequestResponse {
  success: boolean;
  ids: string[];
  message: string | ConflictMessage;
}

// Mapper for user
export function mapToITransferRequestUser(dto: ITransferRequestUserDto): ITransferRequestUser {
  return {
    userId: dto.user_id,
    rank: dto.rank,
    firstName: dto.first_name,
    lastName: dto.last_name,
    email: dto.email,
  };
}

// Mapper function
export function mapToITransferRequest(dto: ITransferRequestDto): ITransferRequest {
  return {
    id: dto.id,
    aircraft: dto.aircraft,
    model: dto.model,
    uac: dto.uac,
    uav: dto.uav,
    originatingUic: dto.originating_uic,
    originatingName: dto.originating_name,
    destinationUic: dto.destination_uic,
    destinationName: dto.destination_name,
    requestedByUser: mapToITransferRequestUser(dto.requested_by_user),
    requestedObjectType: dto.requested_object_type,
    originatingUnitApproved: dto.originating_unit_approved,
    destinationUnitApproved: dto.destination_unit_approved,
    permanentTransfer: dto.permanent_transfer,
    dateRequested: dto.date_requested,
    status: dto.status,
    lastUpdatedDatetime: dto.last_updated_datetime,
  };
}
