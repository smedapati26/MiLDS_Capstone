import { IDA4856DTO } from '@store/amap_ai/counselings';

export const mockDA4856s: IDA4856DTO[] = [
  {
    id: 1,
    date: '01/01/2025',
    title: 'Counceling 1',
    uploaded_by: 'Testy Megee',
    associated_event: { id: 1, date: '02/02/2025', event_type: 'Training', event_sub_type: 'TCS' },
    document: 'Test Document',
  },
  {
    id: 1,
    date: '03/03/2025',
    title: 'Counceling 2',
    uploaded_by: 'Testeer Megeer',
    associated_event: { id: 2, date: '04/04/2025', event_type: 'Test Event Type 2', event_sub_type: 'Sub Type 2' },
    document: null,
  },
];

export const mockPDF = new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46])], { type: 'application/pdf' });
