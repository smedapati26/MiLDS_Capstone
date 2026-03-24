// Payload for adjudicating transfer requests
export interface IAdjudicateTransferRequestPayload {
  transfer_request_ids: number[];
  approved: boolean;
}

// Response from adjudicating transfer requests
export interface IAdjudicateTransferRequestResponse {
  user_permission: string[]; // Serial numbers where user lacks permission
  adjudicated: string[]; // Serial numbers that were fully processed (approved or rejected)
  partial: string[]; // Serial numbers with partial approval (only one unit approved)
}
