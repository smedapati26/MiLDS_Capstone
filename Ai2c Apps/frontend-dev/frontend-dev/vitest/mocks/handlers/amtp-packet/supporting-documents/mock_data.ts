import { SupportingDocumentDTO } from '@store/amap_ai/supporting_documents/models';

import { mockAppUserDto } from '../../app_user/mock_data';

export const mockSupportingDocuments: SupportingDocumentDTO[] = [
  {
    id: 1,
    soldier: mockAppUserDto,
    uploaded_by: 'CPT Testy MeGee',
    upload_date: '05/11/2025',
    document_date: '05/11/2025',
    document_title: 'Test Doc1',
    document_type: 'Type 1',
    related_event: { id: 1, date: '05/01/2025', event_type: 'Training', event_sub_type: 'TCS' },
    related_designation: 'Test Designation',
    visible_to_user: true,
  },
  {
    id: 2,
    soldier: mockAppUserDto,
    uploaded_by: 'CPT Tester MeGeer',
    upload_date: '01/01/2025',
    document_date: '01/01/2025',
    document_title: 'Test Doc2',
    document_type: 'Type 2',
    related_event: { id: 2, date: '01/01/2025', event_type: 'Test Event Type 2', event_sub_type: 'Sub Type 2' },
    related_designation: 'Test Designation 2',
    visible_to_user: true,
  },
];

export const mockSupportingDocumentTypes: { id: number; type: string }[] = [
  {
    id: 1,
    type: 'Type 1',
  },
  { id: 2, type: 'Type 2' },
];
