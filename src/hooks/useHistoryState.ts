import { useCallback, useRef, useState } from 'react';

interface HistoryStack<T> {
  past: T[];
  present: T;
  future: T[];
}

const HISTORY_LIMIT = 100;
const COALESCE_DELAY_MS = 800;

/**
 * A hook for managing undo/redo history with automatic coalescing of changes.
 *
 * Changes are coalesced when they occur within COALESCE_DELAY_MS of the previous change.
 * Structural operations (add/remove/move/duplicate/etc) or field changes always create a new history entry.
 *
 * Supports lazy initialization: pass a function that returns the initial value instead of the value itself.
 *
 * Returns: [value, setValue, canUndo, canRedo, undo, redo, reset]
 */
export function useHistoryState<T>(initialValue: T | (() => T)) {
  const [state, setState] = useState<HistoryStack<T>>(() => ({
    past: [],
    present: typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue,
    future: [],
  }));

  const lastChangeTimeRef = useRef<number>(0);

  // Called when a value changes. If shouldStartNewEntry is true, a new history entry is always created.
  // Otherwise, if enough time has passed since the last change, a new entry is created; otherwise the current entry is updated.
  const setValue = useCallback((newValue: T | ((prev: T) => T), shouldStartNewEntry: boolean = false) => {
    // Compute time and coalesce decision OUTSIDE setState to avoid React StrictMode double-call issues
    const now = Date.now();
    const timeSinceLastChange = now - lastChangeTimeRef.current;

    setState((prev) => {
      const nextValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev.present) : newValue;
      if (nextValue === prev.present) return prev;

      const shouldCoalesce = !shouldStartNewEntry && timeSinceLastChange < COALESCE_DELAY_MS && prev.past.length > 0;

      if (shouldCoalesce) {
        // Update the last history entry instead of creating a new one
        return {
          past: prev.past,
          present: nextValue,
          future: [],
        };
      } else {
        // Create a new history entry
        const newPast = [...prev.past, prev.present];
        if (newPast.length > HISTORY_LIMIT) {
          newPast.shift(); // Remove oldest entry if we exceed the limit
        }
        return {
          past: newPast,
          present: nextValue,
          future: [],
        };
      }
    });

    lastChangeTimeRef.current = now;
  }, []);

  const undo = useCallback(() => {
    lastChangeTimeRef.current = Date.now();
    setState((prev) => {
      if (prev.past.length === 0) return prev;
      const newPast = prev.past.slice(0, -1);
      const newPresent = prev.past[prev.past.length - 1];
      const newFuture = [prev.present, ...prev.future];
      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const redo = useCallback(() => {
    lastChangeTimeRef.current = Date.now();
    setState((prev) => {
      if (prev.future.length === 0) return prev;
      const newPresent = prev.future[0];
      const newFuture = prev.future.slice(1);
      const newPast = [...prev.past, prev.present];
      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  // Reset to a new value, clearing all undo/redo history
  const reset = useCallback((newValue: T) => {
    lastChangeTimeRef.current = Date.now();
    setState({
      past: [],
      present: newValue,
      future: [],
    });
  }, []);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return [state.present, setValue, canUndo, canRedo, undo, redo, reset] as const;
}
