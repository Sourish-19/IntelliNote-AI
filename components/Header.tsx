
import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { LogoIcon } from './icons';
import type { Theme } from '../hooks/useTheme';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <LogoIcon className="w-8 h-8 text-blue-500" />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
          IntelliNote AI
        </h1>
      </div>
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
    </header>
  );
};
