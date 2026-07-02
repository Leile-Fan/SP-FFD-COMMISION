import { useEffect } from 'react';
import { useManualStore } from './stores/useManualStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ContentView } from './components/content/ContentView';
import { NotesPanel } from './components/notes/NotesPanel';
import { NoteEditor } from './components/notes/NoteEditor';
import { SyncSettings } from './components/sync/SyncSettings';
import { ImageLightbox } from './components/common/ImageLightbox';
import { Toast } from './components/common/Toast';

export default function App() {
  const loadManual = useManualStore((s) => s.loadManual);
  const loading = useManualStore((s) => s.loading);
  const error = useManualStore((s) => s.error);
  const currentSectionId = useManualStore((s) => s.currentSectionId);

  useEffect(() => {
    loadManual();
  }, [loadManual]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">加载手册中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="text-center p-6">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-slate-700 font-medium">加载失败</p>
          <p className="text-slate-500 text-sm mt-1">{error}</p>
          <button onClick={loadManual} className="mt-4 px-5 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-white">
          {currentSectionId ? (
            <div className="flex flex-col lg:flex-row min-h-full">
              <div className="flex-1 min-w-0">
                <ContentView sectionId={currentSectionId} />
              </div>
              <div className="lg:w-96 lg:min-w-96 border-l border-slate-200 bg-slate-50/50">
                <NotesPanel sectionId={currentSectionId} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              请从左侧目录选择一个章节
            </div>
          )}
        </main>
      </div>
      <SyncSettings />
      <NoteEditor />
      <ImageLightbox />
      <Toast />
    </div>
  );
}
