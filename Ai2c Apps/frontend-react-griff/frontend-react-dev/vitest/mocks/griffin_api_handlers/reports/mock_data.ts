import { EXPORT_MIME_TYPE } from '@store/griffin_api/reports/models/ExportTypeEnum';
import { IExtractedFile } from '@store/griffin_api/reports/models/IExtractedFile';

export const mockExtractedFiles: IExtractedFile[] = [
  {
    name: 'test.csv',
    content: 'col1,col2\nval1,val2',
    type: 'text/csv' as EXPORT_MIME_TYPE,
  },
];
