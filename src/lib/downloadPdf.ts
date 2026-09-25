// Shared with the top bar's Download menu and the last form step's
// "Finish · Download PDF" button, so both go through one implementation.
export function downloadPDF(showToast: (message: string) => void) {
  showToast('Opening the print dialog — choose "Save as PDF" as the destination.');
  window.print();
}
