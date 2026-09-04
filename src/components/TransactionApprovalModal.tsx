import React, { useState, useEffect } from 'react';
import { Sparkles, Check, X, ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { DetectedTransaction } from '../services/aiParserService';

interface TransactionApprovalModalProps {
  transaction: DetectedTransaction | null;
  onAccept: (tx: DetectedTransaction) => void;
  onDismiss: () => void;
  categories: string[];
}

export const TransactionApprovalModal: React.FC<TransactionApprovalModalProps> = ({
  transaction,
  onAccept,
  onDismiss,
  categories,
}) => {
  const { isDarkMode } = useTheme();

  const [amount, setAmount] = useState<number>(0);
  const [text, setText] = useState<string>('');
  const [category, setCategory] = useState<string>('Other');
  const [type, setType] = useState<'income' | 'expense' | 'investment'>('expense');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount);
      setText(transaction.text);
      setCategory(transaction.category);
      setType(transaction.type);
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleConfirm = () => {
    onAccept({
      ...transaction,
      amount,
      text: text.trim() || transaction.text,
      category,
      type,
    });
  };

  const typeConfig = {
    expense: {
      color: 'text-red-400 bg-red-500/10 border-red-500/20',
      icon: <ArrowDownRight size={16} className="text-red-400" />,
      label: 'Expense',
    },
    income: {
      color: 'text-lime-400 bg-lime-500/10 border-lime-500/20',
      icon: <ArrowUpRight size={16} className="text-lime-400" />,
      label: 'Income',
    },
    investment: {
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      icon: <TrendingUp size={16} className="text-blue-400" />,
      label: 'Investment',
    },
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-md rounded-3xl p-6 relative overflow-hidden border shadow-2xl transition-all ${
          isDarkMode
            ? 'bg-neutral-900/95 border-neutral-800 text-white shadow-lime-500/5'
            : 'bg-white/95 border-gray-200 text-gray-900 shadow-xl'
        }`}
      >
        {/* Glow Accent in Header */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-400 text-xs font-semibold">
            <Sparkles size={14} className="text-lime-400 animate-pulse" />
            <span>New Transaction Detected</span>
          </div>
          <button
            onClick={onDismiss}
            className={`p-1.5 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
            title="Dismiss"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Amount Card */}
        <div className="text-center my-6">
          <p className="text-xs uppercase tracking-widest font-mono opacity-60 mb-1">
            {transaction.source || 'Bank Alert'}
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-bold opacity-70">₹</span>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="text-4xl font-extrabold bg-transparent text-center outline-none w-48 tabular-nums focus:ring-1 focus:ring-lime-500 rounded-lg"
            />
          </div>
        </div>

        {/* Details Form */}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-medium opacity-60 uppercase block mb-1">
              Description / Merchant
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-sm font-medium border outline-none transition-colors ${
                isDarkMode
                  ? 'bg-neutral-950 border-neutral-800 focus:border-lime-500/50 text-white'
                  : 'bg-gray-50 border-gray-200 focus:border-lime-500 text-gray-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium opacity-60 uppercase block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full p-2.5 rounded-xl text-sm border outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-neutral-950 border-neutral-800 text-white focus:border-lime-500/50'
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-lime-500'
                }`}
              >
                {categories.map((c) => (
                  <option key={c} value={c} className={isDarkMode ? 'bg-neutral-900' : 'bg-white'}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium opacity-60 uppercase block mb-1">Type</label>
              <div
                className={`flex items-center gap-1.5 p-2 rounded-xl border ${typeConfig.color} text-xs font-semibold`}
              >
                {typeConfig.icon}
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="bg-transparent outline-none w-full cursor-pointer"
                >
                  <option value="expense" className={isDarkMode ? 'bg-neutral-900 text-white' : 'bg-white text-black'}>
                    Expense
                  </option>
                  <option value="income" className={isDarkMode ? 'bg-neutral-900 text-white' : 'bg-white text-black'}>
                    Income
                  </option>
                  <option value="investment" className={isDarkMode ? 'bg-neutral-900 text-white' : 'bg-white text-black'}>
                    Investment
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Raw SMS Snippet */}
          {transaction.rawText && (
            <div
              className={`p-2.5 rounded-xl text-[11px] border font-mono opacity-70 line-clamp-2 ${
                isDarkMode ? 'bg-neutral-950 border-neutral-800/80 text-neutral-400' : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              "{transaction.rawText}"
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onDismiss}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
              isDarkMode
                ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white'
                : 'border-gray-200 hover:bg-gray-100 text-gray-600'
            }`}
          >
            Ignore
          </button>
          <button
            onClick={handleConfirm}
            className="flex-[2] py-3 px-4 rounded-xl text-sm font-bold bg-lime-500 hover:bg-lime-400 text-black shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Check size={18} /> Accept & Add
          </button>
        </div>
      </div>
    </div>
  );
};
