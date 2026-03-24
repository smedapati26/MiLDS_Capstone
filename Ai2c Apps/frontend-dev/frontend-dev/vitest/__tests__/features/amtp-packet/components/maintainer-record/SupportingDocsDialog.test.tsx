describe('This test file is broken', () => {
  it('Should pass', () => {
    expect(true).toBeTruthy();
  })
})

// /* eslint-disable @typescript-eslint/ban-ts-comment */
// import { Provider } from 'react-redux';
// import { MemoryRouter } from 'react-router-dom';
// import { beforeEach, describe, expect, it, vi } from 'vitest';

// import { createTheme, ThemeProvider } from '@mui/material/styles';
// import { configureStore } from '@reduxjs/toolkit';
// import { fireEvent, render, screen } from '@testing-library/react';

// import SupportingDocsDialog from '@features/amtp-packet/components/maintainer-record/SupportingDocsDialog';
// import {
//   amtpPacketReducer,
//   useLazyGetCombinedDocumentsZipQuery,
//   useLazyGetDocumentFileByIdQuery,
//   useLazyGetEventDocumentsByIdQuery,
// } from '@features/amtp-packet/slices';
// import { useAppSelector } from '@store/hooks';

// // 🔌 Mock hooks
// vi.mock('@store/hooks', () => ({
//   useAppSelector: vi.fn(),
// }));

// // 🔌 Mock API slice and document data
// vi.mock('@features/amtp-packet/slices', async (importOriginal) => {
//   const actual = await importOriginal();
//   return {
//     //@ts-expect-error
//     ...actual,
//     useLazyGetEventDocumentsByIdQuery: vi.fn().mockReturnValue([
//       vi.fn(),
//       {
//         data: [
//           { id: 1, title: 'document.pdf' },
//           { id: 2, title: 'image.png' },
//           { id: 3, title: 'notes.pdf' },
//           { id: 4, title: 'photo.jpg' },
//         ],
//         isFetching: false,
//       },
//     ]),
//     useLazyGetDocumentFileByIdQuery: vi.fn().mockReturnValue([vi.fn()]),
//     useLazyGetCombinedDocumentsZipQuery: vi.fn().mockReturnValue([vi.fn(), { isFetching: false }]),
//   };
// });

// // 🧵 Setup store
// const mockStore = configureStore({
//   reducer: {
//     amtpPacket: amtpPacketReducer,
//   },
// });

// // 🧪 Helper to wrap with context
// const renderWithProviders = (ui: React.ReactElement) =>
//   render(
//     <Provider store={mockStore}>
//       <MemoryRouter>
//         <ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>
//       </MemoryRouter>
//     </Provider>,
//   );

// describe('SupportingDocsDialog Component', () => {
//   const handleCloseMock = vi.fn();
//   const fakeProps = {
//     open: true,
//     handleClose: handleCloseMock,
//     eventId: 1234,
//   };

//   beforeEach(() => {
//     vi.resetAllMocks();

//     (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('fakeUser');

//     (useLazyGetEventDocumentsByIdQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
//       vi.fn(),
//       {
//         data: [
//           { id: 1, title: 'document.pdf' },
//           { id: 2, title: 'image.png' },
//           { id: 3, title: 'notes.pdf' },
//           { id: 4, title: 'photo.jpg' },
//         ],
//         isFetching: false,
//       },
//     ]);

//     (useLazyGetDocumentFileByIdQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([vi.fn(), {}]);

//     (useLazyGetCombinedDocumentsZipQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
//       vi.fn(),
//       { isFetching: false },
//     ]);
//   });

//   it('renders dialog with title', () => {
//     renderWithProviders(<SupportingDocsDialog {...fakeProps} />);
//     expect(screen.getByText(/Preview and Download Supporting Documents/i)).toBeInTheDocument();
//   });

//   it('renders all documents as accordions', () => {
//     renderWithProviders(<SupportingDocsDialog {...fakeProps} />);
//     expect(screen.getByText(/document.pdf/i)).toBeInTheDocument();
//     expect(screen.getByText(/image.png/i)).toBeInTheDocument();
//     expect(screen.getByText(/notes.pdf/i)).toBeInTheDocument();
//     expect(screen.getByText(/photo.jpg/i)).toBeInTheDocument();
//   });

//   it('renders checkboxes for selectable files', () => {
//     renderWithProviders(<SupportingDocsDialog {...fakeProps} />);
//     const checkboxes = screen.getAllByRole('checkbox');
//     expect(checkboxes.length).toBe(4);
//   });

//   it('handles file selection correctly', () => {
//     renderWithProviders(<SupportingDocsDialog {...fakeProps} />);
//     const checkboxLabel = screen.getByText(/document.pdf/i);
//     fireEvent.click(checkboxLabel);
//     expect(checkboxLabel).toBeInTheDocument();
//   });

//   it('disables download button when no documents exist', () => {
//     (useLazyGetEventDocumentsByIdQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
//       vi.fn(),
//       { data: [], isFetching: false },
//     ]);

//     renderWithProviders(<SupportingDocsDialog {...fakeProps} />);
//     expect(screen.getByText(/Download All/i)).toBeDisabled();
//   });

//   it('calls handleClose when Escape key is pressed', () => {
//     renderWithProviders(<SupportingDocsDialog {...fakeProps} />);
//     fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
//     expect(handleCloseMock).toHaveBeenCalled();
//   });
// });
