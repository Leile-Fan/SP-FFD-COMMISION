// ============================================================
// Manual Content Types
// ============================================================

export interface ManualMeta {
  title: string;
  subtitleEn: string;
  subtitleCn: string;
  machineModel: string;
  manufacturingNo: string;
  yearOfManufacture: string;
  customerEn: string;
  customerCn: string;
  orderNo: string;
  totalPages: number;
  generatedAt: string;
  languages: string[];
}

export interface Figure {
  id: string;
  captionEn?: string;
  captionCn?: string;
  fileName: string;
  thumbnail?: string;
}

export interface SubSection {
  id: string;
  number: string;
  titleEn: string;
  titleCn: string;
  contentEn: string;
  contentCn: string;
  figures: Figure[];
}

export interface Section {
  id: string;
  number: string;
  titleEn: string;
  titleCn: string;
  contentEn: string;
  contentCn: string;
  figures: Figure[];
  subsections: SubSection[];
}

export interface Chapter {
  id: string;
  number: string;
  titleEn: string;
  titleCn: string;
  sections: Section[];
}

export interface Manual {
  meta: ManualMeta;
  chapters: Chapter[];
}

// ============================================================
// Checklist Types
// ============================================================

export interface ChecklistItemDef {
  id: string;
  number: number;
  title: string;
  titleCn: string;
  hasValue: boolean;
  valueUnit?: string;
  hasRemark: boolean;
  remark?: string;
}

export interface ChecklistDef {
  meta: {
    title: string;
    titleCn: string;
    source: string;
    totalItems: number;
  };
  items: ChecklistItemDef[];
}

// ============================================================
// Note Types
// ============================================================

export type LanguageMode = 'en' | 'cn' | 'bilingual';

export interface ChecklistResultItem {
  itemId: string;
  done: boolean;
  value?: string;
  remark?: string;
}

export interface ChecklistRecord {
  id: string;
  type: 'checklist';
  sectionId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  device: string;
  items: ChecklistResultItem[];
}

export interface CommissioningParams {
  noLoadMotorCurrentA?: string;
  noLoadMotorPowerKW?: string;
  noLoadDrumSpeedRPM?: string;
  noLoadVibrationMMS?: string;
  noLoadBearingTempC?: string;
  noLoadDurationMin?: string;
  waterRunMotorCurrentA?: string;
  waterRunMotorPowerKW?: string;
  waterRunDrumSpeedRPM?: string;
  waterRunWaterFlowM3H?: string;
  waterRunVibrationMMS?: string;
  productionMotorCurrentA?: string;
  productionMotorPowerKW?: string;
  productionConsistencyPct?: string;
  productionThroughputTD?: string;
  productionTemperatureC?: string;
  ambientTempC?: string;
  operatorName?: string;
}

export type DebugRecordType = 'no-load' | 'water-run' | 'production';

export interface DebugRecord {
  id: string;
  type: 'debug-record';
  sectionId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  device: string;
  recordType: DebugRecordType;
  params: CommissioningParams;
  remarks?: string;
}

export interface FreeNote {
  id: string;
  type: 'free-note';
  sectionId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  device: string;
  content: string;
}

export type NoteRecord = ChecklistRecord | DebugRecord | FreeNote;

// ============================================================
// Sync Types
// ============================================================

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'unconfigured';
export type SyncAction = 'pull' | 'push' | 'merge';

export interface SyncState {
  status: SyncStatus;
  lastSyncAt: string | null;
  pendingChanges: number;
  error: string | null;
}

// ============================================================
// App Config
// ============================================================

export interface AppConfig {
  githubToken: string;
  githubRepo: string;
  githubBranch: string;
  deviceName: string;
}
