export interface IUpdateDA4856Out {
  title?: string;
  date?: string;
  associateEvent: boolean;
  event?: string;
}

export interface ICreateDA4856Out {
  title: string;
  date: Date;
  associated_event_id: string;
}

export interface IDA4856AssocaitedEventDTO {
  id: number;
  date: string;
  event_type: string;
  event_sub_type: string;
}

export interface IDA4856DTO {
  id: number;
  date: string;
  title: string;
  uploaded_by: string | null;
  associated_event: IDA4856AssocaitedEventDTO | null;
  document: string | null;
}

export interface IDA4856AssocaitedEvent {
  id: number;
  date: string;
  eventType: string;
  eventSubType: string;
}

export interface IDA4856 {
  id: number;
  date: string;
  title: string;
  uploadedBy: string | null;
  associatedEvent: IDA4856AssocaitedEvent | null;
  document: string | null;
}

export const mapToIDA4856AssocaitedEvent = (dto: IDA4856AssocaitedEventDTO): IDA4856AssocaitedEvent => ({
  id: dto.id,
  date: dto.date,
  eventType: dto.event_type,
  eventSubType: dto.event_sub_type,
});

export const mapToIDA4856 = (dto: IDA4856DTO): IDA4856 => ({
  id: dto.id,
  date: dto.date,
  title: dto.title,
  uploadedBy: dto.uploaded_by,
  associatedEvent: dto.associated_event ? mapToIDA4856AssocaitedEvent(dto.associated_event) : null,
  document: dto.document,
});
