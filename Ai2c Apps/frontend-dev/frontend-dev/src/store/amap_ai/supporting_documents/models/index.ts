import { IAppUser, IAppUserDto, mapToIAppUser } from '@store/amap_ai/user/models';

export interface IUpdateSupportingDocumentOut {
  document_title?: string;
  document_type?: string;
  visible_to_user?: boolean;
  related_event_id?: string;
  related_designation_id?: string;
  associate_event?: boolean;
  assign_designation?: boolean;
}

export interface ICreateSupportingDocumentOut {
  document_title: string;
  document_type: string;
  document_date: Date;
  related_event_id: string;
  related_designation_id: string;
}

export interface SupportingDocumentAssocaitedEventDTO {
  id: number;
  date: string;
  event_type: string;
  event_sub_type: string;
}

export interface SupportingDocumentDTO {
  id: number;
  soldier: IAppUserDto;
  uploaded_by: string | null;
  upload_date: string;
  document_date: string;
  document_title: string;
  document_type: string;
  related_event: SupportingDocumentAssocaitedEventDTO | null;
  related_designation: string | null;
  visible_to_user: boolean;
}

export interface SupportingDocumentAssocaitedEvent {
  id: number;
  date: string;
  eventType: string;
  eventSubType: string;
}

export interface SupportingDocument {
  id: number;
  soldier: IAppUser;
  uploadedBy: string | null;
  uploadDate: string;
  documentDate: string;
  documentTitle: string;
  documentType: string;
  relatedEvent: SupportingDocumentAssocaitedEvent | null;
  relatedDesignation: string | null;
  visibleToUser: boolean;
}

export type SupportingDocumentColumns = {
  uploadDate: string;
  documentDate: string;
  documentTitle: string;
  relatedEventId: number | null;
  relatedDesignationId: number | null;
  uploadedById: string | null;
};

export const mapToSupportingDocumentRelatedEvent = (
  dto: SupportingDocumentAssocaitedEventDTO,
): SupportingDocumentAssocaitedEvent => ({
  id: dto.id,
  date: dto.date,
  eventType: dto.event_type,
  eventSubType: dto.event_sub_type,
});

export const mapToSupportingDocument = (dto: SupportingDocumentDTO): SupportingDocument => ({
  id: dto.id,
  soldier: mapToIAppUser(dto.soldier),
  uploadedBy: dto.uploaded_by,
  uploadDate: dto.upload_date,
  documentDate: dto.document_date,
  documentTitle: dto.document_title,
  documentType: dto.document_type,
  relatedEvent: dto.related_event ? mapToSupportingDocumentRelatedEvent(dto.related_event) : null,
  relatedDesignation: dto.related_designation,
  visibleToUser: dto.visible_to_user,
});
