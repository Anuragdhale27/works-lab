import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobilePreviewSheet } from './MobilePreviewSheet';
import { emptyResumeData } from '../../types/resume';
import type { ResumeEditorState } from './useResumeEditor';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function FakeTemplate() {
  return <div data-testid="template-root">Resume content</div>;
}

const fakeEditor = { data: emptyResumeData, exportData: vi.fn() } as unknown as ResumeEditorState;

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
});

describe('MobilePreviewSheet', () => {
  it('renders nothing when closed', () => {
    render(
      <MobilePreviewSheet
        isOpen={false}
        templateName="Modern ATS"
        TemplateComponent={FakeTemplate}
        data={emptyResumeData}
        pageCount={1}
        contentHeight={1123}
        editor={fakeEditor}
        showToast={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens as a dialog showing the template and closes on the close button', () => {
    const onClose = vi.fn();
    render(
      <MobilePreviewSheet
        isOpen
        templateName="Modern ATS"
        TemplateComponent={FakeTemplate}
        data={emptyResumeData}
        pageCount={1}
        contentHeight={1123}
        editor={fakeEditor}
        showToast={vi.fn()}
        onClose={onClose}
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByTestId('template-root')).toBeInTheDocument();
    expect(screen.getByText('Preview · Modern ATS')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close preview' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape and returns focus to the trigger', () => {
    const onClose = vi.fn();
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    render(
      <MobilePreviewSheet
        isOpen
        templateName="Modern ATS"
        TemplateComponent={FakeTemplate}
        data={emptyResumeData}
        pageCount={1}
        contentHeight={1123}
        editor={fakeEditor}
        showToast={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveFocus();

    document.body.removeChild(trigger);
  });

  it('offers a Fit / 100% zoom toggle and the page-count pill', () => {
    render(
      <MobilePreviewSheet
        isOpen
        templateName="Modern ATS"
        TemplateComponent={FakeTemplate}
        data={emptyResumeData}
        pageCount={2}
        contentHeight={2200}
        editor={fakeEditor}
        showToast={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Fit' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '100%' }));
    expect(screen.getByRole('button', { name: '100%' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('2 pages')).toBeInTheDocument();
  });

  it('shows the page count and page-break line the parent tells it to, not its own measurement', () => {
    // The sheet trusts the pageCount/contentHeight it's given (computed
    // once, off-screen, in Builder.tsx) rather than measuring its own
    // — possibly display:none'd — DOM, which is the bug this guards.
    const { rerender } = render(
      <MobilePreviewSheet
        isOpen
        templateName="Modern ATS"
        TemplateComponent={FakeTemplate}
        data={emptyResumeData}
        pageCount={1}
        contentHeight={1123}
        editor={fakeEditor}
        showToast={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('1 page')).toBeInTheDocument();
    expect(document.querySelector('.page-break-line')).not.toBeInTheDocument();

    rerender(
      <MobilePreviewSheet
        isOpen
        templateName="Modern ATS"
        TemplateComponent={FakeTemplate}
        data={emptyResumeData}
        pageCount={2}
        contentHeight={2200}
        editor={fakeEditor}
        showToast={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('2 pages')).toBeInTheDocument();
    expect(document.querySelectorAll('.page-break-line')).toHaveLength(1);
    expect(screen.getByText('Page 2')).toBeInTheDocument();
  });
});
