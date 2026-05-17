import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ClaudeAnalysis, AppState, HistoryItem, ToastItem } from '../types';

interface ResumeContextType {
  appState: AppState;
  analysis: ClaudeAnalysis | null;
  fileName: string;
  fileSize: number;
  extractedText: string;
  charCount: number;
  analyzedAt: string;
  errorMessage: string;
  apiKey: string;
  history: HistoryItem[];
  darkMode: boolean;
  toasts: ToastItem[];
  setAppState: (s: AppState) => void;
  setAnalysis: (a: ClaudeAnalysis) => void;
  setFileInfo: (name: string, size: number, text: string) => void;
  setAnalyzedAt: (t: string) => void;
  setError: (msg: string) => void;
  setApiKey: (k: string) => void;
  addHistory: (item: HistoryItem) => void;
  toggleDarkMode: () => void;
  addToast: (msg: string, type?: ToastItem['type']) => void;
  removeToast: (id: string) => void;
  reset: () => void;
}

const Ctx = createContext<ResumeContextType | null>(null);

const loadHistory = (): HistoryItem[] => {
  try { return JSON.parse(localStorage.getItem('resume_history') || '[]'); } catch { return []; }
};

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState>('upload');
  const [analysis, setAnalysisState] = useState<ClaudeAnalysis | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [analyzedAt, setAnalyzedAt] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem('claude_api_key') || '');
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dark_mode') === 'true');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const setAnalysis = useCallback((a: ClaudeAnalysis) => setAnalysisState(a), []);
  const setFileInfo = useCallback((name: string, size: number, text: string) => {
    setFileName(name); setFileSize(size); setExtractedText(text); setCharCount(text.length);
  }, []);
  const setError = useCallback((msg: string) => setErrorMessage(msg), []);
  const setApiKey = useCallback((k: string) => {
    setApiKeyState(k); localStorage.setItem('claude_api_key', k);
  }, []);
  const addHistory = useCallback((item: HistoryItem) => {
    setHistory(prev => {
      const next = [item, ...prev].slice(0, 5);
      localStorage.setItem('resume_history', JSON.stringify(next));
      return next;
    });
  }, []);
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => { localStorage.setItem('dark_mode', String(!prev)); return !prev; });
  }, []);
  const addToast = useCallback((msg: string, type: ToastItem['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message: msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);
  const removeToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  const reset = useCallback(() => {
    setAppState('upload'); setAnalysisState(null); setFileName('');
    setFileSize(0); setExtractedText(''); setCharCount(0);
    setAnalyzedAt(''); setErrorMessage('');
  }, []);

  return (
    <Ctx.Provider value={{
      appState, analysis, fileName, fileSize, extractedText, charCount,
      analyzedAt, errorMessage, apiKey, history, darkMode, toasts,
      setAppState, setAnalysis, setFileInfo, setAnalyzedAt, setError,
      setApiKey, addHistory, toggleDarkMode, addToast, removeToast, reset,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useResume() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useResume must be inside ResumeProvider');
  return ctx;
}
