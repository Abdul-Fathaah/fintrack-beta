import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  TrendingUp,
  Receipt,
  PieChart,
  ArrowRight,
  Sparkles,
  Trash2,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useTheme } from '../hooks/useTheme';
import { parseSmsTransaction } from '../utils/smsParser';
import { Transaction, Obligation } from '../types';

interface HomeTabProps {
  transactions: Transaction[];
  totalBalance: number;
  obligations: Obligation[];
  monthlySavingsTarget: number;
  onSmartAdd: (data: { amount: number | ''; text: string; type: 'income' | 'expense' | 'investment'; category?: string }) => void;
  onDeleteTransaction?: (id: string) => void;
  onOpenSimulate?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  transactions,
  totalBalance,
  obligations,
  monthlySavingsTarget,
  onSmartAdd,
  onDeleteTransaction,
  onOpenSimulate,
}) => {
  const { isDarkMode } = useTheme();
  const [smsInput, setSmsInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Safe-to-Spend Logic
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

  const recurringObligationsTotal = useMemo(
    () => obligations.filter((o) => o.isRecurring).reduce((sum, item) => sum + item.amount, 0),
    [obligations]
  );

  const totalCommitments = recurringObligationsTotal + (monthlySavingsTarget || 0);
  const safeToSpendTotal = Math.max(0, currentMonthIncome - totalCommitments);
  const remainingSafeBudget = safeToSpendTotal - currentMonthExpense;

  let budgetProgress = 0;
  if (safeToSpendTotal > 0) budgetProgress = (currentMonthExpense / safeToSpendTotal) * 100;
  else if (currentMonthExpense > 0) budgetProgress = 100;

  // SMS Parsing Logic
  const handleParse = () => {
    if (!smsInput.trim()) return;
    const parsed = parseSmsTransaction(smsInput);
    onSmartAdd(parsed);
    setSmsInput('');
  };

  // Filtered transactions
  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return ['All', ...Array.from(set)];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .slice()
      .reverse()
      .filter((t) => {
        const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
        const matchesQuery =
          !searchQuery.trim() ||
          t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.amount.toString().includes(searchQuery);
        return matchesCategory && matchesQuery;
      });
  }, [transactions, selectedCategory, searchQuery]);

  return (
    <div className="space-y-5 pb-28 animate-fade-in">
      {/* 1. Sleek Net Worth Hero Card */}
      <div
        className={`relative rounded-3xl p-6 overflow-hidden border transition-all duration-300 ${
          isDarkMode
            ? 'bg-neutral-900/90 border-neutral-800 shadow-xl shadow-lime-500/5'
            : 'bg-white border-gray-200/80 shadow-lg shadow-gray-200/50'
        }`}
      >
        {/* Subtle Ambient Blur */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-lime-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <span className={`text-[11px] font-mono tracking-widest uppercase font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
              Total Net Worth
            </span>
          </div>
          {onOpenSimulate && (
            <button
              onClick={onOpenSimulate}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${
                isDarkMode
                  ? 'bg-neutral-800/80 hover:bg-neutral-800 border-neutral-700 text-lime-400'
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-lime-700'
              }`}
              title="Test Transaction Auto-Detection"
            >
              <Sparkles size={12} className="text-lime-400" />
              <span>Simulate</span>
            </button>
          )}
        </div>

        <h1 className={`text-4xl font-extrabold tracking-tight mb-5 tabular-nums ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          ₹ {totalBalance.toLocaleString('en-IN')}
        </h1>

        {/* 3 Pill Mini Stats */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-dashed border-white/10 text-xs">
          <div className={`p-2.5 rounded-2xl border ${isDarkMode ? 'bg-neutral-950/60 border-neutral-800/80' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-1 text-lime-500 font-semibold mb-0.5">
              <ArrowUpRight size={14} />
              <span>Income</span>
            </div>
            <p className="font-bold font-mono text-[13px] tabular-nums">
              ₹{currentMonthIncome.toLocaleString('en-IN')}
            </p>
          </div>

          <div className={`p-2.5 rounded-2xl border ${isDarkMode ? 'bg-neutral-950/60 border-neutral-800/80' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-1 text-red-400 font-semibold mb-0.5">
              <ArrowDownRight size={14} />
              <span>Expenses</span>
            </div>
            <p className="font-bold font-mono text-[13px] tabular-nums">
              ₹{currentMonthExpense.toLocaleString('en-IN')}
            </p>
          </div>

          <div className={`p-2.5 rounded-2xl border ${isDarkMode ? 'bg-neutral-950/60 border-neutral-800/80' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-1 text-blue-400 font-semibold mb-0.5">
              <TrendingUp size={14} />
              <span>Invested</span>
            </div>
            <p className="font-bold font-mono text-[13px] tabular-nums">
              ₹{currentMonthInvestment.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Monthly Safe-to-Spend Allowance */}
      <Card>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className={`font-semibold text-base flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Safe to Spend
              <AlertCircle size={15} className={isDarkMode ? 'text-neutral-500' : 'text-gray-400'} />
            </h2>
            <p className="text-[11px] opacity-60">Income minus fixed commitments & savings target</p>
          </div>
          <div className={`text-right ${remainingSafeBudget < 0 ? 'text-red-500' : 'text-lime-400'}`}>
            <p className="text-xl font-extrabold tabular-nums">₹ {remainingSafeBudget.toLocaleString('en-IN')}</p>
            <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70">Remaining</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`h-2.5 w-full rounded-full mb-3 overflow-hidden ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-100'}`}>
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              remainingSafeBudget < 0 ? 'bg-red-500' : 'bg-lime-500'
            }`}
            style={{ width: `${Math.min(100, budgetProgress)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-neutral-950/80' : 'bg-gray-50'}`}>
            <span className="block opacity-60 text-[10px] uppercase font-medium mb-0.5">True Budget</span>
            <span className="font-mono font-bold">₹{safeToSpendTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-neutral-950/80' : 'bg-gray-50'}`}>
            <span className="block opacity-60 text-[10px] uppercase font-medium mb-0.5">Commitments</span>
            <span className="font-mono font-bold text-red-400">-₹{totalCommitments.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </Card>

      {/* 3. Quick SMS Paste Bar */}
      <div
        className={`p-3 rounded-2xl border flex items-center gap-2 ${
          isDarkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-gray-200'
        }`}
      >
        <input
          type="text"
          placeholder="Paste SMS here to auto-fill..."
          value={smsInput}
          onChange={(e) => setSmsInput(e.target.value)}
          className={`flex-1 p-2 bg-transparent text-xs outline-none font-mono ${
            isDarkMode ? 'text-white placeholder-neutral-600' : 'text-gray-900 placeholder-gray-400'
          }`}
        />
        <button
          onClick={handleParse}
          disabled={!smsInput.trim()}
          className="p-2 bg-lime-500 hover:bg-lime-400 disabled:opacity-30 text-black rounded-xl text-xs font-bold transition-all flex items-center gap-1"
        >
          <span>Parse</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* 4. Recent Activity & Transaction Logs */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Activity
          </h3>
          <span className="text-xs opacity-50 font-mono">
            {filteredTransactions.length} txn{filteredTransactions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-2">
          <div
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${
              isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <Search size={14} className="opacity-40" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full placeholder:opacity-50"
            />
          </div>
        </div>

        {/* Category Pill Filters */}
        {categories.length > 2 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-lime-500 text-black font-semibold'
                    : isDarkMode
                    ? 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Transaction Items */}
        <div className="space-y-2">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className={`group flex justify-between items-center p-3 rounded-2xl border transition-all ${
                isDarkMode
                  ? 'bg-neutral-900/70 hover:bg-neutral-900 border-neutral-800/80'
                  : 'bg-white hover:bg-gray-50 border-gray-200/80 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    tx.type === 'income'
                      ? 'bg-lime-500/10 text-lime-400'
                      : tx.type === 'investment'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <TrendingUp size={16} />
                  ) : tx.type === 'investment' ? (
                    <PieChart size={16} />
                  ) : (
                    <Receipt size={16} />
                  )}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {tx.text}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] opacity-50">
                    <span>{new Date(tx.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="font-medium">{tx.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`font-mono font-bold text-sm tabular-nums ${
                    tx.type === 'income'
                      ? 'text-lime-400'
                      : tx.type === 'investment'
                      ? 'text-blue-400'
                      : 'text-red-400'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                </span>

                {onDeleteTransaction && (
                  <button
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 p-1.5 rounded-lg transition-all"
                    title="Delete Transaction"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="text-center py-10 rounded-2xl border border-dashed border-white/10 opacity-50 text-xs">
              <Wallet size={28} className="mx-auto mb-2 opacity-40" />
              No transactions match your search or filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
