import { create } from 'zustand';
import { Manual, LanguageMode, Section, Chapter } from '../types';

interface ManualStore {
  manual: Manual | null;
  loading: boolean;
  error: string | null;
  currentSectionId: string | null;
  languageMode: LanguageMode;
  sidebarOpen: boolean;
  searchQuery: string;

  loadManual: () => Promise<void>;
  setCurrentSection: (id: string) => void;
  setLanguageMode: (mode: LanguageMode) => void;
  toggleSidebar: () => void;
  setSearchQuery: (q: string) => void;
  getSection: (id: string) => { section: Section | null; chapter: Chapter | null; parent: Section | null };
  searchSections: (q: string) => { id: string; titleEn: string; titleCn: string; chapterTitle: string; snippet: string }[];
}

export const useManualStore = create<ManualStore>((set, get) => ({
  manual: null,
  loading: true,
  error: null,
  currentSectionId: null,
  languageMode: 'bilingual',
  sidebarOpen: false,
  searchQuery: '',

  loadManual: async () => {
    try {
      const resp = await fetch('/data/manual.json');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const manual: Manual = await resp.json();
      // Set first subsection as default
      const first = manual.chapters[0]?.sections[0];
      const firstId = first?.subsections?.[0]?.id || first?.id || null;
      set({ manual, loading: false, currentSectionId: firstId });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setCurrentSection: (id) => set({ currentSectionId: id, sidebarOpen: false }),

  setLanguageMode: (mode) => set({ languageMode: mode }),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  setSearchQuery: (q) => set({ searchQuery: q }),

  getSection: (id) => {
    const { manual } = get();
    if (!manual) return { section: null, chapter: null, parent: null };

    for (const ch of manual.chapters) {
      for (const sec of ch.sections) {
        if (sec.id === id) return { section: sec, chapter: ch, parent: null };
        for (const sub of sec.subsections) {
          if (sub.id === id) return { section: sub as any, chapter: ch, parent: sec };
        }
      }
    }
    return { section: null, chapter: null, parent: null };
  },

  searchSections: (q) => {
    const { manual } = get();
    if (!manual || !q.trim()) return [];
    const query = q.toLowerCase();
    const results: any[] = [];

    for (const ch of manual.chapters) {
      for (const sec of ch.sections) {
        // Search in section itself
        if (sec.titleEn.toLowerCase().includes(query) ||
            sec.titleCn.includes(query) ||
            sec.contentEn.toLowerCase().includes(query) ||
            sec.contentCn.includes(query)) {
          results.push({
            id: sec.id,
            titleEn: sec.titleEn,
            titleCn: sec.titleCn,
            chapterTitle: `${ch.number}. ${ch.titleCn}`,
            snippet: getSnippet(sec.contentEn, sec.contentCn, query),
          });
        }
        // Search in subsections
        for (const sub of sec.subsections) {
          if (sub.titleEn.toLowerCase().includes(query) ||
              sub.titleCn.includes(query) ||
              sub.contentEn.toLowerCase().includes(query) ||
              sub.contentCn.includes(query)) {
            results.push({
              id: sub.id,
              titleEn: sub.titleEn,
              titleCn: sub.titleCn,
              chapterTitle: `${ch.number}. ${ch.titleCn}`,
              snippet: getSnippet(sub.contentEn, sub.contentCn, query),
            });
          }
        }
      }
    }
    return results.slice(0, 20);
  },
}));

function getSnippet(en: string, cn: string, query: string): string {
  const all = en + ' ' + cn;
  const idx = all.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return all.slice(0, 100) + '...';
  const start = Math.max(0, idx - 30);
  const end = Math.min(all.length, idx + query.length + 80);
  return (start > 0 ? '...' : '') + all.slice(start, end) + (end < all.length ? '...' : '');
}
