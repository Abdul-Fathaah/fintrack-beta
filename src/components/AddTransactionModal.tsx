import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { useTheme } from '../hooks/useTheme';
import { Transaction } from '../types';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Investment', 'Salary', 'Other'];

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: Transaction) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAdd }) => {
  const { isDarkMode: dm } = useTheme();
  const [amount, setAmount] = useState('');
  const [text, setText] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'investment'>('expense');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      setAmount(''); setText(''); setType('expense'); setCategory(CATEGORIES[0]);
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) return alert('Enter a valid amount.');
    if (!text.trim()) return alert('Enter a description.');
    onAdd({ id: crypto.randomUUID(), amount: val, text: text.trim(), type, category, date });
    onClose();
  };

  const inputCls = `w-full p-3 rounded-xl outline-none border transition-all ${
    dm ? 'bg-neutral-800 border-neutral-700 text-white focus:border-lime-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-lime-500'
  }`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Transaction">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div className="relative">
          <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg ${dm ? 'text-neutral-500' : 'text-gray-400'}`}>₹</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full text-3xl font-bold p-3 pl-10 rounded-2xl outline-none focus:ring-2 focus:ring-lime-500/40 transition-all bg-transparent ${dm ? 'text-white placeholder-neutral-700' : 'text-gray-900 placeholder-gray-300'}`}
            placeholder="0"
            autoFocus
          />
        </div>

        {/* Description */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={inputCls}
          placeholder="Description"
        />

        {/* Type selector */}
        <div className="grid grid-cols-3 gap-2">
          {(['expense', 'income', 'investment'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`p-3 rounded-xl text-sm font-medium capitalize transition-all border ${
                type === t
                  ? t === 'income' ? 'bg-lime-500 text-black border-lime-500'
                    : t === 'investment' ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-red-500 text-white border-red-500'
                  : dm
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputCls}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className={dm ? 'bg-neutral-800 text-white' : 'bg-white text-gray-900'}>{cat}</option>
          ))}
        </select>

        {/* Date */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputCls}
        />

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
