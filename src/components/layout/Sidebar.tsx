import { useManualStore } from '../../stores/useManualStore';
import { Chapter, Section } from '../../types';

export function Sidebar() {
  const manual = useManualStore((s) => s.manual);
  const sidebarOpen = useManualStore((s) => s.sidebarOpen);
  const toggleSidebar = useManualStore((s) => s.toggleSidebar);
  const currentSectionId = useManualStore((s) => s.currentSectionId);
  const setCurrentSection = useManualStore((s) => s.setCurrentSection);
  const searchQuery = useManualStore((s) => s.searchQuery);
  const searchSections = useManualStore((s) => s.searchSections);

  const results = searchQuery ? searchSections(searchQuery) : [];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 bg-white border-r border-slate-200
          transform transition-transform duration-200
          lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Mobile close */}
        <div className="lg:hidden flex items-center justify-between p-3 border-b border-slate-200">
          <span className="font-semibold text-sm text-slate-700">目录</span>
          <button onClick={toggleSidebar} className="p-1 text-slate-400 hover:text-slate-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search (mobile) */}
        <div className="sm:hidden p-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => useManualStore.setState({ searchQuery: e.target.value })}
            placeholder="搜索章节..."
            className="w-full px-3 py-1.5 rounded-lg text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-2">
          {searchQuery ? (
            <div className="px-3">
              <p className="text-xs text-slate-400 mb-2">
                搜索 "{searchQuery}" ({results.length} 条结果)
              </p>
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setCurrentSection(r.id)}
                  className="w-full text-left p-2 rounded-md hover:bg-primary-50 mb-1"
                >
                  <span className="text-xs text-primary-600">{r.chapterTitle}</span>
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {r.titleCn} · {r.titleEn}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{r.snippet}</p>
                </button>
              ))}
              {results.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">未找到结果</p>
              )}
            </div>
          ) : manual ? (
            <nav>
              {manual.chapters.map((ch) => (
                <ChapterNode
                  key={ch.id}
                  chapter={ch}
                  currentSectionId={currentSectionId}
                  onSelect={setCurrentSection}
                />
              ))}
            </nav>
          ) : null}
        </div>
      </aside>
    </>
  );
}

function ChapterNode({
  chapter,
  currentSectionId,
  onSelect,
}: {
  chapter: Chapter;
  currentSectionId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div className="px-3 py-2 text-xs font-semibold text-primary-700 bg-primary-50/60 uppercase tracking-wide">
        {chapter.number}. {chapter.titleCn}
      </div>
      {chapter.sections.map((sec) => (
        <SectionNode
          key={sec.id}
          section={sec}
          level={0}
          currentSectionId={currentSectionId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function SectionNode({
  section,
  level,
  currentSectionId,
  onSelect,
}: {
  section: Section;
  level: number;
  currentSectionId: string | null;
  onSelect: (id: string) => void;
}) {
  const isActive = currentSectionId === section.id;
  const hasSubs = section.subsections && section.subsections.length > 0;

  return (
    <div>
      <button
        onClick={() => onSelect(section.id)}
        className={`w-full text-left px-3 py-1.5 text-sm transition-colors flex items-center gap-1 ${
          isActive
            ? 'bg-primary-100 text-primary-800 font-medium border-r-3 border-primary-600'
            : 'text-slate-600 hover:bg-slate-50'
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        <span className="text-primary-400 text-xs font-mono w-8 flex-shrink-0">
          {section.number}
        </span>
        <span className="truncate">{section.titleCn}</span>
      </button>
      {hasSubs &&
        section.subsections.map((sub) => (
          <SectionNode
            key={sub.id}
            section={sub as any}
            level={level + 1}
            currentSectionId={currentSectionId}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}
