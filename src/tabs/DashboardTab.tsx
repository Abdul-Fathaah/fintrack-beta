import React, { useState, useMemo } from 'react';
import { Plus, Wallet, Lock, Unlock, Trash2, Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useTheme } from '../hooks/useTheme';
import { Obligation } from '../types';

interface DashboardTabProps {
  obligations: Obligation[];
  setObligations: (value: Obligation[] | ((prev: Obligation[]) => Obligation[])) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ obligations, setObligations }) => {
  const { isDarkMode } = useTheme();
  const [isEditingObligations, setIsEditingObligations] = useState(false);

  // CALCULATE TOTAL OBLIGATIONS
  const totalMonthlyObligations = useMemo(() => {
    return obligations.reduce((sum, item) => sum + item.amount, 0);
  }, [obligations]);

  const updateObligation = (id: string | number, field: keyof Obligation, value: any) => {
    setObligations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const toggleRecurring = (id: string | number) => {
    setObligations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRecurring: !item.isRecurring } : item))
    );
  };

  const addObligation = () => {
    const newItem: Obligation = { id: crypto.randomUUID(), label: 'New Bill', amount: 0, isRecurring: true };
    setObligations((prev) => [...prev, newItem]);
  };

  const deleteObligation = (id: string | number) => {
    if (confirm('Delete this obligation?')) {
      setObligations((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Dashboard
        </h2>
        <button
          onClick={() => setIsEditingObligations(!isEditingObligations)}
          className={`text-xs px-3 py-1 rounded-full ${
            isEditingObligations
              ? 'bg-lime-500 text-black'
              : isDarkMode
              ? 'bg-neutral-800 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          {isEditingObligations ? 'Done' : 'Edit List'}
        </button>
      </div>

      {/* TOTAL OBLIGATIONS CARD */}
      <Card className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
            Total Monthly Obligations
          </p>
          <h3 className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ₹ {totalMonthlyObligations.toLocaleString('en-IN')}
          </h3>
        </div>
        <div className={`p-4 rounded-full ${isDarkMode ? 'bg-neutral-800' : 'bg-lime-55'}`}>
          <Wallet size={24} className="text-lime-500" />
        </div>
      </Card>

      <div
        className={`rounded-2xl overflow-hidden border ${
          isDarkMode ? 'border-neutral-800 bg-neutral-900/50' : 'border-gray-200 bg-white'
        }`}
      >
        {obligations.length === 0 && (
          <p className="p-4 text-center opacity-50 text-sm">No obligations added.</p>
        )}
        {obligations.map((item) => (
          <div
            key={item.id}
            className={`p-4 border-b last:border-0 flex items-center gap-3 ${
              isDarkMode ? 'border-neutral-800' : 'border-gray-100'
            }`}
          >
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-100'}`}>
              {item.isRecurring ? (
                <Lock size={18} className="text-lime-500" />
              ) : (
                <Unlock size={18} className="text-gray-400" />
              )}
            </div>

            {isEditingObligations ? (
              <>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateObligation(item.id, 'label', e.target.value)}
                    className={`p-2 rounded-lg text-sm ${
                      isDarkMode ? 'bg-neutral-950 text-white' : 'bg-gray-50'
                    }`}
                  />
                  <input
                    type="number"
                    value={item.amount === 0 ? '' : item.amount}
                    placeholder="0"
                    onChange={(e) =>
                      updateObligation(item.id, 'amount', parseFloat(e.target.value) || 0)
                    }
                    className={`p-2 rounded-lg text-sm font-mono ${
                      isDarkMode ? 'bg-neutral-950 text-white' : 'bg-gray-50'
                    }`}
                  />
                </div>
                <button
                  onClick={() => deleteObligation(item.id)}
                  className="p-2 text-red-500 bg-red-500/10 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </>
            ) : (
              <div className="flex-1 flex justify-between items-center">
                <p
                  className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                    !item.isRecurring && 'opacity-50'
                  }`}
                >
                  {item.label}
                </p>
                <p className={`font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{item.amount}
                </p>
              </div>
            )}

            {isEditingObligations && (
              <button
                onClick={() => toggleRecurring(item.id)}
                className={`p-2 rounded-lg transition-colors ${
                  item.isRecurring ? 'bg-lime-500/20 text-lime-500' : 'bg-gray-500/20 text-gray-500'
                }`}
              >
                <Check size={16} />
              </button>
            )}
          </div>
        ))}
        {isEditingObligations && (
          <button
            onClick={addObligation}
            className={`w-full p-3 flex items-center justify-center gap-2 text-sm font-medium ${
              isDarkMode ? 'text-lime-500 hover:bg-neutral-800' : 'text-lime-600 hover:bg-gray-50'
            }`}
          >
            <Plus size={16} /> Add New Obligation
          </button>
        )}
      </div>
      <p className="text-[10px] text-center opacity-40 px-4">
        Items with <span className="text-lime-500">Green Lock</span> are Recurring and auto-deducted
        from your Safe-to-Spend limit.
      </p>
    </div>
  );
};
