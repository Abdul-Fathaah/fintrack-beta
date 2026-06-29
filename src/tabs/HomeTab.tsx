import React, { useState } from 'react';
import {
  AlertCircle,
  TrendingUp,
  Receipt,
  PieChart,
  MessageSquareText,
  ArrowRight
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
  onSmartAdd: (data: { amount: number | ''; text: string; type: 'income' | 'expense' | 'investment' }) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  transactions,
  totalBalance,
  obligations,
  monthlySavingsTarget,
  onSmartAdd,
}) => {
  const { isDarkMode } = useTheme();
  const [smsInput, setSmsInput] = useState('');

  // Safe-to-Spend Logic
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const currentMonthIncome = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpense = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const recurringObligationsTotal = obligations
    .filter((o) => o.isRecurring)
    .reduce((sum, item) => sum + item.amount, 0);
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

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Net Worth Card */}
      <div
        className={`${
          isDarkMode
            ? 'bg-neutral-950 border-lime-500/50 shadow-[0_0_20px_rgba(132,204,22,0.15)]'
            : 'bg-white border-lime-500 shadow-xl shadow-lime-500/20'
        } border rounded-3xl p-6 relative overflow-hidden transition-all duration-300`}
      >
        <div
          className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-10 -mt-10 ${
            isDarkMode ? 'bg-lime-500/10' : 'bg-lime-500/20'
          }`}
        ></div>
        <p
          className={`text-xs font-mono tracking-widest uppercase mb-2 ${
            isDarkMode ? 'text-lime-400/80' : 'text-lime-700'
          }`}
        >
          Total Net Worth
        </p>
        <h1
          className={`text-4xl font-bold mb-6 ${
            isDarkMode
              ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]'
              : 'text-gray-900'
          }`}
        >
          ₹ {totalBalance.toLocaleString('en-IN')}
        </h1>
        <div className={`pt-4 border-t ${isDarkMode ? 'border-neutral-800' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center text-sm">
            <span className={isDarkMode ? 'text-neutral-400' : 'text-gray-500'}>
              Income (This Month)
            </span>
            <span className="text-lime-500 font-semibold">
              +₹{currentMonthIncome.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Safe-to-Spend Card */}
      <Card>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2
              className={`font-semibold text-lg flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Monthly Allowance
              <AlertCircle size={16} className={isDarkMode ? 'text-neutral-500' : 'text-gray-400'} />
            </h2>
            <p className="text-[10px] opacity-60">Income - (Obligations + Savings Goal)</p>
          </div>
          <div className={`text-right ${remainingSafeBudget < 0 ? 'text-red-500' : 'text-lime-500'}`}>
            <p className="text-2xl font-bold">₹ {remainingSafeBudget.toLocaleString('en-IN')}</p>
            <p className="text-xs opacity-70">Avl. Balance</p>
          </div>
        </div>
        <div
          className={`h-3 w-full rounded-full mb-2 ${
            isDarkMode ? 'bg-neutral-800' : 'bg-gray-100'
          } overflow-hidden`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              remainingSafeBudget < 0 ? 'bg-red-500' : 'bg-lime-500'
            }`}
            style={{ width: `${Math.min(100, budgetProgress)}%` }}
          ></div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-50'}`}>
            <span className="block opacity-60 mb-1">True Budget</span>
            <span className="font-mono font-semibold">₹{safeToSpendTotal.toLocaleString()}</span>
          </div>
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-50'}`}>
            <span className="block opacity-60 mb-1">Commitments</span>
            <span className="font-mono font-semibold text-red-400">
              -₹{totalCommitments.toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Smart SMS Parsing */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-neutral-800' : 'bg-blue-50'}`}>
            <MessageSquareText size={20} className="text-blue-500" />
          </div>
          <div>
            <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Add From SMS
            </h3>
            <p className="text-[10px] opacity-60">Paste bank SMS to auto-fill details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste transaction SMS here..."
            value={smsInput}
            onChange={(e) => setSmsInput(e.target.value)}
            className={`flex-1 p-3 rounded-xl text-sm outline-none border ${
              isDarkMode
                ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-300'
            }`}
          />
          <button
            onClick={handleParse}
            disabled={!smsInput.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl transition-colors disabled:opacity-50"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </Card>

      {/* Transaction Logs */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Activity
          </h3>
        </div>
        <div className="space-y-3">
          {transactions
            .slice()
            .reverse()
            .slice(0, 10)
            .map((tx) => (
              <div
                key={tx.id}
                className={`flex justify-between items-center p-3 rounded-xl ${
                  isDarkMode ? 'bg-neutral-900' : 'bg-white border border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      tx.type === 'income'
                        ? 'bg-lime-500/10 text-lime-500'
                        : tx.type === 'investment'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-red-500/10 text-red-500'
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
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {tx.text}
                    </p>
                    <p className="text-xs opacity-50">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span
                  className={`font-mono font-medium ${
                    tx.type === 'income'
                      ? 'text-lime-500'
                      : tx.type === 'investment'
                      ? 'text-blue-500'
                      : 'text-red-500'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                </span>
              </div>
            ))}
          {transactions.length === 0 && (
            <div className="text-center py-8 opacity-50 text-sm">No transactions yet</div>
          )}
        </div>
      </div>
    </div>
  );
};
