import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Builder } from './Builder';
import { ToastProvider } from '../components/ToastProvider';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  Element.prototype.scrollTo = vi.fn();
  window.print = vi.fn();
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});

function renderBuilder() {
  return render(
    <MemoryRouter initialEntries={['/builder']}>
      <ToastProvider>
        <Builder />
      </ToastProvider>
    </MemoryRouter>,
  );
}

function nextButton() {
  const footer = document.querySelector('.step-footer') as HTMLElement;
  return within(footer).getByRole('button', { name: /^(Next:|Finish)/ });
}

function backButton() {
  const footer = document.querySelector('.step-footer') as HTMLElement;
  return within(footer).getByRole('button', { name: 'Back' });
}

describe('Builder step flow', () => {
  it('starts on Personal Information with no Back button in the desktop footer', () => {
    renderBuilder();
    expect(screen.getByText('Personal Information', { selector: 'h2' })).toBeInTheDocument();
    const footer = document.querySelector('.step-footer') as HTMLElement;
    expect(within(footer).queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.className === 'step-progress-label' && el.textContent === 'Step 1 of 9')).toBeInTheDocument();
  });

  it('Next advances to the next step and Back returns to the previous one', () => {
    renderBuilder();
    fireEvent.click(nextButton());
    expect(screen.getByText('Professional Summary', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.className === 'step-progress-label' && el.textContent === 'Step 2 of 9')).toBeInTheDocument();

    fireEvent.click(backButton());
    expect(screen.getByText('Personal Information', { selector: 'h2' })).toBeInTheDocument();
  });

  it('the last step shows "Finish · Download PDF", which calls window.print once', () => {
    renderBuilder();
    // Fresh, empty data has 9 steps: Personal + the 8 built-in sections.
    for (let i = 0; i < 8; i++) {
      fireEvent.click(nextButton());
    }
    const finishBtn = nextButton();
    expect(finishBtn).toHaveTextContent('Finish · Download PDF');
    fireEvent.click(finishBtn);
    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it('jumping to a step via the rail shows that step and marks it current', () => {
    renderBuilder();
    const rail = document.querySelector('.step-nav-list') as HTMLElement;
    fireEvent.click(within(rail).getByRole('button', { name: /Work Experience/ }));
    expect(screen.getByText('Work Experience', { selector: 'h2' })).toBeInTheDocument();
    expect(within(rail).getByRole('button', { name: /Work Experience/ })).toHaveAttribute('aria-current', 'true');
  });

  it('reloading (a fresh mount) keeps the current step via sessionStorage', () => {
    const { unmount } = renderBuilder();
    const rail = document.querySelector('.step-nav-list') as HTMLElement;
    fireEvent.click(within(rail).getByRole('button', { name: /^Skills/ }));
    expect(screen.getByText('Skills', { selector: 'h2' })).toBeInTheDocument();
    unmount();

    renderBuilder();
    expect(screen.getByText('Skills', { selector: 'h2' })).toBeInTheDocument();
  });
});
