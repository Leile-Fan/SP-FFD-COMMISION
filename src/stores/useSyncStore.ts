import { create } from 'zustand';
import { useNotesStore } from './useNotesStore';
import { useToast } from '../components/common/Toast';
import * as gh from '../services/githubApi';

interface SyncStore {
  status: 'idle' | 'syncing' | 'error' | 'unconfigured';
  lastSyncAt: string | null;
  error: string | null;
  isSettingsOpen: boolean;

  sync: () => Promise<void>;
  openSettings: () => void;
  closeSettings: () => void;
  checkConfig: () => void;
}

export const useSyncStore = create<SyncStore>((set) => ({
  status: gh.isConfigured() ? 'idle' : 'unconfigured',
  lastSyncAt: null,
  error: null,
  isSettingsOpen: false,

  sync: async () => {
    if (!gh.isConfigured()) {
      set({ status: 'unconfigured' });
      return;
    }

    set({ status: 'syncing', error: null });

    try {
      const notesJson = useNotesStore.getState().exportNotesJson();

      const device = /iPhone|iPad/.test(navigator.userAgent) ? 'iPhone' : 'Mac';
      const result = await gh.syncNotes(notesJson, device);

      if (result.status === 'merged') {
        // Remote had changes, update local
        useNotesStore.getState().importNotesJson(result.merged);
        useToast.getState().showToast('同步完成 - 已合并多设备数据');
      } else if (result.status === 'pushed') {
        useToast.getState().showToast('同步完成 - 已上传笔记');
      } else {
        useToast.getState().showToast('已是最新');
      }

      set({
        status: 'idle',
        lastSyncAt: new Date().toISOString(),
        error: null,
      });
    } catch (e) {
      const msg = (e as Error).message;
      set({ status: 'error', error: msg });
      useToast.getState().showToast(`同步失败: ${msg}`);
    }
  },

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  checkConfig: () => {
    set({ status: gh.isConfigured() ? 'idle' : 'unconfigured' });
  },
}));
