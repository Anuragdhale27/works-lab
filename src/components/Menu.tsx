import { useEffect, useRef, useState } from 'react';
import './menu.css';

export interface MenuItem {
  label?: string;
  description?: string;
  onClick?: () => void;
  isDanger?: boolean;
  isDivider?: boolean;
  disabled?: boolean;
}

interface MenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  ariaLabel?: string;
}

export function Menu({ trigger, items, ariaLabel }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const focusedIndexRef = useRef(-1);

  // Close menu on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      const menuItems = menuRef.current?.querySelectorAll('[role="menuitem"]:not(:disabled)') as NodeListOf<HTMLElement>;
      if (!menuItems) return;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          focusedIndexRef.current = Math.min(focusedIndexRef.current + 1, menuItems.length - 1);
          menuItems[focusedIndexRef.current]?.focus();
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          focusedIndexRef.current = Math.max(focusedIndexRef.current - 1, 0);
          menuItems[focusedIndexRef.current]?.focus();
          break;
        }
        case 'Home': {
          e.preventDefault();
          focusedIndexRef.current = 0;
          menuItems[0]?.focus();
          break;
        }
        case 'End': {
          e.preventDefault();
          focusedIndexRef.current = menuItems.length - 1;
          menuItems[focusedIndexRef.current]?.focus();
          break;
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  function openMenu() {
    setIsOpen(true);
    focusedIndexRef.current = -1;
    // Focus first menuitem on next frame
    setTimeout(() => {
      const firstItem = menuRef.current?.querySelector('[role="menuitem"]:not(:disabled)') as HTMLElement;
      firstItem?.focus();
      focusedIndexRef.current = 0;
    }, 0);
  }

  function handleTriggerClick() {
    if (isOpen) {
      setIsOpen(false);
    } else {
      openMenu();
    }
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (!['Enter', ' ', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    if (!isOpen) {
      openMenu();
    }
  }

  function handleItemClick(item: MenuItem) {
    if (item.disabled) return;
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="menu-wrapper" ref={menuRef}>
      <button
        ref={triggerRef}
        className="menu-trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        {trigger}
      </button>

      {isOpen && (
        <div className="menu-content" role="menu">
          {items.map((item, idx) =>
            item.isDivider ? (
              <div key={`divider-${idx}`} className="menu-divider" role="presentation" />
            ) : (
              <button
                key={idx}
                role="menuitem"
                className={`menu-item ${item.isDanger ? 'menu-item-danger' : ''}`}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                aria-disabled={item.disabled || undefined}
              >
                <span className="menu-item-label">{item.label}</span>
                {item.description && <span className="menu-item-description">{item.description}</span>}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
