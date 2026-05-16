import { useCallback, useState } from 'react';

const KEY = 'xact-toolbar-prefs-v1';
const MAX_PINNED = 30;
const MAX_RECENT = 12;

const DEFAULT_PREFS = {
  pinned: ['spr_pendant', 'det_smoke', 'alarm_mcp', 'alarm_sounder', 'ext_co2', 'hose_reel', 'hydrant', 'egress_exit'],
  recent: [],
};

function loadPrefs() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      pinned: Array.isArray(parsed.pinned) ? parsed.pinned.slice(0, MAX_PINNED) : DEFAULT_PREFS.pinned,
      recent: Array.isArray(parsed.recent) ? parsed.recent.slice(0, MAX_RECENT) : [],
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function persist(prefs) {
  try { window.localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* quota or private mode — ignore */ }
}

/**
 * Per-user customisable toolbar preferences. Stores pinned symbol IDs (in
 * user-chosen order) and a most-recent stack. Persisted to localStorage.
 */
export default function useToolbarPrefs() {
  // Read localStorage during the initialiser so we never write state from
  // an effect (which React 19's lint specifically forbids). This is a SPA —
  // no SSR hydration concern.
  const [prefs, setPrefs] = useState(loadPrefs);

  const togglePin = useCallback((id) => {
    setPrefs((p) => {
      const next = p.pinned.includes(id)
        ? { ...p, pinned: p.pinned.filter((x) => x !== id) }
        : { ...p, pinned: [...p.pinned, id].slice(0, MAX_PINNED) };
      persist(next);
      return next;
    });
  }, []);

  const movePin = useCallback((id, direction) => {
    setPrefs((p) => {
      const idx = p.pinned.indexOf(id);
      if (idx < 0) return p;
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= p.pinned.length) return p;
      const list = [...p.pinned];
      [list[idx], list[target]] = [list[target], list[idx]];
      const next = { ...p, pinned: list };
      persist(next);
      return next;
    });
  }, []);

  const recordUse = useCallback((id) => {
    setPrefs((p) => {
      const next = { ...p, recent: [id, ...p.recent.filter((x) => x !== id)].slice(0, MAX_RECENT) };
      persist(next);
      return next;
    });
  }, []);

  const resetDefaults = useCallback(() => {
    persist(DEFAULT_PREFS);
    setPrefs(DEFAULT_PREFS);
  }, []);

  return { prefs, togglePin, movePin, recordUse, resetDefaults };
}
