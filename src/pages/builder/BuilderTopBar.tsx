import { Link } from 'react-router-dom';
import { Menu } from '../../components/Menu';
import type { ResumeEditorState } from './useResumeEditor';
import { exportResumeToDocx } from '../../lib/exportDocx';

interface BuilderTopBarProps {
  editor: ResumeEditorState;
  isDesignOpen: boolean;
  onDesignClick: () => void;
  onLoadExample: () => void;
  onImportClick: () => void;
  onClearEverything: () => void;
  showToast: (message: string) => void;
  designButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function BuilderTopBar({
  editor,
  isDesignOpen,
  onDesignClick,
  onLoadExample,
  onImportClick,
  onClearEverything,
  showToast,
  designButtonRef,
}: BuilderTopBarProps) {
  function handleDownloadPDF() {
    showToast('Opening the print dialog — choose "Save as PDF" as the destination.');
    window.print();
  }

  function handleDownloadDocx() {
    exportResumeToDocx(editor.data)
      .then(() => showToast('Resume exported as .docx'))
      .catch(() => showToast('Failed to export Word document.'));
  }

  function handleExportJSON() {
    editor.exportData(showToast);
  }

  const downloadMenuItems = [
    {
      label: 'PDF',
      description: 'Opens the print dialog — choose "Save as PDF" as the destination.',
      onClick: handleDownloadPDF,
    },
    {
      label: 'Word (.docx)',
      onClick: handleDownloadDocx,
    },
    {
      label: 'JSON backup',
      onClick: handleExportJSON,
    },
  ];

  const moreMenuItems = [
    {
      label: 'Load example resume',
      onClick: onLoadExample,
    },
    {
      label: 'Import JSON backup',
      onClick: onImportClick,
    },
    {
      isDivider: true,
    },
    {
      label: 'Clear everything',
      onClick: onClearEverything,
      isDanger: true,
    },
  ];

  return (
    <div className="builder-top-bar">
      <Link to="/" className="builder-top-logo">
        Works<span>Lab</span>
      </Link>

      <div className="builder-top-spacer" />

      <div className="builder-top-actions">
        <span
          className={`save-indicator state-${editor.saveState === 'idle' ? 'saved' : editor.saveState}`}
          role="status"
          aria-live="polite"
        >
          <span aria-hidden="true">●</span>{' '}
          <span className="save-indicator-full">
            {editor.saveState === 'saving' && 'Saving…'}
            {editor.saveState === 'error' && "Couldn't save — storage unavailable"}
            {(editor.saveState === 'saved' || editor.saveState === 'idle') &&
              (editor.savedAt ? 'Saved just now' : 'Auto-saved locally')}
          </span>
          <span className="save-indicator-short">
            {editor.saveState === 'saving' && 'Saving'}
            {editor.saveState === 'error' && 'Error'}
            {(editor.saveState === 'saved' || editor.saveState === 'idle') && 'Saved'}
          </span>
        </span>

        <button
          className="builder-top-icon-btn"
          onClick={editor.undo}
          disabled={!editor.canUndo}
          aria-label="Undo"
          title={`Undo${editor.canUndo ? ' (Ctrl+Z)' : ''}`}
        >
          ↶
        </button>

        <button
          className="builder-top-icon-btn"
          onClick={editor.redo}
          disabled={!editor.canRedo}
          aria-label="Redo"
          title={`Redo${editor.canRedo ? ' (Ctrl+Shift+Z)' : ''}`}
        >
          ↷
        </button>

        <button
          ref={designButtonRef}
          className={`builder-top-design-btn${isDesignOpen ? ' active' : ''}`}
          onClick={onDesignClick}
          aria-label="Design"
          aria-expanded={isDesignOpen}
          aria-haspopup="dialog"
          title="Customize design and template"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" />
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8" />
            <path d="M8 12h8M12 8v8" />
          </svg>
          <span>Design</span>
        </button>

        <Menu
          trigger={
            <span className="builder-top-download-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v12" />
                <path d="M7 10l5 5 5-5" />
                <path d="M4 19h16" />
              </svg>
              <span className="builder-top-download-label">Download</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          }
          items={downloadMenuItems}
          ariaLabel="Download"
        />

        <Menu
          trigger={<span className="builder-top-more-btn">⋯</span>}
          items={moreMenuItems}
          ariaLabel="More options"
        />
      </div>
    </div>
  );
}
