import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { useTheme } from '../hooks/useTheme';
import { Transaction } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: Transaction) => void;
  categories: string[];
  initialData: { amount: number | ''; text: string; type: 'income' | 'expense' | 'investment'; category?: string } | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categories,
  initialData,
}) => {
  const { isDarkMode } = useTheme();
  const [amount, setAmount] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense' | 'investment'>('expense');

  // Synchronize state when initialData or modal open status changes
  useEffect(() => {
    if (isOpen) {
      setAmount(initialData?.amount?.toString() || '');
      setText(initialData?.text || '');
      setType(initialData?.type || 'expense');
    }
  }, [isOpen, initialData]);

  const category = initialData?.category || categories[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    if (!text.trim()) {
      alert('Please enter a description.');
      return;
    }
    onAdd({
      id: crypto.randomUUID(),
      amount: val,
      text,
      type,
      category,
      date: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Transaction">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className={`text-xs font-medium ml-1 mb-1 block ${
              isDarkMode ? 'text-neutral-400' : 'text-gray-500'
            }`}
          >
            Amount
          </label>
          <div className="relative">
            <span
              className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${
                isDarkMode ? 'text-neutral-500' : 'text-gray-400'
              }`}
            >
              ₹
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full bg-transparent text-3xl font-bold p-3 pl-10 rounded-2xl outline-none focus:ring-2 focus:ring-lime-500/50 transition-all ${
                isDarkMode
                  ? 'text-white placeholder-neutral-700'
                  : 'text-gray-900 placeholder-gray-300'
              }`}
              placeholder="0"
              autoFocus
            />
          </div>
        </div>
        <div>
          <label
            className={`text-xs font-medium ml-1 mb-1 block ${
              isDarkMode ? 'text-neutral-400' : 'text-gray-500'
            }`}
          >
            Description
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`w-full p-4 rounded-xl outline-none border transition-all ${
              isDarkMode
                ? 'bg-neutral-800 border-neutral-700 text-white focus:border-lime-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-lime-500'
            }`}
            placeholder="What is this for?"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['expense', 'income', 'investment'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`p-3 rounded-xl text-sm font-medium capitalize transition-all border ${
                type === t
                  ? t === 'income'
                    ? 'bg-lime-500 text-white border-lime-500'
                    : t === 'investment'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-red-500 text-white border-red-500'
                  : isDarkMode
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          type="submit"
          className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold py-4 rounded-xl transition-all active:scale-[0.98]"
        >
          Add Transaction
        </button>
      </form>
    </Modal>
  );
};
