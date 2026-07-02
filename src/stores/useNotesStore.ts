import { create } from 'zustand';
import { NoteRecord, ChecklistRecord, DebugRecord, FreeNote, ChecklistResultItem } from '../types';

const STORAGE_KEY = 'ffd400eel_notes';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getDevice(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) return 'iPhone';
  if (/Mac/.test(ua)) return 'Mac';
  return 'Unknown';
}

function loadNotes(): NoteRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: NoteRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

interface NotesStore {
  notes: NoteRecord[];
  loading: boolean;
  selectedNoteId: string | null;
  isEditorOpen: boolean;
  editorType: 'checklist' | 'debug' | 'free' | null;

  loadNotes: () => void;
  getNotesForSection: (sectionId: string) => NoteRecord[];
  openEditor: (type: 'checklist' | 'debug' | 'free') => void;
  closeEditor: () => void;
  createChecklist: (sectionId: string, title: string, items: ChecklistResultItem[]) => ChecklistRecord;
  createDebugRecord: (sectionId: string, title: string, recordType: DebugRecord['recordType'], params: DebugRecord['params'], remarks?: string) => DebugRecord;
  createFreeNote: (sectionId: string, title: string, content: string) => FreeNote;
  updateChecklist: (id: string, items: ChecklistResultItem[]) => void;
  deleteNote: (id: string) => void;
  setSelectedNote: (id: string | null) => void;
  getAllNotes: () => NoteRecord[];
  exportNotesJson: () => string;
  importNotesJson: (json: string) => void;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: loadNotes(),
  loading: false,
  selectedNoteId: null,
  isEditorOpen: false,
  editorType: null,

  loadNotes: () => {
    set({ notes: loadNotes(), loading: false });
  },

  getNotesForSection: (sectionId) => {
    return get().notes.filter((n) => n.sectionId === sectionId);
  },

  openEditor: (type) => set({ isEditorOpen: true, editorType: type }),

  closeEditor: () => set({ isEditorOpen: false, editorType: null }),

  createChecklist: (sectionId, title, items) => {
    const record: ChecklistRecord = {
      id: generateId(),
      type: 'checklist',
      sectionId,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      device: getDevice(),
      items,
    };
    const notes = [...get().notes, record];
    saveNotes(notes);
    set({ notes, isEditorOpen: false, editorType: null });
    return record;
  },

  createDebugRecord: (sectionId, title, recordType, params, remarks) => {
    const record: DebugRecord = {
      id: generateId(),
      type: 'debug-record',
      sectionId,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      device: getDevice(),
      recordType,
      params,
      remarks,
    };
    const notes = [...get().notes, record];
    saveNotes(notes);
    set({ notes, isEditorOpen: false, editorType: null });
    return record;
  },

  createFreeNote: (sectionId, title, content) => {
    const record: FreeNote = {
      id: generateId(),
      type: 'free-note',
      sectionId,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      device: getDevice(),
      content,
    };
    const notes = [...get().notes, record];
    saveNotes(notes);
    set({ notes, isEditorOpen: false, editorType: null });
    return record;
  },

  updateChecklist: (id, items) => {
    const notes = get().notes.map((n) =>
      n.id === id ? { ...n, items, updatedAt: new Date().toISOString() } : n
    );
    saveNotes(notes);
    set({ notes });
  },

  deleteNote: (id) => {
    const notes = get().notes.filter((n) => n.id !== id);
    saveNotes(notes);
    set({ notes, selectedNoteId: null });
  },

  setSelectedNote: (id) => set({ selectedNoteId: id }),

  getAllNotes: () => get().notes,

  exportNotesJson: () => JSON.stringify(get().notes, null, 2),

  importNotesJson: (json) => {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        saveNotes(parsed);
        set({ notes: parsed });
      }
    } catch (e) {
      console.error('Failed to import notes:', e);
    }
  },
}));
