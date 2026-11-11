import { useState, useEffect, useCallback } from 'react';

const MEMORIES_KEY = 'rememberme_memories';
const DRAFT_KEY = 'rememberme_draft';

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function sortByDateDesc(memories) {
  return [...memories].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
}

export default function useMemories() {
  const [memories, setMemories] = useState(() =>
    sortByDateDesc(loadFromStorage(MEMORIES_KEY, []))
  );

  // Sync to localStorage whenever memories change
  useEffect(() => {
    saveToStorage(MEMORIES_KEY, memories);
  }, [memories]);

  const addMemory = useCallback((memory) => {
    const newMemory = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      title: memory.title || '',
      content: memory.content || '',
      category: memory.category || '',
      mood: memory.mood || '',
      image: memory.image || null,
      location: memory.location || '',
    };

    setMemories((prev) => sortByDateDesc([newMemory, ...prev]));
    return newMemory;
  }, []);

  const updateMemory = useCallback((id, updates) => {
    setMemories((prev) =>
      sortByDateDesc(
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      )
    );
  }, []);

  const deleteMemory = useCallback((id) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const deleteMemories = useCallback((ids) => {
    const idSet = new Set(ids);
    setMemories((prev) => prev.filter((m) => !idSet.has(m.id)));
  }, []);

  const renameMemory = useCallback((id, newTitle) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, title: newTitle } : m))
    );
  }, []);

  const getMemory = useCallback(
    (id) => memories.find((m) => m.id === id) || null,
    [memories]
  );

  const filterMemories = useCallback(
    ({ from, to, category } = {}) => {
      return memories.filter((m) => {
        if (from && new Date(m.timestamp) < new Date(from)) return false;
        if (to && new Date(m.timestamp) > new Date(to)) return false;
        if (category && m.category !== category) return false;
        return true;
      });
    },
    [memories]
  );

  const memoryCount = memories.length;

  // --- Draft management ---

  const saveDraft = useCallback((draft) => {
    saveToStorage(DRAFT_KEY, draft);
  }, []);

  const loadDraft = useCallback(() => {
    return loadFromStorage(DRAFT_KEY, null);
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  return {
    memories,
    addMemory,
    updateMemory,
    deleteMemory,
    deleteMemories,
    renameMemory,
    getMemory,
    filterMemories,
    memoryCount,
    saveDraft,
    loadDraft,
    clearDraft,
  };
}
