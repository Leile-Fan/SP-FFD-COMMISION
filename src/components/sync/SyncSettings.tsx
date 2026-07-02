import { useState } from 'react';
import { useSyncStore } from '../../stores/useSyncStore';
import * as gh from '../../services/githubApi';

export function SyncSettings() {
  const isOpen = useSyncStore((s) => s.isSettingsOpen);
  const close = useSyncStore((s) => s.closeSettings);
  const checkConfig = useSyncStore((s) => s.checkConfig);
  const sync = useSyncStore((s) => s.sync);
  const status = useSyncStore((s) => s.status);
  const lastSyncAt = useSyncStore((s) => s.lastSyncAt);
  const error = useSyncStore((s) => s.error);

  const config = gh.getSyncConfig();
  const [token, setToken] = useState(config?.token || '');
  const [owner, setOwner] = useState(config?.owner || '');
  const [repo, setRepo] = useState(config?.repo || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    gh.saveConfig({
      token,
      owner,
      repo,
      branch: 'main',
    });
    checkConfig();
    setTestResult('配置已保存 ✓');
  };

  const handleTest = async () => {
    // Temporarily save config for testing
    gh.saveConfig({ token, owner, repo, branch: 'main' });
    setTesting(true);
    const result = await gh.testConnection();
    setTesting(false);
    setTestResult(result.ok ? `连接成功！用户: ${result.user}` : `连接失败: ${result.error}`);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={close} />
      <div className="fixed inset-x-0 bottom-0 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-50 bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl max-w-md w-full mx-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">GitHub 同步设置</h3>
          <button onClick={close} className="text-slate-400 hover:text-slate-600 p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-500">
            配置 GitHub 仓库来同步你的笔记和调试记录。你需要一个 Personal Access Token（仅需 <code className="bg-slate-100 px-1 rounded">contents: read & write</code> 权限）。
          </p>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">GitHub Token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 font-mono"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-600 mb-1 block">Owner</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="你的GitHub用户名"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-600 mb-1 block">Repo</label>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="仓库名"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
          </div>

          {testResult && (
            <div className={`text-xs p-2 rounded ${testResult.includes('成功') ? 'bg-green-50 text-green-700' : testResult.includes('失败') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              {testResult}
            </div>
          )}

          {/* Status info */}
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 space-y-1">
            <div>状态: <span className={status === 'idle' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-yellow-600'}>{status === 'idle' ? '就绪' : status === 'syncing' ? '同步中...' : status === 'error' ? '错误' : '未配置'}</span></div>
            {lastSyncAt && <div>上次同步: {new Date(lastSyncAt).toLocaleString('zh-CN')}</div>}
            {error && <div className="text-red-500">{error}</div>}
          </div>
        </div>

        <div className="flex justify-between items-center p-4 border-t border-slate-200">
          <button
            onClick={handleTest}
            disabled={testing || !token || !owner || !repo}
            className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 disabled:text-slate-300"
          >
            {testing ? '测试中...' : '测试连接'}
          </button>
          <div className="flex gap-2">
            <button onClick={close} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">取消</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">保存</button>
          </div>
        </div>
      </div>
    </>
  );
}
