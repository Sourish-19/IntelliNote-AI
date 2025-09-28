
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { OutputDisplay } from './components/OutputDisplay';
import { HistoryPanel } from './components/HistoryPanel';
import { useTheme } from './hooks/useTheme';
import { useHistory } from './hooks/useHistory';
import { generateContentFromData } from './services/geminiService';
import type { HistoryItem, GeneratedContent, FileData } from './types';
import { LoadingSpinner } from './components/icons';

const App: React.FC = () => {
  const [theme, toggleTheme] = useTheme();
  const { history, addHistoryItem, removeHistoryItem, clearHistory } = useHistory();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOutput, setCurrentOutput] = useState<GeneratedContent | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  const handleGenerate = useCallback(async (fileData: FileData) => {
    setIsLoading(true);
    setError(null);
    setCurrentOutput(null);
    setSelectedHistoryId(null);

    try {
      const result = await generateContentFromData(fileData);
      if (result) {
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          prompt: fileData.name,
          content: result,
          timestamp: new Date().toISOString(),
        };
        addHistoryItem(newHistoryItem);
        setCurrentOutput(result);
        setSelectedHistoryId(newHistoryItem.id);
      } else {
        setError('Failed to generate content. The API returned an empty result.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [addHistoryItem]);

  const handleSelectHistory = useCallback((item: HistoryItem) => {
    setCurrentOutput(item.content);
    setSelectedHistoryId(item.id);
  }, []);

  const handleDeleteHistory = useCallback((id: string) => {
    removeHistoryItem(id);
    if (selectedHistoryId === id) {
      setCurrentOutput(null);
      setSelectedHistoryId(null);
    }
  }, [removeHistoryItem, selectedHistoryId]);

  return (
    <div className={`min-h-screen font-sans text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300`}>
      <div className="flex flex-col lg:flex-row">
        <HistoryPanel
          history={history}
          onSelect={handleSelectHistory}
          onDelete={handleDeleteHistory}
          onClear={clearHistory}
          selectedId={selectedHistoryId}
        />
        <main className="flex-1 flex flex-col h-screen">
          <Header theme={theme} toggleTheme={toggleTheme} />
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <FileUpload onGenerate={handleGenerate} disabled={isLoading} />
              {isLoading && (
                <div className="flex flex-col items-center justify-center mt-12 text-center">
                  <LoadingSpinner className="w-12 h-12 text-blue-500 animate-spin" />
                  <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300 animate-pulse">
                    Analyzing your content...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This may take a moment.</p>
                </div>
              )}
              {error && (
                <div className="mt-8 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg animate-fade-in">
                  <p className="font-bold">An Error Occurred</p>
                  <p>{error}</p>
                </div>
              )}
              {currentOutput && !isLoading && (
                <div className="mt-8 animate-fade-in">
                  <OutputDisplay content={currentOutput} />
                </div>
              )}
              {!isLoading && !error && !currentOutput && (
                 <div className="text-center mt-16 text-gray-500 dark:text-gray-400">
                    <h2 className="text-2xl font-semibold mb-2">Welcome to IntelliNote AI</h2>
                    <p>Upload a file or enter text to get started.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;