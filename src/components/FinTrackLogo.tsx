import React from 'react';
import { useTheme } from '../hooks/useTheme';

export const FinTrackLogo: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className="flex items-center gap-2 select-none">
      <svg
        className={`w-7 h-7 ${
          isDarkMode ? 'text-lime-400 drop-shadow-[0_0_5px_rgba(132,204,22,0.8)]' : 'text-lime-600'
        }`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 17l4-4-4-4" />
        <path d="M12 17l-4-4" />
        <circle cx="12" cy="13" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="16" cy="9" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="8" cy="9" r="1.5" fill="currentColor" stroke="none" />
      </svg>
      <h1 className={`text-xl font-bold tracking-tight font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        FIN<span className={isDarkMode ? 'text-lime-400' : 'text-lime-600'}>TRACK</span>
      </h1>
    </div>
  );
};
