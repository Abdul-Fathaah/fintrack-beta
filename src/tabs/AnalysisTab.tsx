import React, { useMemo } from 'react';
import { Lightbulb } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useTheme } from '../hooks/useTheme';
import { Transaction } from '../types';

interface AnalysisTabProps {
  transactions: Transaction[];
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({ transactions }) => {
  const { isDarkMode } = useTheme();

  const expenses = transactions.filter((t) => t.type === 'expense');

  // 1. Category Totals
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  // 2. Most Transactions In
  const mostFrequentCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    expenses.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0] : ['None', 0];
  }, [expenses]);

  // 3. Avg Transaction Per Month
  const avgMonthlySpending = useMemo(() => {
    if (expenses.length === 0) return 0;
    const months = new Set(
      expenses.map((t) => {
        const d = new Date(t.date);
        return `${d.getMonth()}-${d.getFullYear()}`;
      })
    );
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    return Math.round(total / (months.size || 1));
  }, [expenses]);

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analysis</h2>

      {/* Insight Guideline */}
      <div
        className={`p-4 rounded-2xl flex gap-3 ${
          isDarkMode
            ? 'bg-amber-500/10 border border-amber-500/20'
            : 'bg-amber-50 border border-amber-200'
        }`}
      >
        <Lightbulb className="text-amber-500 shrink-0" />
        <div>
          <h3
            className={`font-bold text-sm mb-1 ${isDarkMode ? 'text-amber-500' : 'text-amber-700'}`}
          >
            Spending Guideline
          </h3>
          <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-gray-600'}`}>
            {categoryTotals.length > 0
              ? `You are spending the most on ${categoryTotals[0][0]} (${Math.round(
                  (categoryTotals[0][1] / totalExpenses) * 100
                )}%). Try to reduce this by 10% next month to increase savings.`
              : 'Track more expenses to get personalized insights.'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs opacity-50 mb-1">Most Transactions In</p>
          <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {mostFrequentCategory[0]}
          </p>
          <p className="text-xs opacity-50">{mostFrequentCategory[1]} transactions</p>
        </Card>
        <Card>
          <p className="text-xs opacity-50 mb-1">Avg Monthly Spending</p>
          <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ₹{avgMonthlySpending.toLocaleString()}
          </p>
          <p className="text-xs opacity-50">across all categories</p>
        </Card>
      </div>

      <Card>
        <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Expense Breakdown
        </h3>
        {categoryTotals.length > 0 ? (
          <div className="space-y-4">
            {categoryTotals.map(([cat, amount]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={isDarkMode ? 'text-neutral-300' : 'text-gray-700'}>{cat}</span>
                  <span className={isDarkMode ? 'text-neutral-400' : 'text-gray-500'}>
                    ₹{amount.toLocaleString()}
                  </span>
                </div>
                <div className={`h-2 w-full rounded-full ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-100'}`}>
                  <div
                    className="h-full rounded-full bg-lime-500"
                    style={{ width: `${(amount / totalExpenses) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center opacity-50 py-8">No expenses to analyze yet.</p>
        )}
      </Card>
    </div>
  );
};
