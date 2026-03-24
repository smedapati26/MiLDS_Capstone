import JSZip from 'jszip';

import { EXPORT_MIME_TYPE } from '@store/griffin_api/reports/models/ExportTypeEnum';
import { IExtractedFile } from '@store/griffin_api/reports/models/IExtractedFile';

export async function handleUnzipCsvFiles(blob: Blob) {
  //  Use JSZip to load and unzip the blob
  const zip = await JSZip.loadAsync(blob);
  const files: IExtractedFile[] = [];

  // Iterate through the files in the ZIP and extract them
  await Promise.all(
    Object.keys(zip.files).map(async (fileName) => {
      const file = zip.files[fileName];
      if (!file.dir) {
        // Skip directories
        const content = await file.async('text'); // Assuming text files; use 'uint8array' for binary
        files.push({ name: fileName, content: content, type: EXPORT_MIME_TYPE.CSV }); // Store full content
      }
    }),
  );

  return files; // Return the extracted file info
}
