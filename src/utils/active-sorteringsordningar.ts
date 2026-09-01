// "Aktiv" is a local, personal marker (not a backend concept) — several
// sorteringsordningar can be active at the same time, and the marker is
// only saved in the browser via localStorage.
const ACTIVE_IDS_STORAGE_KEY = "sorteringsordningar-aktiva-ids";

export function loadActiveSorteringsordningIds(): Set<string> {
  try {
    const raw = localStorage.getItem(ACTIVE_IDS_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function saveActiveSorteringsordningIds(ids: Set<string>): void {
  try {
    localStorage.setItem(ACTIVE_IDS_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage may be unavailable (e.g. private browsing) — nothing to do about it.
  }
}
