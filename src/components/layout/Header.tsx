import { useManualStore } from '../../stores/useManualStore';
import { useSyncStore } from '../../stores/useSyncStore';
import { LanguageMode } from '../../types';

const LANG_OPTIONS: { mode: LanguageMode; label: string }[] = [
  { mode: 'en', label: 'EN' },
  { mode: 'cn', label: '中文' },
  { mode: 'bilingual', label: '中英' },
];

export function Header() {
  const toggleSidebar = useManualStore((s) => s.toggleSidebar);
  const languageMode = useManualStore((s) => s.languageMode);
  const setLanguageMode = useManualStore((s) => s.setLanguageMode);
  const searchQuery = useManualStore((s) => s.searchQuery);
  const setSearchQuery = useManualStore((s) => s.setSearchQuery);
  const syncStatus = useSyncStore((s) => s.status);
  const sync = useSyncStore((s) => s.sync);
  const openSettings = useSyncStore((s) => s.openSettings);

  const statusColor =
    syncStatus === 'idle' ? 'bg-green-400' :
    syncStatus === 'syncing' ? 'bg-yellow-400 animate-pulse' :
    syncStatus === 'error' ? 'bg-red-400' :
    'bg-gray-400';

  const statusTitle =
    syncStatus === 'idle' ? '已同步' :
    syncStatus === 'syncing' ? '同步中...' :
    syncStatus === 'error' ? '同步失败' :
    '未配置同步';

  return (
    <header className="bg-primary-700 text-white flex items-center px-3 py-2 gap-2 shadow-md z-20 flex-shrink-0">
      {/* Menu button (mobile) */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-1.5 hover:bg-primary-600 rounded-md"
        aria-label="菜单"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Title */}
      <h1 className="text-sm font-semibold whitespace-nowrap truncate">
        FFD400EEL
        <span className="hidden sm:inline text-primary-200 font-normal ml-1.5 text-xs">电子手册</span>
      </h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden sm:block">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索..."
          className="w-36 lg:w-48 px-3 py-1.5 rounded-lg text-sm text-slate-700 bg-white/90 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Language switcher */}
      <div className="flex rounded-lg bg-primary-600 p-0.5 gap-0.5">
        {LANG_OPTIONS.map((opt) => (
          <button
            key={opt.mode}
            onClick={() => setLanguageMode(opt.mode)}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
              languageMode === opt.mode
                ? 'bg-white text-primary-700'
                : 'text-primary-100 hover:bg-primary-500'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Sync button */}
      <button
        onClick={() => syncStatus === 'unconfigured' ? openSettings() : sync()}
        className="p-1.5 hover:bg-primary-600 rounded-md relative"
        title={statusTitle}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={syncStatus === 'syncing' ? 'animate-spin' : ''}>
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" />
        </svg>
        <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-primary-700 ${statusColor}`} />
      </button>

      {/* Settings gear */}
      <button
        onClick={openSettings}
        className="p-1.5 hover:bg-primary-600 rounded-md"
        title="同步设置"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>
    </header>
  );
}
