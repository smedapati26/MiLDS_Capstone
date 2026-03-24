import { IExtractedFile } from '@store/griffin_api/reports/models/IExtractedFile';

export const downloadFileExport = (file: IExtractedFile) => {
  const blob = new Blob([file.content], { type: file.type }); // Create a Blob for the CSV
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none'; // Hide the link
  anchor.href = url;
  anchor.download = file.name; // Set the file name for download
  anchor.click();
  URL.revokeObjectURL(url); // Clean up
};
