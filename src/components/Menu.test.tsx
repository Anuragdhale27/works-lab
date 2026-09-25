import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Menu } from './Menu';

function renderMenu(onFirstClick = vi.fn(), onSecondClick = vi.fn()) {
  render(
    <Menu
      trigger={<span>Options</span>}
      ariaLabel="Options menu"
      items={[
        { label: 'First', onClick: onFirstClick },
        { label: 'Second', onClick: onSecondClick },
        { isDivider: true },
        { label: 'Danger', onClick: vi.fn(), isDanger: true },
      ]}
    />,
  );
  return { onFirstClick, onSecondClick };
}

describe('Menu', () => {
  it('is closed by default with correct aria attributes', () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Options menu' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens on click and focuses the first item, closes on outside click', async () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Options menu' });
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'First' })).toHaveFocus();
    });

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('does not open on an unrelated keypress', () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Options menu' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'a' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens with Enter, Space and ArrowDown', () => {
    for (const key of ['Enter', ' ', 'ArrowDown']) {
      const { unmount } = render(
        <Menu trigger={<span>Options</span>} ariaLabel="Options menu" items={[{ label: 'First', onClick: vi.fn() }]} />,
      );
      const trigger = screen.getByRole('button', { name: 'Options menu' });
      trigger.focus();
      fireEvent.keyDown(trigger, { key });
      expect(screen.getByRole('menu')).toBeInTheDocument();
      unmount();
    }
  });

  it('moves focus with ArrowDown/ArrowUp and wraps at Home/End', async () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Options menu' });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'First' })).toHaveFocus();
    });

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: 'Second' })).toHaveFocus();

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(screen.getByRole('menuitem', { name: 'First' })).toHaveFocus();

    fireEvent.keyDown(document, { key: 'End' });
    expect(screen.getByRole('menuitem', { name: 'Danger' })).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Home' });
    expect(screen.getByRole('menuitem', { name: 'First' })).toHaveFocus();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Options menu' });
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('calls the item handler, closes the menu and returns focus on click', async () => {
    const { onFirstClick } = renderMenu();
    const trigger = screen.getByRole('button', { name: 'Options menu' });
    fireEvent.click(trigger);

    fireEvent.click(screen.getByRole('menuitem', { name: 'First' }));

    expect(onFirstClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
