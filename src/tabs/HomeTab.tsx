import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Receipt,
  PieChart,
  Trash2,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Plus,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Transaction } from '../types';

interface HomeTabProps {
  transactions: Transaction[];
  totalBalance: number;
  onDeleteTransaction: (id: string) => void;
  onAddClick: () => void;
}

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Investment', 'Salary', 'Other'];

export const HomeTab: React.FC<HomeTabProps> = ({
  transactions,
  totalBalance,
  onDeleteTransaction,
  onAddClick,
}) => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const currentMonthIncome = useMemo(
    () =>
      transactions
        .filter((t) => {
          const d = new Date(t.date);
          return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions, currentMonth, currentYear]
  );

  const currentMonthExpense = useMemo(
    () =>
      transactions
        .filter((t) => {
          const d = new Date(t.date);
          return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions, currentMonth, currentYear]
  );

  const currentMonthInvestment = useMemo(
    () =>
      transactions
        .filter((t) => {
          const d = new Date(t.date);
          return t.type === 'investment' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions, currentMonth, currentYear]
  );

  const usedCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => { if (t.category) set.add(t.category); });
    return ['All', ...CATEGORIES.filter((c) => set.has(c))];
  }, [transactions]);

  const filteredTransactions = useMemo(() =>
    transactions
      .slice()
      .reverse()
      .filter((t) => {
        const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch = !q ||
          t.text.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.amount.toString().includes(q);
        return matchesCat && matchesSearch;
      }),
    [transactions, selectedCategory, searchQuery]
  );

  const dm = isDarkMode;

  return (
    <div className="space-y-5 pb-10">

      {/* ── Balance Hero ── */}
      <div className={`relative rounded-3xl p-6 overflow-hidden border ${
        dm ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200 shadow-lg'
      }`}>
        <div className="absolute top-0 right-0 w-36 h-36 bg-lime-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          <span className={`text-[11px] font-mono tracking-widest uppercase font-semibold ${dm ? 'text-neutral-400' : 'text-gray-500'}`}>
            Net Balance
          </span>
        </div>

        <p className={`text-4xl font-extrabold tracking-tight mb-5 tabular-nums ${dm ? 'text-white' : 'text-gray-900'}`}>
          ₹ {totalBalance.toLocaleString('en-IN')}
        </p>

        {/* 3 mini stats */}
        <div className={`grid grid-cols-3 gap-2 pt-4 border-t text-xs ${dm ? 'border-neutral-800' : 'border-gray-100'}`}>
          <div className={`p-2.5 rounded-2xl border ${dm ? 'bg-neutral-950/60 border-neutral-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-1 text-lime-500 font-semibold mb-0.5">
              <ArrowUpRight size={14} /><span>Income</span>
            </div>
            <p className="font-bold font-mono text-[13px] tabular-nums">₹{currentMonthIncome.toLocaleString('en-IN')}</p>
          </div>

          <div className={`p-2.5 rounded-2xl border ${dm ? 'bg-neutral-950/60 border-neutral-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-1 text-red-400 font-semibold mb-0.5">
              <ArrowDownRight size={14} /><span>Spent</span>
            </div>
            <p className="font-bold font-mono text-[13px] tabular-nums">₹{currentMonthExpense.toLocaleString('en-IN')}</p>
          </div>

          <div className={`p-2.5 rounded-2xl border ${dm ? 'bg-neutral-950/60 border-neutral-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-1 text-blue-400 font-semibold mb-0.5">
              <TrendingUp size={14} /><span>Invested</span>
            </div>
            <p className="font-bold font-mono text-[13px] tabular-nums">₹{currentMonthInvestment.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* ── Transactions ── */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className={`font-bold text-lg ${dm ? 'text-white' : 'text-gray-900'}`}>Transactions</h2>
          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-lime-500 hover:bg-lime-400 text-black font-semibold rounded-full transition-all active:scale-95"
          >
            <Plus size={13} />Add
          </button>
        </div>

        {/* Search */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${
          dm ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <Search size={14} className="opacity-40" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full placeholder:opacity-50"
          />
        </div>

        {/* Category pills */}
        {usedCategories.length > 2 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {usedCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-lime-500 text-black font-semibold'
                    : dm
                    ? 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Transaction list */}
        <div className="space-y-2">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className={`group flex justify-between items-center p-3 rounded-2xl border transition-all ${
                dm
                  ? 'bg-neutral-900/70 hover:bg-neutral-900 border-neutral-800/80'
                  : 'bg-white hover:bg-gray-50 border-gray-200/80 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  tx.type === 'income' ? 'bg-lime-500/10 text-lime-400'
                  : tx.type === 'investment' ? 'bg-blue-500/10 text-blue-400'
                  : 'bg-red-500/10 text-red-400'
                }`}>
                  {tx.type === 'income' ? <ArrowUpRight size={16} />
                    : tx.type === 'investment' ? <PieChart size={16} />
                    : <Receipt size={16} />}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${dm ? 'text-white' : 'text-gray-900'}`}>{tx.text}</p>
                  <div className="flex items-center gap-2 text-[11px] opacity-50">
                    <span>{new Date(tx.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{tx.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`font-mono font-bold text-sm tabular-nums ${
                  tx.type === 'income' ? 'text-lime-400'
                  : tx.type === 'investment' ? 'text-blue-400'
                  : 'text-red-400'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => onDeleteTransaction(tx.id)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 p-1.5 rounded-lg transition-all"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className={`text-center py-12 rounded-2xl border border-dashed text-xs opacity-50 ${
              dm ? 'border-neutral-800' : 'border-gray-200'
            }`}>
              <Wallet size={28} className="mx-auto mb-2 opacity-40" />
              {transactions.length === 0 ? 'No transactions yet. Add one!' : 'No results for your search.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
