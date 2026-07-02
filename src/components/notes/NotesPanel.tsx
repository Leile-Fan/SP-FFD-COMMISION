import { useNotesStore } from '../../stores/useNotesStore';
import { NoteRecord, ChecklistRecord, DebugRecord, FreeNote } from '../../types';

interface Props {
  sectionId: string;
}

export function NotesPanel({ sectionId }: Props) {
  const notes = useNotesStore((s) => s.getNotesForSection(sectionId));
  const openEditor = useNotesStore((s) => s.openEditor);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const selectedNoteId = useNotesStore((s) => s.selectedNoteId);
  const setSelectedNote = useNotesStore((s) => s.setSelectedNote);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-600">
          笔记与记录
          {notes.length > 0 && (
            <span className="ml-2 text-xs font-normal text-slate-400">({notes.length})</span>
          )}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => openEditor('checklist')}
            className="text-xs px-2.5 py-1.5 rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium"
          >
            + 检查清单
          </button>
          <button
            onClick={() => openEditor('debug')}
            className="text-xs px-2.5 py-1.5 rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium"
          >
            + 调试记录
          </button>
          <button
            onClick={() => openEditor('free')}
            className="text-xs px-2.5 py-1.5 rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium"
          >
            + 笔记
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center">
          此章节暂无笔记。点击上方按钮添加记录。
        </p>
      ) : (
        <div className="space-y-2">
          {notes
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onSelect={() => setSelectedNote(selectedNoteId === note.id ? null : note.id)}
                onDelete={() => deleteNote(note.id)}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({
  note,
  isSelected,
  onSelect,
  onDelete,
}: {
  note: NoteRecord;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const date = new Date(note.updatedAt).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });

  const typeLabel =
    note.type === 'checklist' ? '检查清单' : note.type === 'debug-record' ? '调试记录' : '笔记';
  const typeColor =
    note.type === 'checklist'
      ? 'bg-green-100 text-green-700'
      : note.type === 'debug-record'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-purple-100 text-purple-700';

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-lg border p-3 cursor-pointer transition-all ${
        isSelected ? 'border-primary-400 shadow-sm ring-1 ring-primary-200' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeColor}`}>
              {typeLabel}
            </span>
            <span className="text-[10px] text-slate-400">{date}</span>
          </div>
          <p className="text-sm font-medium text-slate-700 truncate">{note.title}</p>

          {note.type === 'debug-record' && (
            <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
              {(note as DebugRecord).params.noLoadMotorCurrentA && (
                <>
                  <span>空载电流: {(note as DebugRecord).params.noLoadMotorCurrentA}A</span>
                  <span>功率: {(note as DebugRecord).params.noLoadMotorPowerKW}kW</span>
                </>
              )}
              {(note as DebugRecord).params.waterRunMotorCurrentA && (
                <>
                  <span>水运电流: {(note as DebugRecord).params.waterRunMotorCurrentA}A</span>
                  <span>功率: {(note as DebugRecord).params.waterRunMotorPowerKW}kW</span>
                </>
              )}
            </div>
          )}

          {note.type === 'checklist' && (
            <div className="mt-1 text-[10px] text-slate-400">
              {(note as ChecklistRecord).items.filter((i) => i.done).length}/
              {(note as ChecklistRecord).items.length} 项已完成
            </div>
          )}

          {isSelected && note.type === 'free-note' && (
            <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
              {(note as FreeNote).content}
            </p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-slate-300 hover:text-red-500 flex-shrink-0 p-0.5"
          title="删除"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
