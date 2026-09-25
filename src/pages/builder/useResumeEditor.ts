import { useEffect, useRef, useState } from 'react';
import { useHistoryState } from '../../hooks/useHistoryState';
import type {
  CustomItem,
  CustomSection,
  ResumeData,
} from '../../types/resume';
import { emptyResumeData } from '../../types/resume';
import { loadResumeData, saveResumeData, validateResumeData } from '../../lib/storage';
import { duplicateEntry } from '../../lib/duplication';
import { sampleResumeData } from '../../lib/sampleData';
import { isResumeDataEmpty } from '../../lib/completeness';

export interface ResumeEditorState {
  data: ResumeData;
  canUndo: boolean;
  canRedo: boolean;
  saveState: 'idle' | 'saving' | 'saved' | 'error';
  savedAt: Date | null;
  pendingCaretRef: React.MutableRefObject<{ textareaId: string; position: number } | null>;
  touched: Set<string>;
  undo: () => void;
  redo: () => void;
  markTouched: (field: string) => void;
  updatePersonal: (field: keyof ResumeData['personal'], value: string) => void;
  updateSummary: (value: string) => void;
  addEntry: <K extends 'experience' | 'education' | 'projects' | 'certifications' | 'languages' | 'awards'>(
    key: K,
    entry: ResumeData[K][number],
  ) => void;
  updateEntry: <K extends 'experience' | 'education' | 'projects' | 'certifications' | 'languages' | 'awards'>(
    key: K,
    index: number,
    field: string,
    value: string,
  ) => void;
  removeEntry: <K extends 'experience' | 'education' | 'projects' | 'certifications' | 'languages' | 'awards'>(
    key: K,
    index: number,
  ) => void;
  moveEntry: <K extends 'experience' | 'education' | 'projects' | 'certifications' | 'languages' | 'awards'>(
    key: K,
    index: number,
    direction: 'up' | 'down',
  ) => void;
  duplicateEntryFn: <K extends 'experience' | 'education' | 'projects' | 'certifications' | 'languages' | 'awards'>(
    key: K,
    index: number,
  ) => void;
  addSkill: (skill: string) => void;
  removeSkill: (index: number) => void;
  addCustomSection: () => void;
  updateCustomSection: (customId: string, field: keyof CustomSection, value: unknown) => void;
  removeCustomSection: (customId: string) => void;
  addCustomItem: (customId: string) => void;
  updateCustomItem: (customId: string, itemIndex: number, field: keyof CustomItem, value: string) => void;
  removeCustomItem: (customId: string, itemIndex: number) => void;
  moveCustomItem: (customId: string, itemIndex: number, direction: 'up' | 'down') => void;
  duplicateCustomItem: (customId: string, itemIndex: number) => void;
  loadExample: (showToast: (msg: string) => void) => void;
  clearEverything: (showToast: (msg: string) => void) => void;
  exportData: (showToast: (msg: string) => void) => void;
  importData: (file: File, showToast: (msg: string) => void) => void;
  setData: (data: ResumeData, forceHistory?: boolean) => void;
}

export function useResumeEditor(): ResumeEditorState {
  const [data, setDataRaw, canUndo, canRedo, undo, redo] = useHistoryState<ResumeData>(() => loadResumeData());
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<number | undefined>(undefined);
  const isFirstDataEffect = useRef(true);
  const pendingCaretRef = useRef<{ textareaId: string; position: number } | null>(null);

  // Debounced persist on every change
  useEffect(() => {
    if (isFirstDataEffect.current) {
      isFirstDataEffect.current = false;
      return;
    }
    setSaveState('saving');
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      const ok = saveResumeData(data);
      if (ok) {
        setSaveState('saved');
        setSavedAt(new Date());
      } else {
        setSaveState('error');
      }
    }, 500);
    return () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    };
  }, [data]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      const target = e.target as HTMLElement | null;
      const isFormElement =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.contentEditable === 'true';

      if (isFormElement) {
        return;
      }

      if (modifier && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      if (modifier && e.key.toLowerCase() === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      if (modifier && e.key.toLowerCase() === 'y' && !e.shiftKey) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  function markTouched(field: string) {
    setTouched((prev) => {
      if (prev.has(field)) return prev;
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  }

  function setData(newData: ResumeData, forceHistory = false) {
    setDataRaw(newData, forceHistory);
  }

  function updatePersonal(field: keyof ResumeData['personal'], value: string) {
    setDataRaw((d) => ({ ...d, personal: { ...d.personal, [field]: value } }));
  }

  function updateSummary(value: string) {
    setDataRaw((d) => ({ ...d, summary: value }));
  }

  function addEntry<K extends 'experience' | 'education' | 'projects' | 'certifications' | 'languages' | 'awards'>(
    key: K,
    entry: ResumeData[K][number],
  ) {
    setDataRaw((d) => ({ ...d, [key]: [...d[key], entry] } as ResumeData), true);
  }

  function updateEntry<K extends 'experience' | 'education' | 'projects' | 'certifications' | 'languages' | 'awards'>(
    key: K,
    index: number,
    field: string,
    value: string,
  ) {
    setDataRaw((d) => {
      const list = [...(d[key] as unknown as Array<Record<string, string>>)];
      list[index] = { ...list[index], [field]: value };
      return { ...d, [key]: list } as ResumeData;
    });
  }

  function removeEntry<K extends 'experience' | 'education' | 'projects' | 'certifications' | 'languages' | 'awards'>(
    key: K,
    index: number,
  ) {
    setDataRaw(
      (d) => {
        const list = [...(d[key] as unknown[])];
        list.splice(index, 1);
        return { ...d, [key]: list } as ResumeData;
      },
      true
    );
  }

  function moveEntry<K extends 'experience' | 'education' | 'projects' | 'certifications' | 'languages' | 'awards'>(
    key: K,
    index: number,
    direction: 'up' | 'down',
  ) {
    setDataRaw(
      (d) => {
        const list = [...(d[key] as unknown[])];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= list.length) return d;
        [list[index], list[newIndex]] = [list[newIndex], list[index]];
        return { ...d, [key]: list } as ResumeData;
      },
      true
    );
  }

  function duplicateEntryFn<K extends 'experience' | 'education' | 'projects' | 'certifications' | 'languages' | 'awards'>(
    key: K,
    index: number,
  ) {
    setDataRaw((d) => duplicateEntry(d, key, index), true);
  }

  function addSkill(skill: string) {
    const val = skill.trim();
    if (!val) return;
    setDataRaw((d) => ({ ...d, skills: [...d.skills, val] }));
  }

  function removeSkill(index: number) {
    setDataRaw((d) => ({ ...d, skills: d.skills.filter((_, idx) => idx !== index) }));
  }

  function generateCustomSectionId(): string {
    let id = Date.now().toString(36);
    id += Math.random().toString(36).substring(2, 8);
    return id.substring(0, 40).replace(/[^a-z0-9-]/g, '');
  }

  function addCustomSection() {
    setDataRaw(
      (d) => ({
        ...d,
        customSections: [
          ...d.customSections,
          {
            id: generateCustomSectionId(),
            title: '',
            items: [],
          } as CustomSection,
        ],
      }),
      true
    );
  }

  function updateCustomSection(customId: string, field: keyof CustomSection, value: unknown) {
    setDataRaw((d) => ({
      ...d,
      customSections: d.customSections.map((cs) => (cs.id === customId ? { ...cs, [field]: value } : cs)),
    }));
  }

  function removeCustomSection(customId: string) {
    setDataRaw(
      (d) => {
        const filtered = d.customSections.filter((cs) => cs.id !== customId);
        const newOrder = d.sectionOrder.filter((key) => key !== `custom:${customId}`);
        return { ...d, customSections: filtered, sectionOrder: newOrder };
      },
      true
    );
  }

  function addCustomItem(customId: string) {
    setDataRaw(
      (d) => ({
        ...d,
        customSections: d.customSections.map((cs) =>
          cs.id === customId ? { ...cs, items: [...cs.items, { heading: '', subheading: '', date: '', description: '' }] } : cs
        ),
      }),
      true
    );
  }

  function updateCustomItem(customId: string, itemIndex: number, field: keyof CustomItem, value: string) {
    setDataRaw((d) => ({
      ...d,
      customSections: d.customSections.map((cs) =>
        cs.id === customId
          ? {
              ...cs,
              items: cs.items.map((item, idx) => (idx === itemIndex ? { ...item, [field]: value } : item)),
            }
          : cs
      ),
    }));
  }

  function removeCustomItem(customId: string, itemIndex: number) {
    setDataRaw(
      (d) => ({
        ...d,
        customSections: d.customSections.map((cs) =>
          cs.id === customId
            ? { ...cs, items: cs.items.filter((_, idx) => idx !== itemIndex) }
            : cs
        ),
      }),
      true
    );
  }

  function moveCustomItem(customId: string, itemIndex: number, direction: 'up' | 'down') {
    setDataRaw(
      (d) => ({
        ...d,
        customSections: d.customSections.map((cs) => {
          if (cs.id !== customId) return cs;
          const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
          if (newIndex < 0 || newIndex >= cs.items.length) return cs;
          const newItems = [...cs.items];
          [newItems[itemIndex], newItems[newIndex]] = [newItems[newIndex], newItems[itemIndex]];
          return { ...cs, items: newItems };
        }),
      }),
      true
    );
  }

  function duplicateCustomItem(customId: string, itemIndex: number) {
    setDataRaw(
      (d) => ({
        ...d,
        customSections: d.customSections.map((cs) => {
          if (cs.id !== customId) return cs;
          if (itemIndex < 0 || itemIndex >= cs.items.length) return cs;
          const copy = structuredClone(cs.items[itemIndex]);
          const newItems = [...cs.items];
          newItems.splice(itemIndex + 1, 0, copy);
          return { ...cs, items: newItems };
        }),
      }),
      true
    );
  }

  function loadExample(showToast: (msg: string) => void) {
    if (!isResumeDataEmpty(data)) {
      const ok = window.confirm('This will replace your current entries with the example resume. Continue?');
      if (!ok) return;
    }
    setDataRaw(sampleResumeData, true);
    showToast('Example resume loaded — edit it to make it yours.');
  }

  function clearEverything(showToast: (msg: string) => void) {
    const ok = window.confirm("This will clear everything you've entered. Continue?");
    if (!ok) return;
    setDataRaw(emptyResumeData, true);
    setTouched(new Set());
    showToast('Form cleared.');
  }

  function exportData(showToast: (msg: string) => void) {
    const base = data.personal.name.trim().replace(/\s+/g, '_') || 'resume';
    const filename = `${base}_workslab_export.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Resume data exported.');
  }

  function importData(file: File, showToast: (msg: string) => void) {
    const reader = new FileReader();
    reader.onload = () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(String(reader.result));
      } catch {
        showToast("That file isn't valid JSON — import cancelled.");
        return;
      }
      const validated = validateResumeData(parsed);
      if (!validated) {
        showToast("That doesn't look like a Works Lab resume export — import cancelled.");
        return;
      }
      if (!isResumeDataEmpty(data)) {
        const ok = window.confirm('This will replace your current entries with the imported resume. Continue?');
        if (!ok) return;
      }
      setDataRaw(validated, true);
      setTouched(new Set());
      showToast('Resume imported.');
    };
    reader.onerror = () => showToast("Couldn't read that file — import cancelled.");
    reader.readAsText(file);
  }

  return {
    data,
    canUndo,
    canRedo,
    saveState,
    savedAt,
    pendingCaretRef,
    touched,
    undo,
    redo,
    markTouched,
    updatePersonal,
    updateSummary,
    addEntry,
    updateEntry,
    removeEntry,
    moveEntry,
    duplicateEntryFn,
    addSkill,
    removeSkill,
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    addCustomItem,
    updateCustomItem,
    removeCustomItem,
    moveCustomItem,
    duplicateCustomItem,
    loadExample,
    clearEverything,
    exportData,
    importData,
    setData,
  };
}
