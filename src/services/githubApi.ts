/**
 * GitHub Contents API wrapper for syncing notes.
 * Uses fine-grained PAT for authentication.
 */

const API_BASE = 'https://api.github.com';

interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

function getConfig(): GitHubConfig | null {
  const raw = localStorage.getItem('ffd400eel_github_config');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveConfig(config: GitHubConfig) {
  localStorage.setItem('ffd400eel_github_config', JSON.stringify(config));
}

export function getSyncConfig(): GitHubConfig | null {
  return getConfig();
}

export function isConfigured(): boolean {
  const c = getConfig();
  return !!(c && c.token && c.owner && c.repo);
}

async function apiRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const config = getConfig();
  if (!config) throw new Error('GitHub not configured');

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...((options.headers as Record<string, string>) || {}),
  };

  return fetch(url, { ...options, headers });
}

/**
 * Get file content from GitHub repo.
 * Returns { content, sha } where content is the decoded file content.
 */
export async function getFile(
  filePath: string
): Promise<{ content: string; sha: string } | null> {
  const config = getConfig();
  if (!config) throw new Error('Not configured');

  const url = `/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`;

  const resp = await apiRequest(url);
  if (resp.status === 404) return null;
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`GitHub API error: ${resp.status} ${err.message || ''}`);
  }

  const data = await resp.json();
  const content = atob(data.content.replace(/\n/g, ''));
  return { content, sha: data.sha };
}

/**
 * Create or update a file in the GitHub repo.
 */
export async function putFile(
  filePath: string,
  content: string,
  sha: string | null,
  message: string
): Promise<{ sha: string }> {
  const config = getConfig();
  if (!config) throw new Error('Not configured');

  const url = `/repos/${config.owner}/${config.repo}/contents/${filePath}`;

  const body: Record<string, string> = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: config.branch,
  };
  if (sha) body.sha = sha;

  const resp = await apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    if (resp.status === 409) {
      throw new Error('Conflict: file has been modified on another device. Pull first.');
    }
    const err = await resp.json().catch(() => ({}));
    throw new Error(`GitHub API error: ${resp.status} ${err.message || ''}`);
  }

  const data = await resp.json();
  return { sha: data.content.sha };
}

/**
 * Sync notes: pull remote, merge with local, push back.
 */
export async function syncNotes(
  localNotesJson: string,
  deviceName: string
): Promise<{
  merged: string;
  status: 'up-to-date' | 'pushed' | 'merged';
}> {
  const remote = await getFile('data/notes.json');

  if (!remote) {
    // No remote file yet, create it
    await putFile('data/notes.json', localNotesJson, null, `Initial notes sync from ${deviceName}`);
    return { merged: localNotesJson, status: 'pushed' };
  }

  // Remote exists - check if local is different
  if (localNotesJson === remote.content) {
    return { merged: localNotesJson, status: 'up-to-date' };
  }

  // Merge: keep the union of notes, preferring newer versions
  try {
    const localNotes = JSON.parse(localNotesJson);
    const remoteNotes = JSON.parse(remote.content);

    const merged = mergeNotes(localNotes, remoteNotes);
    const mergedJson = JSON.stringify(merged, null, 2);

    await putFile(
      'data/notes.json',
      mergedJson,
      remote.sha,
      `Sync notes from ${deviceName}`
    );

    return { merged: mergedJson, status: 'merged' };
  } catch {
    // If merge fails, push local as new version
    await putFile('data/notes.json', localNotesJson, remote.sha, `Sync notes from ${deviceName}`);
    return { merged: localNotesJson, status: 'pushed' };
  }
}

function mergeNotes(local: any[], remote: any[]): any[] {
  const map = new Map<string, any>();

  // Add remote notes first
  for (const note of remote) {
    if (note.id) map.set(note.id, note);
  }

  // Add/overwrite with local notes (local takes priority for same ID)
  for (const note of local) {
    if (!note.id) continue;
    const existing = map.get(note.id);
    if (!existing || new Date(note.updatedAt) >= new Date(existing.updatedAt)) {
      map.set(note.id, note);
    }
  }

  return Array.from(map.values());
}

/**
 * Test the GitHub connection.
 */
export async function testConnection(): Promise<{ ok: boolean; user?: string; error?: string }> {
  try {
    const resp = await apiRequest('/user');
    if (!resp.ok) {
      return { ok: false, error: `HTTP ${resp.status}` };
    }
    const user = await resp.json();
    return { ok: true, user: user.login };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
