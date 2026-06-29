import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className={`w-full max-w-md rounded-3xl p-6 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white text-gray-900'
        } border shadow-2xl animate-slide-up`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${
              isDarkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
