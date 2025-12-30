// Typed localStorage helpers with versioned root key
const STORAGE_KEY = 'algosort.user.v1';

export interface UserStore {
  quizStats: Record<string, QuizStat>;
  notes: Record<string, NotesEntry>;
}

export interface QuizStat {
  bestPercent: number;
  lastPercent: number;
  attempts: number;
  lastAttemptAt: string;
}

export interface NotesEntry {
  content: string;
  lastSavedAt: string;
}

function getStore(): UserStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { quizStats: {}, notes: {} };
    const parsed = JSON.parse(raw);
    return {
      quizStats: parsed.quizStats || {},
      notes: parsed.notes || {},
    };
  } catch {
    return { quizStats: {}, notes: {} };
  }
}

function saveStore(store: UserStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// Quiz Stats
export function getQuizStat(topicSlug: string): QuizStat | null {
  const store = getStore();
  return store.quizStats[topicSlug] || null;
}

export function saveQuizStat(topicSlug: string, stat: QuizStat): void {
  const store = getStore();
  store.quizStats[topicSlug] = stat;
  saveStore(store);
}

// Notes
export function getNotes(topicSlug: string): NotesEntry | null {
  const store = getStore();
  return store.notes[topicSlug] || null;
}

export function saveNotes(topicSlug: string, content: string): void {
  const store = getStore();
  store.notes[topicSlug] = {
    content,
    lastSavedAt: new Date().toISOString(),
  };
  saveStore(store);
}

export function clearNotes(topicSlug: string): void {
  const store = getStore();
  delete store.notes[topicSlug];
  saveStore(store);
}

// Generic JSON helpers
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to write to localStorage', e);
  }
}
