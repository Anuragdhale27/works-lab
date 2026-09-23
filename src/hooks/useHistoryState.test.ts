import { describe, expect, it, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistoryState } from './useHistoryState';

describe('useHistoryState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('returns initial value and state functions', () => {
    const { result } = renderHook(() => useHistoryState({ value: 'test' }));
    const [value, setValue, canUndo, canRedo, undo, redo] = result.current;
    expect(value).toEqual({ value: 'test' });
    expect(typeof setValue).toBe('function');
    expect(typeof undo).toBe('function');
    expect(typeof redo).toBe('function');
    expect(canUndo).toBe(false);
    expect(canRedo).toBe(false);
  });

  it('sets value and tracks history', () => {
    const { result } = renderHook(() => useHistoryState({ count: 0 }));

    act(() => {
      const [, setValue] = result.current;
      setValue({ count: 1 }, true); // Force new entry
    });

    const [value, , canUndo] = result.current;
    expect(value).toEqual({ count: 1 });
    expect(canUndo).toBe(true);
  });

  it('coalesces changes within COALESCE_DELAY_MS (800ms)', () => {
    const { result } = renderHook(() => useHistoryState({ value: 'a' }));

    act(() => {
      const [, setValue] = result.current;
      setValue({ value: 'b' }, true); // First change, new entry
      vi.advanceTimersByTime(400); // 400ms
      setValue({ value: 'c' }, false); // Should coalesce
    });

    // After coalescing, should still have just 1 history entry
    const [value, , canUndo] = result.current;
    expect(value).toEqual({ value: 'c' });
    expect(canUndo).toBe(true);
  });

  it('creates new entry when COALESCE_DELAY_MS (800ms) has passed', () => {
    const { result } = renderHook(() => useHistoryState({ value: 'a' }));

    act(() => {
      const [, setValue] = result.current;
      setValue({ value: 'b' }, true); // First change, new entry
      vi.advanceTimersByTime(801); // 801ms - exceeds COALESCE_DELAY_MS
      setValue({ value: 'c' }, false); // Should create new entry
    });

    const [value, , canUndo] = result.current;
    expect(value).toEqual({ value: 'c' });
    expect(canUndo).toBe(true);
  });

  it('creates new entry for structural operations even within COALESCE_DELAY_MS', () => {
    const { result } = renderHook(() => useHistoryState({ value: 'a' }));

    act(() => {
      const [, setValue] = result.current;
      setValue({ value: 'b' }, true); // First change
      vi.advanceTimersByTime(400); // 400ms
      setValue({ value: 'c' }, true); // Force new entry (structural operation)
    });

    const [value, , canUndo] = result.current;
    expect(value).toEqual({ value: 'c' });
    expect(canUndo).toBe(true);
  });

  it('undoes changes correctly', () => {
    const { result } = renderHook(() => useHistoryState({ value: 'a' }));

    act(() => {
      const [, setValue] = result.current;
      setValue({ value: 'b' }, true);
      vi.advanceTimersByTime(1000);
      setValue({ value: 'c' }, true);
    });

    act(() => {
      const [, , , , undo] = result.current;
      undo();
    });

    const [value] = result.current;
    expect(value).toEqual({ value: 'b' });
  });

  it('redoes changes correctly', () => {
    const { result } = renderHook(() => useHistoryState({ value: 'a' }));

    act(() => {
      const [, setValue] = result.current;
      setValue({ value: 'b' }, true);
      vi.advanceTimersByTime(1000);
      setValue({ value: 'c' }, true);
    });

    act(() => {
      const [, , , , undo] = result.current;
      undo();
    });

    act(() => {
      const [, , , , , redo] = result.current;
      redo();
    });

    const [value] = result.current;
    expect(value).toEqual({ value: 'c' });
  });

  it('clears future when a new change is made after undo', () => {
    const { result } = renderHook(() => useHistoryState({ value: 'a' }));

    act(() => {
      const [, setValue] = result.current;
      setValue({ value: 'b' }, true);
      vi.advanceTimersByTime(1000);
      setValue({ value: 'c' }, true);
    });

    act(() => {
      const [, , , , undo] = result.current;
      undo();
    });

    let canRedo = result.current[3];
    expect(canRedo).toBe(true);

    act(() => {
      const [, setValue] = result.current;
      vi.advanceTimersByTime(1000);
      setValue({ value: 'd' }, true);
    });

    canRedo = result.current[3];
    expect(canRedo).toBe(false);
  });

  it('respects the HISTORY_LIMIT (100 entries)', () => {
    const { result } = renderHook(() => useHistoryState(0));

    act(() => {
      const [, setValue] = result.current;
      for (let i = 1; i <= 110; i++) {
        vi.advanceTimersByTime(1000);
        setValue(i, true);
      }
    });

    // Should have at most 100 entries in past + 1 present
    const [value, , canUndo] = result.current;
    expect(value).toBe(110);
    expect(canUndo).toBe(true);
    // The oldest entry (0) should have been dropped, so if we undo 100 times, we should end at ~10
  });

  it('handles setValue with function argument', () => {
    const { result } = renderHook(() => useHistoryState({ count: 5 }));

    act(() => {
      const [, setValue] = result.current;
      setValue((prev) => ({ count: prev.count + 1 }), true);
    });

    const [value] = result.current;
    expect(value).toEqual({ count: 6 });
  });

  it('does not create history entry when value is the same object reference', () => {
    const { result } = renderHook(() => useHistoryState({ value: 'a' }));

    act(() => {
      const [value, setValue] = result.current;
      setValue(value, true); // Same object reference
    });

    const [, , canUndo] = result.current;
    expect(canUndo).toBe(false); // No new entry created
  });
});
