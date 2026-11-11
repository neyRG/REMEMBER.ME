import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'rememberme_memories';

/**
 * Hook para gestionar recuerdos (memories) con persistencia en localStorage.
 */
export function useMemories() {
  const [memories, setMemories] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  /* Persistir cada vez que cambie */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage:', e);
    }
  }, [memories]);

  const addMemory = useCallback((memory) => {
    const newMemory = {
      ...memory,
      id: crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(),
    };
    setMemories((prev) => [newMemory, ...prev]);
    return newMemory;
  }, []);

  const deleteMemory = useCallback((id) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMemory = useCallback((id, updates) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  return { memories, addMemory, deleteMemory, updateMemory };
}

export default useMemories;
