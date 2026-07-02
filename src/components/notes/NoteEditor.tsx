import { useState, useEffect } from 'react';
import { useNotesStore } from '../../stores/useNotesStore';
import { useManualStore } from '../../stores/useManualStore';
import { DebugRecordType, CommissioningParams } from '../../types';

export function NoteEditor() {
  const isOpen = useNotesStore((s) => s.isEditorOpen);
  const editorType = useNotesStore((s) => s.editorType);
  const closeEditor = useNotesStore((s) => s.closeEditor);
  const createChecklist = useNotesStore((s) => s.createChecklist);
  const createDebugRecord = useNotesStore((s) => s.createDebugRecord);
  const createFreeNote = useNotesStore((s) => s.createFreeNote);
  const currentSectionId = useManualStore((s) => s.currentSectionId);
  const getSection = useManualStore((s) => s.getSection);

  const [title, setTitle] = useState('');
  const [recordType, setRecordType] = useState<DebugRecordType>('no-load');
  const [params, setParams] = useState<CommissioningParams>({});
  const [remarks, setRemarks] = useState('');
  const [freeContent, setFreeContent] = useState('');

  // Checklist items (loaded from checklist.json)
  const [checkItems, setCheckItems] = useState<Array<{ itemId: string; done: boolean; value: string; remark: string }>>([]);
  const [checklistDef, setChecklistDef] = useState<any>(null);

  const sectionTitle = currentSectionId ? getSection(currentSectionId)?.section?.titleCn || '' : '';

  useEffect(() => {
    if (isOpen && editorType === 'checklist' && !checklistDef) {
      fetch('/data/checklist.json')
        .then((r) => r.json())
        .then((data) => {
          setChecklistDef(data);
          setCheckItems(
            data.items.map((item: any) => ({
              itemId: item.id,
              done: false,
              value: '',
              remark: '',
            }))
          );
        });
    }
    // Reset form
    setTitle('');
    setRecordType('no-load');
    setParams({});
    setRemarks('');
    setFreeContent('');
  }, [isOpen, editorType]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!currentSectionId) return;

    if (editorType === 'checklist') {
      createChecklist(currentSectionId, title || `调试检查 - ${new Date().toLocaleDateString('zh-CN')}`, checkItems);
    } else if (editorType === 'debug') {
      createDebugRecord(
        currentSectionId,
        title || `${recordType === 'no-load' ? '空载' : recordType === 'water-run' ? '水运行' : '生产'}测试 - ${new Date().toLocaleDateString('zh-CN')}`,
        recordType,
        params,
        remarks
      );
    } else if (editorType === 'free') {
      createFreeNote(currentSectionId, title || '无标题笔记', freeContent);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={closeEditor} />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-50 bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="font-semibold text-slate-800">
            {editorType === 'checklist' ? '调试检查清单' : editorType === 'debug' ? '调试记录' : '自由笔记'}
          </h3>
          <button onClick={closeEditor} className="text-slate-400 hover:text-slate-600 p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Section context */}
          {sectionTitle && (
            <div className="text-xs text-slate-400 bg-slate-50 rounded-md px-3 py-2">
              关联章节：{sectionTitle}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={editorType === 'checklist' ? '例如：调试检查 - 2026年7月' : '输入标题...'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          {/* Checklist Editor */}
          {editorType === 'checklist' && checklistDef && (
            <div className="space-y-1 max-h-80 overflow-y-auto border border-slate-200 rounded-lg">
              {checklistDef.items.map((item: any, idx: number) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 px-3 py-2 text-xs ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checkItems[idx]?.done || false}
                    onChange={(e) => {
                      const updated = [...checkItems];
                      updated[idx] = { ...updated[idx], done: e.target.checked };
                      setCheckItems(updated);
                    }}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="flex-1 text-slate-700">{item.number}. {item.titleCn}</span>
                  {item.hasValue && (
                    <input
                      type="text"
                      value={checkItems[idx]?.value || ''}
                      onChange={(e) => {
                        const updated = [...checkItems];
                        updated[idx] = { ...updated[idx], value: e.target.value };
                        setCheckItems(updated);
                      }}
                      placeholder={item.valueUnit || '值'}
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-xs"
                    />
                  )}
                  {item.hasRemark && (
                    <input
                      type="text"
                      value={checkItems[idx]?.remark || ''}
                      onChange={(e) => {
                        const updated = [...checkItems];
                        updated[idx] = { ...updated[idx], remark: e.target.value };
                        setCheckItems(updated);
                      }}
                      placeholder={item.remark || '备注'}
                      className="w-24 px-2 py-1 border border-slate-300 rounded text-xs hidden sm:block"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Debug Record Editor */}
          {editorType === 'debug' && (
            <>
              {/* Record type selector */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">测试类型</label>
                <div className="flex gap-2">
                  {([
                    ['no-load', '空载测试'],
                    ['water-run', '水运行测试'],
                    ['production', '生产运行'],
                  ] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setRecordType(val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        recordType === val
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parameters grid */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block">参数</label>
                <div className="grid grid-cols-2 gap-2">
                  {(recordType === 'no-load' || recordType === 'water-run') && (
                    <>
                      <ParamField label="电机电流 (A)" value={params.noLoadMotorCurrentA} onChange={(v) => setParams((p) => ({ ...p, noLoadMotorCurrentA: v }))} />
                      <ParamField label="电机功率 (kW)" value={params.noLoadMotorPowerKW} onChange={(v) => setParams((p) => ({ ...p, noLoadMotorPowerKW: v }))} />
                      <ParamField label="转速 (rpm)" value={params.noLoadDrumSpeedRPM} onChange={(v) => setParams((p) => ({ ...p, noLoadDrumSpeedRPM: v }))} />
                      <ParamField label="振动 (mm/s)" value={params.noLoadVibrationMMS} onChange={(v) => setParams((p) => ({ ...p, noLoadVibrationMMS: v }))} />
                      <ParamField label="轴承温度 (°C)" value={params.noLoadBearingTempC} onChange={(v) => setParams((p) => ({ ...p, noLoadBearingTempC: v }))} />
                      <ParamField label="运行时长 (min)" value={params.noLoadDurationMin} onChange={(v) => setParams((p) => ({ ...p, noLoadDurationMin: v }))} />
                    </>
                  )}
                  {recordType === 'water-run' && (
                    <ParamField label="水流量 (m³/h)" value={params.waterRunWaterFlowM3H} onChange={(v) => setParams((p) => ({ ...p, waterRunWaterFlowM3H: v }))} />
                  )}
                  {recordType === 'production' && (
                    <>
                      <ParamField label="电机电流 (A)" value={params.productionMotorCurrentA} onChange={(v) => setParams((p) => ({ ...p, productionMotorCurrentA: v }))} />
                      <ParamField label="电机功率 (kW)" value={params.productionMotorPowerKW} onChange={(v) => setParams((p) => ({ ...p, productionMotorPowerKW: v }))} />
                      <ParamField label="浆浓 (%)" value={params.productionConsistencyPct} onChange={(v) => setParams((p) => ({ ...p, productionConsistencyPct: v }))} />
                      <ParamField label="产能 (t/d)" value={params.productionThroughputTD} onChange={(v) => setParams((p) => ({ ...p, productionThroughputTD: v }))} />
                      <ParamField label="温度 (°C)" value={params.productionTemperatureC} onChange={(v) => setParams((p) => ({ ...p, productionTemperatureC: v }))} />
                    </>
                  )}
                  <ParamField label="环境温度 (°C)" value={params.ambientTempC} onChange={(v) => setParams((p) => ({ ...p, ambientTempC: v }))} />
                  <ParamField label="操作员" value={params.operatorName} onChange={(v) => setParams((p) => ({ ...p, operatorName: v }))} />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">备注</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="自由备注..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                />
              </div>
            </>
          )}

          {/* Free Note Editor */}
          {editorType === 'free' && (
            <div>
              <textarea
                value={freeContent}
                onChange={(e) => setFreeContent(e.target.value)}
                placeholder="写笔记..."
                rows={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-slate-200 sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={closeEditor} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            保存
          </button>
        </div>
      </div>
    </>
  );
}

function ParamField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] text-slate-500 w-24 flex-shrink-0 text-right">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary-300"
        inputMode="decimal"
      />
    </div>
  );
}
