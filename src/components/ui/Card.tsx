import React from 'react';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  const { isDarkMode } = useTheme();
  return (
    <div
      className={`${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200 shadow-sm'
      } rounded-2xl border p-4 transition-colors duration-300 ${className}`}
    >
      {children}
    </div>
  );
};
