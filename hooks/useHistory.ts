
import { useState, useEffect, useCallback } from 'react';
import type { HistoryItem } from '../types';

const HISTORY_STORAGE_KEY = 'intellinote-ai-history';

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      setHistory([]);
    }
  }, []);

  const saveHistory = useCallback((newHistory: HistoryItem[]) => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, []);

  const addHistoryItem = useCallback((item: HistoryItem) => {
    setHistory(prevHistory => {
      const newHistory = [item, ...prevHistory];
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  const removeHistoryItem = useCallback((id: string) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.id !== id);
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, [saveHistory]);

  return { history, addHistoryItem, removeHistoryItem, clearHistory };
};
