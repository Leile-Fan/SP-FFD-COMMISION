import { useManualStore } from '../../stores/useManualStore';
import { LanguageMode } from '../../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Props {
  sectionId: string;
}

export function ContentView({ sectionId }: Props) {
  const getSection = useManualStore((s) => s.getSection);
  const setCurrentSection = useManualStore((s) => s.setCurrentSection);
  const languageMode = useManualStore((s) => s.languageMode);
  const manual = useManualStore((s) => s.manual);

  const result = getSection(sectionId);
  const { section, chapter, parent } = result;

  if (!section || !chapter || !manual) {
    return (
      <div className="p-6 text-slate-400 text-center">
        请选择一个章节
      </div>
    );
  }

  const contentEn = section.contentEn || '';
  const contentCn = section.contentCn || '';

  // Find prev/next section
  const { prev, next } = findPrevNext(manual, sectionId);

  return (
    <div className="p-4 lg:p-6 pb-20">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-400 mb-3 flex items-center gap-1 flex-wrap">
        <span>{chapter.number}. {chapter.titleCn}</span>
        {parent && (
          <>
            <span>›</span>
            <span>{parent.titleCn}</span>
          </>
        )}
        <span>›</span>
        <span className="text-primary-600 font-medium">{section.number} {section.titleCn}</span>
      </div>

      {/* Section title */}
      <h2 className="text-lg font-bold text-primary-800 mb-1">
        {section.number} {section.titleCn}
      </h2>
      <p className="text-sm text-slate-500 mb-4">{section.titleEn}</p>

      {/* Content */}
      <div className="prose max-w-none">
        {languageMode === 'en' && (
          <div>
            {contentEn ? <MarkdownRenderer content={contentEn} /> : (
              <p className="text-slate-400 italic text-sm">(English content not available for this section)</p>
            )}
          </div>
        )}
        {languageMode === 'cn' && (
          <div>
            {contentCn ? <MarkdownRenderer content={contentCn} /> : (
              <p className="text-slate-400 italic text-sm">(此章节暂无中文内容)</p>
            )}
          </div>
        )}
        {languageMode === 'bilingual' && (
          <div>
            {contentEn ? (
              <div className="mb-4 pb-4 border-b border-slate-200">
                <div className="text-xs text-primary-500 font-medium mb-2 uppercase tracking-wide">English</div>
                <MarkdownRenderer content={contentEn} />
              </div>
            ) : null}
            {contentCn ? (
              <div>
                <div className="text-xs text-primary-500 font-medium mb-2 uppercase tracking-wide">中文</div>
                <MarkdownRenderer content={contentCn} />
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Prev / Next navigation */}
      <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
        {prev ? (
          <button
            onClick={() => setCurrentSection(prev.id)}
            className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1"
          >
            <span>←</span>
            <span className="hidden sm:inline">{prev.titleCn}</span>
            <span className="sm:hidden">上一节</span>
          </button>
        ) : <div />}
        {next ? (
          <button
            onClick={() => setCurrentSection(next.id)}
            className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1"
          >
            <span className="hidden sm:inline">{next.titleCn}</span>
            <span className="sm:hidden">下一节</span>
            <span>→</span>
          </button>
        ) : <div />}
      </div>
    </div>
  );
}

function findPrevNext(manual: any, currentId: string) {
  const allIds: { id: string; titleCn: string }[] = [];

  for (const ch of manual.chapters) {
    for (const sec of ch.sections) {
      allIds.push({ id: sec.id, titleCn: sec.titleCn });
      for (const sub of sec.subsections || []) {
        allIds.push({ id: sub.id, titleCn: sub.titleCn });
      }
    }
  }

  const idx = allIds.findIndex((x) => x.id === currentId);
  return {
    prev: idx > 0 ? allIds[idx - 1] : null,
    next: idx < allIds.length - 1 ? allIds[idx + 1] : null,
  };
}
