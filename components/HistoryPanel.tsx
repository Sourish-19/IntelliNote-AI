
import React, { useState } from 'react';
import type { HistoryItem } from '../types';
import { TimeIcon, TrashIcon, MenuIcon, CloseIcon, ChatHistoryIcon } from './icons';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  selectedId: string | null;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onDelete, onClear, selectedId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };
  
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };
  
  const historyContent = (
    <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
                <ChatHistoryIcon className="w-6 h-6"/>
                History
            </h2>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>

        {history.length > 0 ? (
            <>
                <div className="flex-1 overflow-y-auto">
                    {history.map(item => (
                        <div
                            key={item.id}
                            onClick={() => { onSelect(item); setIsOpen(false); }}
                            className={`p-3 m-2 rounded-lg cursor-pointer group transition-colors duration-200 ${
                                selectedId === item.id 
                                ? 'bg-blue-100 dark:bg-blue-900/50' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            <p className="font-semibold text-sm truncate text-gray-800 dark:text-gray-100">{item.prompt}</p>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <TimeIcon className="w-3 h-3" />
                                    {formatTimestamp(item.timestamp)}
                                </span>
                                <button
                                    onClick={(e) => handleDelete(e, item.id)}
                                    className="p-1 rounded-full text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 transition-opacity"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={onClear} className="w-full text-center text-sm font-semibold text-red-600 dark:text-red-400 hover:underline">
                        Clear All History
                    </button>
                </div>
            </>
        ) : (
            <div className="flex-1 flex items-center justify-center text-center text-gray-500 dark:text-gray-400 p-4">
                <p>Your generation history will appear here.</p>
            </div>
        )}
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg"
      >
        <MenuIcon className="w-6 h-6"/>
      </button>

      {/* Mobile Overlay */}
      {isOpen && <div onClick={() => setIsOpen(false)} className="lg:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"></div>}

      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 bottom-0 w-72 lg:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {historyContent}
      </aside>
    </>
  );
};
