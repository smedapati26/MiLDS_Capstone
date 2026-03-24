import { EXPORT_MIME_TYPE } from './ExportTypeEnum';

/**
 * @typedef IExtractedFile
 * @prop
 */
export interface IExtractedFile {
  name: string; // File name, e.g., 'data.csv'
  content: string | Blob; // Full content of the file
  type: EXPORT_MIME_TYPE;
}
