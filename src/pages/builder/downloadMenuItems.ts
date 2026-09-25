import type { MenuItem } from '../../components/Menu';
import type { ResumeEditorState } from './useResumeEditor';
import { exportResumeToDocx } from '../../lib/exportDocx';
import { downloadPDF } from '../../lib/downloadPdf';

/** Shared by the top bar's Download menu and the mobile preview sheet's. */
export function buildDownloadMenuItems(editor: ResumeEditorState, showToast: (message: string) => void): MenuItem[] {
  return [
    {
      label: 'PDF',
      description: 'Opens the print dialog — choose "Save as PDF" as the destination.',
      onClick: () => downloadPDF(showToast),
    },
    {
      label: 'Word (.docx)',
      onClick: () => {
        exportResumeToDocx(editor.data)
          .then(() => showToast('Resume exported as .docx'))
          .catch(() => showToast('Failed to export Word document.'));
      },
    },
    {
      label: 'JSON backup',
      onClick: () => editor.exportData(showToast),
    },
  ];
}
