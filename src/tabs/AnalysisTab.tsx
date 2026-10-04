import React, { useState, useEffect, useMemo } from 'react';
import {
  Receipt,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Edit,
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  TrendingDown,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Transaction } from '../types';

interface AnalysisTabProps {
  transactions: Transaction[];
}

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Investment', 'Salary', 'Other'];

interface FixedExpense {
  id: string;
  category: string;
  amount: number;
  description: string;
  dayOfMonth: number; // 1-31
  isActive: boolean;
}

const FIXED_EXPENSES_KEY = 'ft_fixed_expenses_v1';

const DEFAULT_FIXED_EXPENSES: FixedExpense[] = [
  { id: 'rent', category: 'Bills', amount: 15000, description: 'House Rent', dayOfMonth: 1, isActive: true },
  { id: 'electricity', category: 'Bills', amount: 2000, description: 'Electricity Bill', dayOfMonth: 5, isActive: true },
  { id: 'water', category: 'Bills', amount: 500, description: 'Water Bill', dayOfMonth: 7, isActive: true },
  { id: 'internet', category: 'Bills', amount: 1000, description: 'Internet Bill', dayOfMonth: 10, isActive: true },
  { id: 'groceries', category: 'Food', amount: 8000, description: 'Monthly Groceries', dayOfMonth: 1, isActive: true },
];

export const AnalysisTab: React.FC<AnalysisTabProps> = ({ transactions }) => {
  const { isDarkMode } = useTheme();

  // Load / Persist fixed expenses in localStorage
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => {
    try {
      const saved = localStorage.getItem(FIXED_EXPENSES_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_FIXED_EXPENSES;
    } catch {
      return DEFAULT_FIXED_EXPENSES;
    }
  });

  useEffect(() => {
    localStorage.setItem(FIXED_EXPENSES_KEY, JSON.stringify(fixedExpenses));
  }, [fixedExpenses]);

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [showAddFixedExpense, setShowAddFixedExpense] = useState(false);
  const [newFixedExpense, setNewFixedExpense] = useState<Omit<FixedExpense, 'id' | 'isActive'>>({
    category: 'Bills',
    amount: 0,
    description: '',
    dayOfMonth: 1,
  });

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Current month actual income/expenses/investments
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

  // Active fixed monthly commitments
  const totalFixedExpenses = useMemo(
    () =>
      fixedExpenses
        .filter((e) => e.isActive)
        .reduce((sum, e) => sum + e.amount, 0),
    [fixedExpenses]
  );

  // Net savings and rate
  const netSavings = useMemo(
    () => currentMonthIncome - currentMonthExpense - currentMonthInvestment - totalFixedExpenses,
    [currentMonthIncome, currentMonthExpense, currentMonthInvestment, totalFixedExpenses]
  );

  const savingsRate = useMemo(
    () => (currentMonthIncome > 0 ? (netSavings / currentMonthIncome) * 100 : 0),
    [currentMonthIncome, netSavings]
  );

  // Monthly Expense Category Breakdown
  const categoryBreakdown = useMemo(() => {
    const catMap: Record<string, number> = {};
    transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .forEach((t) => {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      });

    return Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  }, [transactions, currentMonth, currentYear]);

  // Actions for Fixed Expenses
  const handleAddFixedExpense = () => {
    if (!newFixedExpense.description || newFixedExpense.amount <= 0) {
      alert('Please fill in a valid description and amount.');
      return;
    }

    const newExpense: FixedExpense = {
      id: crypto.randomUUID(),
      category: newFixedExpense.category,
      amount: newFixedExpense.amount,
      description: newFixedExpense.description,
      dayOfMonth: newFixedExpense.dayOfMonth,
      isActive: true,
    };

    setFixedExpenses((prev) => [...prev, newExpense]);
    setShowAddFixedExpense(false);
    setNewFixedExpense({
      category: 'Bills',
      amount: 0,
      description: '',
      dayOfMonth: 1,
    });
  };

  const handleUpdateFixedExpense = (id: string, updated: Omit<FixedExpense, 'id'>) => {
    setFixedExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    setEditingExpenseId(null);
  };

  const handleDeleteFixedExpense = (id: string) => {
    setFixedExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleFixedExpense = (id: string) => {
    setFixedExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive: !item.isActive } : item))
    );
  };

  const dm = isDarkMode;

  return (
    <div className="space-y-6 pb-12">
      {/* ── Monthly Overview Header ── */}
      <div
        className={`relative rounded-3xl p-6 overflow-hidden border ${
          dm ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200 shadow-sm'
        }`}
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-lime-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          <span className={`text-[11px] font-mono tracking-widest uppercase font-semibold ${dm ? 'text-neutral-400' : 'text-gray-500'}`}>
            Monthly Analysis • {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Income */}
          <div className={`p-4 rounded-2xl border ${dm ? 'bg-neutral-950/60 border-neutral-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-1.5 mb-1 text-lime-400">
              <ArrowUpRight size={15} />
              <span className={`text-[11px] font-mono uppercase tracking-wider ${dm ? 'text-neutral-400' : 'text-gray-500'}`}>Income</span>
            </div>
            <p className={`font-bold text-xl tabular-nums ${dm ? 'text-white' : 'text-gray-900'}`}>
              ₹{currentMonthIncome.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Actual Expenses */}
          <div className={`p-4 rounded-2xl border ${dm ? 'bg-neutral-950/60 border-neutral-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-1.5 mb-1 text-red-400">
              <ArrowDownRight size={15} />
              <span className={`text-[11px] font-mono uppercase tracking-wider ${dm ? 'text-neutral-400' : 'text-gray-500'}`}>Variable</span>
            </div>
            <p className={`font-bold text-xl tabular-nums ${dm ? 'text-white' : 'text-gray-900'}`}>
              ₹{currentMonthExpense.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Fixed Commitments */}
          <div className={`p-4 rounded-2xl border ${dm ? 'bg-neutral-950/60 border-neutral-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-1.5 mb-1 text-blue-400">
              <Calendar size={15} />
              <span className={`text-[11px] font-mono uppercase tracking-wider ${dm ? 'text-neutral-400' : 'text-gray-500'}`}>Fixed Bills</span>
            </div>
            <p className={`font-bold text-xl tabular-nums ${dm ? 'text-white' : 'text-gray-900'}`}>
              ₹{totalFixedExpenses.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Net Projected Savings */}
          <div
            className={`p-4 rounded-2xl border ${
              dm ? 'bg-neutral-950/60 border-neutral-800' : 'bg-gray-50 border-gray-200'
            } ${netSavings >= 0 ? 'border-lime-500/20' : 'border-red-500/20'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-purple-400">
              <PieChart size={15} />
              <span className={`text-[11px] font-mono uppercase tracking-wider ${dm ? 'text-neutral-400' : 'text-gray-500'}`}>Net Savings</span>
            </div>
            <p className={`font-bold text-xl tabular-nums ${netSavings >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
              ₹{netSavings.toLocaleString('en-IN')}
            </p>
            <p className={`text-[10px] mt-0.5 ${dm ? 'text-neutral-500' : 'text-gray-400'}`}>
              {savingsRate.toFixed(1)}% of income
            </p>
          </div>
        </div>
      </div>

      {/* ── Category Breakdown ── */}
      <div className={`rounded-3xl p-5 border ${dm ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200 shadow-sm'}`}>
        <h2 className={`font-bold text-base mb-4 flex items-center gap-2 ${dm ? 'text-white' : 'text-gray-900'}`}>
          <Receipt size={16} className="text-lime-400" />
          Spending by Category (This Month)
        </h2>

        {categoryBreakdown.length === 0 ? (
          <p className={`text-xs text-center py-6 ${dm ? 'text-neutral-500' : 'text-gray-400'}`}>
            No expenses recorded yet for this month.
          </p>
        ) : (
          <div className="space-y-3">
            {categoryBreakdown.map(([cat, amount]) => {
              const pct = currentMonthExpense > 0 ? (amount / currentMonthExpense) * 100 : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-medium ${dm ? 'text-neutral-300' : 'text-gray-700'}`}>{cat}</span>
                    <span className={`font-mono font-semibold tabular-nums ${dm ? 'text-neutral-200' : 'text-gray-900'}`}>
                      ₹{amount.toLocaleString('en-IN')}{' '}
                      <span className={`text-[11px] font-normal ${dm ? 'text-neutral-500' : 'text-gray-400'}`}>
                        ({pct.toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${dm ? 'bg-neutral-800' : 'bg-gray-100'}`}>
                    <div
                      className="h-full bg-lime-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Fixed Expenses Management ── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className={`font-bold text-base ${dm ? 'text-white' : 'text-gray-900'}`}>
              Fixed Monthly Commitments
            </h2>
            <p className={`text-xs ${dm ? 'text-neutral-500' : 'text-gray-400'}`}>
              Track recurring bills and liabilities
            </p>
          </div>
          <button
            onClick={() => setShowAddFixedExpense(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-lime-500 hover:bg-lime-400 text-black font-semibold rounded-full transition-all active:scale-95"
          >
            <Plus size={13} />
            Add Fixed Bill
          </button>
        </div>

        {/* Add Fixed Expense Modal / In-line Form */}
        {showAddFixedExpense && (
          <div className={`rounded-2xl border p-4 ${dm ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200 shadow-sm'}`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddFixedExpense();
              }}
              className="space-y-3"
            >
              <div>
                <label className={`block text-xs font-medium mb-1 ${dm ? 'text-neutral-400' : 'text-gray-500'}`}>
                  Description
                </label>
                <input
                  type="text"
                  value={newFixedExpense.description}
                  onChange={(e) => setNewFixedExpense((p) => ({ ...p, description: e.target.value }))}
                  className={`w-full p-2.5 rounded-xl outline-none text-xs border ${
                    dm ? 'bg-neutral-800 border-neutral-700 text-white focus:border-lime-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-lime-500'
                  }`}
                  placeholder="e.g. Rent, Internet, Gym"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${dm ? 'text-neutral-400' : 'text-gray-500'}`}>
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={newFixedExpense.amount || ''}
                    onChange={(e) => setNewFixedExpense((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                    className={`w-full p-2.5 rounded-xl outline-none text-xs border ${
                      dm ? 'bg-neutral-800 border-neutral-700 text-white focus:border-lime-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-lime-500'
                    }`}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${dm ? 'text-neutral-400' : 'text-gray-500'}`}>
                    Category
                  </label>
                  <select
                    value={newFixedExpense.category}
                    onChange={(e) => setNewFixedExpense((p) => ({ ...p, category: e.target.value }))}
                    className={`w-full p-2.5 rounded-xl outline-none text-xs border ${
                      dm ? 'bg-neutral-800 border-neutral-700 text-white focus:border-lime-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-lime-500'
                    }`}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${dm ? 'text-neutral-400' : 'text-gray-500'}`}>
                    Due Day (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newFixedExpense.dayOfMonth}
                    onChange={(e) => setNewFixedExpense((p) => ({ ...p, dayOfMonth: Math.max(1, Math.min(31, parseInt(e.target.value) || 1)) }))}
                    className={`w-full p-2.5 rounded-xl outline-none text-xs border ${
                      dm ? 'bg-neutral-800 border-neutral-700 text-white focus:border-lime-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-lime-500'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddFixedExpense(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs border ${
                    dm ? 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700' : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-lime-500 hover:bg-lime-400 text-black active:scale-95"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Fixed Expenses List */}
        <div className="space-y-2">
          {fixedExpenses.map((expense) => (
            <div
              key={expense.id}
              className={`p-3 rounded-2xl border transition-all ${
                dm ? 'bg-neutral-900/70 border-neutral-800/80 hover:bg-neutral-900' : 'bg-white border-gray-200 shadow-sm hover:bg-gray-50'
              }`}
            >
              {editingExpenseId === expense.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateFixedExpense(expense.id, {
                      category: expense.category,
                      amount: expense.amount,
                      description: expense.description,
                      dayOfMonth: expense.dayOfMonth,
                      isActive: expense.isActive,
                    });
                  }}
                  className="space-y-2"
                >
                  <input
                    type="text"
                    value={expense.description}
                    onChange={(e) =>
                      setFixedExpenses((prev) =>
                        prev.map((i) => (i.id === expense.id ? { ...i, description: e.target.value } : i))
                      )
                    }
                    className={`w-full p-2 rounded-xl text-xs border ${
                      dm ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={expense.amount}
                      onChange={(e) =>
                        setFixedExpenses((prev) =>
                          prev.map((i) => (i.id === expense.id ? { ...i, amount: parseFloat(e.target.value) || 0 } : i))
                        )
                      }
                      className={`w-full p-2 rounded-xl text-xs border ${
                        dm ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    />
                    <select
                      value={expense.category}
                      onChange={(e) =>
                        setFixedExpenses((prev) =>
                          prev.map((i) => (i.id === expense.id ? { ...i, category: e.target.value } : i))
                        )
                      }
                      className={`w-full p-2 rounded-xl text-xs border ${
                        dm ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={expense.dayOfMonth}
                      onChange={(e) =>
                        setFixedExpenses((prev) =>
                          prev.map((i) => (i.id === expense.id ? { ...i, dayOfMonth: parseInt(e.target.value) || 1 } : i))
                        )
                      }
                      className={`w-full p-2 rounded-xl text-xs border ${
                        dm ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingExpenseId(null)}
                      className={`px-3 py-1 rounded-xl text-xs border ${
                        dm ? 'bg-neutral-800 text-neutral-400' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-lime-500 text-black active:scale-95"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleFixedExpense(expense.id)}
                      className="transition-colors"
                      title={expense.isActive ? 'Active (Click to disable)' : 'Inactive (Click to enable)'}
                    >
                      {expense.isActive ? (
                        <CheckCircle2 size={18} className="text-lime-400" />
                      ) : (
                        <Circle size={18} className={dm ? 'text-neutral-600' : 'text-gray-300'} />
                      )}
                    </button>
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          expense.isActive
                            ? dm
                              ? 'text-white'
                              : 'text-gray-900'
                            : dm
                            ? 'text-neutral-500 line-through'
                            : 'text-gray-400 line-through'
                        }`}
                      >
                        {expense.description}
                      </p>
                      <span className={`text-[10px] ${dm ? 'text-neutral-500' : 'text-gray-400'}`}>
                        Due: {expense.dayOfMonth}th • {expense.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-xs font-semibold tabular-nums ${
                        expense.isActive ? 'text-red-400' : dm ? 'text-neutral-600' : 'text-gray-300'
                      }`}
                    >
                      -₹{expense.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => setEditingExpenseId(expense.id)}
                      className={`p-1 rounded-lg transition-colors ${
                        dm ? 'text-neutral-500 hover:text-neutral-300' : 'text-gray-400 hover:text-gray-700'
                      }`}
                      title="Edit"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteFixedExpense(expense.id)}
                      className={`p-1 rounded-lg transition-colors ${
                        dm ? 'text-neutral-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                      }`}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {fixedExpenses.length === 0 && (
            <div
              className={`text-center py-8 rounded-2xl border border-dashed text-xs ${
                dm ? 'border-neutral-800 text-neutral-500' : 'border-gray-200 text-gray-400'
              }`}
            >
              <TrendingDown size={24} className="mx-auto mb-2 opacity-40" />
              No fixed bills listed. Add rent, utilities, or subscriptions above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisTab;