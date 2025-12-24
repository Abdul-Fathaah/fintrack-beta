import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  Plus, PieChart, LayoutDashboard, Home, TrendingUp, AlertCircle,
  Settings as SettingsIcon, Sun, Moon,
  Check, Pencil, Receipt, LogOut, Download, Upload, X, ChevronLeft, Lock, Unlock, FileText, Trash2, Lightbulb, Wallet, MessageSquareText, ArrowRight
} from 'lucide-react';
import Login from './Login';

// --- PRODUCTION KEYS ---
const STORAGE_KEYS = {
  TRANSACTIONS: 'ft_client_transactions_v1',
  GOALS: 'ft_client_goals_v1',
  OBLIGATIONS: 'ft_client_obligations_v1',
  CORPUS: 'ft_client_corpus_v1',
  PROFILE: 'ft_client_profile_v1',
  SESSION: 'ft_client_session_v1',
  THEME: 'ft_client_theme_v1'
};

// --- Theme Context ---
const ThemeContext = React.createContext({ isDarkMode: true, toggleTheme: () => { } });
const useTheme = () => useContext(ThemeContext);

// --- Defaults ---
const INITIAL_TRANSACTIONS = [];
const INITIAL_OBLIGATIONS = [
  { id: 'homeLoan', label: 'Home Loan', amount: 0, isRecurring: true },
  { id: 'sip', label: 'SIP (Auto-Invest)', amount: 0, isRecurring: true },
  { id: 'rent', label: 'Rent', amount: 0, isRecurring: true },
  { id: 'internet', label: 'Internet / WiFi', amount: 0, isRecurring: true },
  { id: 'utility', label: 'Electricity / Water', amount: 0, isRecurring: true },
];
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Investment', 'Salary', 'Other'];

// --- Utility Components ---
const Card = ({ children, className = "" }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200 shadow-sm'} rounded-2xl border p-4 transition-colors duration-300 ${className}`}>
      {children}
    </div>
  );
};

const FinTrackLogo = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className="flex items-center gap-2 select-none">
      <svg className={`w-7 h-7 ${isDarkMode ? 'text-lime-400 drop-shadow-[0_0_5px_rgba(132,204,22,0.8)]' : 'text-lime-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 17l4-4-4-4" /><path d="M12 17l-4-4" /><circle cx="12" cy="13" r="1.5" fill="currentColor" stroke="none" /><circle cx="16" cy="9" r="1.5" fill="currentColor" stroke="none" /><circle cx="8" cy="9" r="1.5" fill="currentColor" stroke="none" /></svg>
      <h1 className={`text-xl font-bold tracking-tight font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>FIN<span className={isDarkMode ? 'text-lime-400' : 'text-lime-600'}>TRACK</span></h1>
    </div>
  );
};

// --- TAB 1: HOME (Net Worth, Safe-to-Spend, Logs) ---
const HomeTab = ({ transactions, totalBalance, obligations, monthlySavingsTarget, onSmartAdd }) => {
  const { isDarkMode } = useTheme();
  const [smsInput, setSmsInput] = useState('');

  // Safe-to-Spend Logic
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const currentMonthIncome = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpense = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).reduce((sum, t) => sum + t.amount, 0);

  const recurringObligationsTotal = obligations.filter(o => o.isRecurring).reduce((sum, item) => sum + item.amount, 0);
  const totalCommitments = recurringObligationsTotal + (monthlySavingsTarget || 0);
  const safeToSpendTotal = Math.max(0, currentMonthIncome - totalCommitments);
  const remainingSafeBudget = safeToSpendTotal - currentMonthExpense;

  let budgetProgress = 0;
  if (safeToSpendTotal > 0) budgetProgress = (currentMonthExpense / safeToSpendTotal) * 100;
  else if (currentMonthExpense > 0) budgetProgress = 100;

  // SMS Parsing Logic
  const handleParse = () => {
    if (!smsInput.trim()) return;

    // 1. Amount Regex (Look for Rs, INR, ₹ followed by digits)
    const amountRegex = /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i;
    const amountMatch = smsInput.match(amountRegex);
    let amount = '';
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // 2. Type Detection
    let type = 'expense';
    if (/(credited|received|deposited|added)/i.test(smsInput)) {
      type = 'income';
    }

    // 3. Merchant/Description (Look for 'at', 'to', 'from')
    const merchantRegex = /(?:at|to|from)\s+([a-zA-Z0-9\s\.]+?)(?:\s+(?:on|using|via|through|ref)|$)/i;
    const merchantMatch = smsInput.match(merchantRegex);
    let text = merchantMatch ? merchantMatch[1].trim() : 'SMS Transaction';

    onSmartAdd({ amount, text, type });
    setSmsInput('');
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Net Worth Card */}
      <div className={`${isDarkMode ? 'bg-neutral-950 border-lime-500/50 shadow-[0_0_20px_rgba(132,204,22,0.15)]' : 'bg-white border-lime-500 shadow-xl shadow-lime-500/20'} border rounded-3xl p-6 relative overflow-hidden transition-all duration-300`}>
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-10 -mt-10 ${isDarkMode ? 'bg-lime-500/10' : 'bg-lime-500/20'}`}></div>
        <p className={`text-xs font-mono tracking-widest uppercase mb-2 ${isDarkMode ? 'text-lime-400/80' : 'text-lime-700'}`}>Total Net Worth</p>
        <h1 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'text-gray-900'}`}>₹ {totalBalance.toLocaleString('en-IN')}</h1>
        <div className={`pt-4 border-t ${isDarkMode ? 'border-neutral-800' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center text-sm">
            <span className={isDarkMode ? 'text-neutral-400' : 'text-gray-500'}>Income (This Month)</span>
            <span className="text-lime-500 font-semibold">+₹{currentMonthIncome.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Safe-to-Spend Card */}
      <Card>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className={`font-semibold text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
        <div className={`h-3 w-full rounded-full mb-2 ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-100'} overflow-hidden`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${remainingSafeBudget < 0 ? 'bg-red-500' : 'bg-lime-500'}`}
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
            <span className="font-mono font-semibold text-red-400">-₹{totalCommitments.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* NEW: Smart SMS Parsing */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-neutral-800' : 'bg-blue-50'}`}>
            <MessageSquareText size={20} className="text-blue-500" />
          </div>
          <div>
            <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add From SMS</h3>
            <p className="text-[10px] opacity-60">Paste bank SMS to auto-fill details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste transaction SMS here..."
            value={smsInput}
            onChange={(e) => setSmsInput(e.target.value)}
            className={`flex-1 p-3 rounded-xl text-sm outline-none border ${isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
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
          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {transactions.slice().reverse().slice(0, 10).map(tx => (
            <div key={tx.id} className={`flex justify-between items-center p-3 rounded-xl ${isDarkMode ? 'bg-neutral-900' : 'bg-white border border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-lime-500/10 text-lime-500' : (tx.type === 'investment' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500')}`}>
                  {tx.type === 'income' ? <TrendingUp size={16} /> : (tx.type === 'investment' ? <PieChart size={16} /> : <Receipt size={16} />)}
                </div>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tx.text}</p>
                  <p className="text-xs opacity-50">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`font-mono font-medium ${tx.type === 'income' ? 'text-lime-500' : (tx.type === 'investment' ? 'text-blue-500' : 'text-red-500')}`}>
                {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
              </span>
            </div>
          ))}
          {transactions.length === 0 && <div className="text-center py-8 opacity-50 text-sm">No transactions yet</div>}
        </div>
      </div>
    </div>
  );
};

// --- TAB 2: ANALYSIS (Stats & Insights) ---
const AnalysisTab = ({ transactions }) => {
  const { isDarkMode } = useTheme();

  const expenses = transactions.filter(t => t.type === 'expense');

  // 1. Category Totals
  const categoryTotals = useMemo(() => {
    const totals = {};
    expenses.forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  // 2. Most Transactions In
  const mostFrequentCategory = useMemo(() => {
    const counts = {};
    expenses.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0] : ['None', 0];
  }, [expenses]);

  // 3. Avg Transaction Per Month
  const avgMonthlySpending = useMemo(() => {
    if (expenses.length === 0) return 0;
    const months = new Set(expenses.map(t => {
      const d = new Date(t.date);
      return `${d.getMonth()}-${d.getFullYear()}`;
    }));
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    return Math.round(total / (months.size || 1));
  }, [expenses]);

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analysis</h2>

      {/* Insight Guideline */}
      <div className={`p-4 rounded-2xl flex gap-3 ${isDarkMode ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
        <Lightbulb className="text-amber-500 shrink-0" />
        <div>
          <h3 className={`font-bold text-sm mb-1 ${isDarkMode ? 'text-amber-500' : 'text-amber-700'}`}>Spending Guideline</h3>
          <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-gray-600'}`}>
            {categoryTotals.length > 0
              ? `You are spending the most on ${categoryTotals[0][0]} (${Math.round((categoryTotals[0][1] / totalExpenses) * 100)}%). Try to reduce this by 10% next month to increase savings.`
              : "Track more expenses to get personalized insights."}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs opacity-50 mb-1">Most Transactions In</p>
          <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{mostFrequentCategory[0]}</p>
          <p className="text-xs opacity-50">{mostFrequentCategory[1]} transactions</p>
        </Card>
        <Card>
          <p className="text-xs opacity-50 mb-1">Avg Monthly Spending</p>
          <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{avgMonthlySpending.toLocaleString()}</p>
          <p className="text-xs opacity-50">across all categories</p>
        </Card>
      </div>

      <Card>
        <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Expense Breakdown</h3>
        {categoryTotals.length > 0 ? (
          <div className="space-y-4">
            {categoryTotals.map(([cat, amount]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={isDarkMode ? 'text-neutral-300' : 'text-gray-700'}>{cat}</span>
                  <span className={isDarkMode ? 'text-neutral-400' : 'text-gray-500'}>₹{amount.toLocaleString()}</span>
                </div>
                <div className={`h-2 w-full rounded-full ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-100'}`}>
                  <div className="h-full rounded-full bg-lime-500" style={{ width: `${(amount / totalExpenses) * 100}%` }}></div>
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

// --- TAB 3: DASHBOARD (Obligations Manager) ---
const DashboardTab = ({ obligations, setObligations }) => {
  const { isDarkMode } = useTheme();
  const [isEditingObligations, setIsEditingObligations] = useState(false);

  // CALCULATE TOTAL OBLIGATIONS
  const totalMonthlyObligations = useMemo(() => {
    return obligations.reduce((sum, item) => sum + item.amount, 0);
  }, [obligations]);

  const updateObligation = (id, field, value) => {
    setObligations(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const toggleRecurring = (id) => {
    setObligations(prev => prev.map(item => item.id === id ? { ...item, isRecurring: !item.isRecurring } : item));
  };

  const addObligation = () => {
    const newItem = { id: Date.now(), label: 'New Bill', amount: 0, isRecurring: true };
    setObligations(prev => [...prev, newItem]);
  };

  const deleteObligation = (id) => {
    if (confirm("Delete this obligation?")) {
      setObligations(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h2>
        <button onClick={() => setIsEditingObligations(!isEditingObligations)} className={`text-xs px-3 py-1 rounded-full ${isEditingObligations ? 'bg-lime-500 text-black' : (isDarkMode ? 'bg-neutral-800 text-white' : 'bg-gray-200 text-gray-900')}`}>
          {isEditingObligations ? 'Done' : 'Edit List'}
        </button>
      </div>

      {/* NEW TOTAL OBLIGATIONS CARD */}
      <Card className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>Total Monthly Obligations</p>
          <h3 className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹ {totalMonthlyObligations.toLocaleString('en-IN')}</h3>
        </div>
        <div className={`p-4 rounded-full ${isDarkMode ? 'bg-neutral-800' : 'bg-lime-50'}`}>
          <Wallet size={24} className="text-lime-500" />
        </div>
      </Card>

      <div className={`rounded-2xl overflow-hidden border ${isDarkMode ? 'border-neutral-800 bg-neutral-900/50' : 'border-gray-200 bg-white'}`}>
        {obligations.length === 0 && <p className="p-4 text-center opacity-50 text-sm">No obligations added.</p>}
        {obligations.map(item => (
          <div key={item.id} className={`p-4 border-b last:border-0 flex items-center gap-3 ${isDarkMode ? 'border-neutral-800' : 'border-gray-100'}`}>
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-100'}`}>
              {item.isRecurring ? <Lock size={18} className="text-lime-500" /> : <Unlock size={18} className="text-gray-400" />}
            </div>

            {isEditingObligations ? (
              <>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input type="text" value={item.label} onChange={(e) => updateObligation(item.id, 'label', e.target.value)} className={`p-2 rounded-lg text-sm ${isDarkMode ? 'bg-neutral-950 text-white' : 'bg-gray-50'}`} />
                  <input type="number" value={item.amount === 0 ? '' : item.amount} placeholder="0" onChange={(e) => updateObligation(item.id, 'amount', parseFloat(e.target.value) || 0)} className={`p-2 rounded-lg text-sm font-mono ${isDarkMode ? 'bg-neutral-950 text-white' : 'bg-gray-50'}`} />
                </div>
                <button onClick={() => deleteObligation(item.id)} className="p-2 text-red-500 bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
              </>
            ) : (
              <div className="flex-1 flex justify-between items-center">
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} ${!item.isRecurring && 'opacity-50'}`}>{item.label}</p>
                <p className={`font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{item.amount}</p>
              </div>
            )}

            {isEditingObligations && (
              <button onClick={() => toggleRecurring(item.id)} className={`p-2 rounded-lg transition-colors ${item.isRecurring ? 'bg-lime-500/20 text-lime-500' : 'bg-gray-500/20 text-gray-500'}`}>
                <Check size={16} />
              </button>
            )}
          </div>
        ))}
        {isEditingObligations && (
          <button onClick={addObligation} className={`w-full p-3 flex items-center justify-center gap-2 text-sm font-medium ${isDarkMode ? 'text-lime-500 hover:bg-neutral-800' : 'text-lime-600 hover:bg-gray-50'}`}>
            <Plus size={16} /> Add New Obligation
          </button>
        )}
      </div>
      <p className="text-[10px] text-center opacity-40 px-4">Items with <span className="text-lime-500">Green Lock</span> are Recurring and auto-deducted from your Safe-to-Spend limit.</p>
    </div>
  );
};

// --- TAB 4: SETTINGS ---
const SettingsTab = ({ userProfile, setUserProfile, logout, currentUser }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editEmail, setEditEmail] = useState(userProfile.email || '');
  const [editSavingsTarget, setEditSavingsTarget] = useState(userProfile.monthlySavingsTarget || 0);

  const saveProfile = () => { setUserProfile({ ...userProfile, name: editName, email: editEmail, monthlySavingsTarget: parseFloat(editSavingsTarget) || 0 }); setIsEditingProfile(false); };

  const handleExport = () => {
    const suffix = `_${currentUser.id}`;
    const data = {
      profile: JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE + suffix)),
      transactions: JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS + suffix)),
      obligations: JSON.parse(localStorage.getItem(STORAGE_KEYS.OBLIGATIONS + suffix)),
      theme: JSON.parse(localStorage.getItem(STORAGE_KEYS.THEME))
    };
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    link.download = `fintrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const suffix = `_${currentUser.id}`;
        if (data.profile) localStorage.setItem(STORAGE_KEYS.PROFILE + suffix, JSON.stringify(data.profile));
        if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS + suffix, JSON.stringify(data.transactions));
        if (data.obligations) localStorage.setItem(STORAGE_KEYS.OBLIGATIONS + suffix, JSON.stringify(data.obligations));
        alert("Import successful! Reloading...");
        window.location.reload();
      } catch (error) { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
  };

  if (isEditingProfile) {
    return (
      <div className="animate-fade-in pb-24">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setIsEditingProfile(false)} className={`p-2 rounded-full ${isDarkMode ? 'bg-neutral-800 text-white' : 'bg-white text-gray-900 shadow-sm'}`}><ChevronLeft size={24} /></button>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Profile</h2>
        </div>
        <Card className="space-y-6">
          <div><label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>Full Name</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-gray-50 border-gray-200'}`} /></div>
          <div><label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>Email</label><input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-gray-50 border-gray-200'}`} /></div>
          <div className="pt-4 border-t border-dashed border-gray-700"><h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-lime-400' : 'text-lime-600'}`}>Financial Goals</h3><label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>Minimum Monthly Savings Target</label><input type="number" value={editSavingsTarget === 0 ? '' : editSavingsTarget} onChange={(e) => setEditSavingsTarget(e.target.value)} placeholder="0" className={`w-full p-3 pl-8 rounded-xl border outline-none ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-gray-50 border-gray-200'}`} /></div>
          <button onClick={saveProfile} className="w-full py-4 bg-lime-500 hover:bg-lime-400 text-black font-bold rounded-xl mt-4">Save Changes</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className={`relative overflow-hidden rounded-3xl p-6 ${isDarkMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${isDarkMode ? 'bg-neutral-700 text-lime-400' : 'bg-lime-100 text-lime-600'}`}>{userProfile.name.charAt(0).toUpperCase()}</div>
            <div><h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.name}</h2><p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>{userProfile.email || 'No email set'}</p></div>
          </div>
          <button onClick={() => setIsEditingProfile(true)} className={`p-2 rounded-full ${isDarkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-gray-100 hover:bg-gray-200'}`}><Pencil size={18} className={isDarkMode ? 'text-white' : 'text-gray-700'} /></button>
        </div>
      </div>
      <div className="space-y-2"><h3 className={`text-sm font-semibold uppercase tracking-wider px-1 ${isDarkMode ? 'text-neutral-500' : 'text-gray-500'}`}>Data Management</h3><div className="grid grid-cols-2 gap-3"><button onClick={handleExport} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 ${isDarkMode ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}><Download size={24} className="mb-2 text-lime-500" /><span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Backup Data</span></button><label className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 cursor-pointer ${isDarkMode ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}><Upload size={24} className="mb-2 text-blue-500" /><span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Import Data</span><input type="file" accept=".json" onChange={handleImport} className="hidden" /></label></div></div>
      <div className="space-y-2"><h3 className={`text-sm font-semibold uppercase tracking-wider px-1 ${isDarkMode ? 'text-neutral-500' : 'text-gray-500'}`}>App Preferences</h3><Card className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-100'}`}>{isDarkMode ? <Moon size={20} /> : <Sun size={20} />}</div><span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Dark Mode</span></div><button onClick={toggleTheme} className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-lime-500' : 'bg-gray-300'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'left-7' : 'left-1'}`}></div></button></Card></div>
      <button onClick={logout} className="w-full py-4 text-red-500 font-medium flex items-center justify-center gap-2"><LogOut size={20} /> Sign Out</button>
    </div>
  );
};

const AddTransaction = ({ onAdd, onClose, categories, initialData }) => {
  const { isDarkMode } = useTheme();
  const [amount, setAmount] = useState('');
  const [text, setText] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(categories[0]);

  // Pre-fill from SMS parsing or other sources
  useEffect(() => {
    if (initialData) {
      if (initialData.amount) setAmount(initialData.amount);
      if (initialData.text) setText(initialData.text);
      if (initialData.type) setType(initialData.type);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) { alert("Please enter a valid amount greater than 0."); return; }
    if (!text.trim()) { alert("Please enter a description."); return; }
    onAdd({ id: Date.now(), amount: val, text, type, category, date: new Date().toISOString() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`w-full max-w-md rounded-3xl p-6 ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white'} border shadow-2xl animate-slide-up`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add Transaction</h2>
          <button onClick={onClose} className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-gray-100 text-gray-500'}`}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className={`text-xs font-medium ml-1 mb-1 block ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>Amount</label><div className="relative"><span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${isDarkMode ? 'text-neutral-500' : 'text-gray-400'}`}>₹</span><input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-full bg-transparent text-3xl font-bold p-3 pl-10 rounded-2xl outline-none focus:ring-2 focus:ring-lime-500/50 transition-all ${isDarkMode ? 'text-white placeholder-neutral-700' : 'text-gray-900 placeholder-gray-300'}`} placeholder="0" autoFocus /></div></div>
          <div><label className={`text-xs font-medium ml-1 mb-1 block ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>Description</label><input type="text" value={text} onChange={(e) => setText(e.target.value)} className={`w-full p-4 rounded-xl outline-none border transition-all ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white focus:border-lime-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-lime-500'}`} placeholder="What is this for?" /></div>
          <div className="grid grid-cols-3 gap-2">{['expense', 'income', 'investment'].map(t => (<button key={t} type="button" onClick={() => setType(t)} className={`p-3 rounded-xl text-sm font-medium capitalize transition-all border ${type === t ? (t === 'income' ? 'bg-lime-500 text-white border-lime-500' : t === 'investment' ? 'bg-blue-600 text-white border-blue-600' : 'bg-red-500 text-white border-red-500') : (isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100')}`}>{t}</button>))}</div>
          <button type="submit" className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold py-4 rounded-xl transition-all active:scale-[0.98]">Add Transaction</button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => { const saved = localStorage.getItem(STORAGE_KEYS.THEME); return saved ? JSON.parse(saved) : true; });
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(isDarkMode)); if (isDarkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); }, [isDarkMode]);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [obligations, setObligations] = useState(INITIAL_OBLIGATIONS);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem(STORAGE_KEYS.SESSION + '_tab') || 'home');
  const [draftTx, setDraftTx] = useState(null); // State for smart SMS add

  useEffect(() => { if (currentUser) localStorage.setItem(STORAGE_KEYS.SESSION + '_tab', activeTab); }, [activeTab, currentUser]);

  const loadUserData = (user) => {
    const suffix = `_${user.id}`;
    setTransactions(JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS + suffix)) || INITIAL_TRANSACTIONS);
    setObligations(JSON.parse(localStorage.getItem(STORAGE_KEYS.OBLIGATIONS + suffix)) || INITIAL_OBLIGATIONS);
    setUserProfile(JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE + suffix)) || { name: user.name || 'User', email: user.email, monthlySavingsTarget: 0 });
  };

  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (savedSession) { const user = JSON.parse(savedSession); setCurrentUser(user); loadUserData(user); }
  }, []);

  const handleLogin = (user) => { setCurrentUser(user); loadUserData(user); localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user)); };
  const handleLogout = () => { setCurrentUser(null); localStorage.removeItem(STORAGE_KEYS.SESSION); localStorage.removeItem(STORAGE_KEYS.SESSION + '_tab'); setActiveTab('home'); };

  useEffect(() => {
    if (currentUser) {
      const suffix = `_${currentUser.id}`;
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS + suffix, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.OBLIGATIONS + suffix, JSON.stringify(obligations));
      localStorage.setItem(STORAGE_KEYS.PROFILE + suffix, JSON.stringify(userProfile));
    }
  }, [transactions, obligations, userProfile, currentUser]);

  const totalBalance = useMemo(() => transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0), [transactions]);

  // Handler for Smart SMS Add
  const handleSmartAdd = (data) => {
    setDraftTx(data);
    setShowAddModal(true);
  };

  if (!currentUser) {
    return (
      <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
        <div className={`min-h-screen ${isDarkMode ? 'bg-neutral-950 text-white' : 'bg-gray-50 text-gray-900'}`}><Login onLogin={handleLogin} /></div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-neutral-950 text-white' : 'bg-gray-50 text-gray-900'} font-sans selection:bg-lime-500/30`}>
        <header className={`fixed top-0 w-full z-40 px-6 py-4 flex justify-between items-center ${isDarkMode ? 'bg-neutral-950/80' : 'bg-white/80'} backdrop-blur-md border-b ${isDarkMode ? 'border-neutral-900' : 'border-gray-200'}`}>
          <FinTrackLogo />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isDarkMode ? 'bg-neutral-800 text-lime-400' : 'bg-lime-100 text-lime-600'}`}>{userProfile?.name?.charAt(0) || 'U'}</div>
        </header>

        <main className="pt-24 px-4 max-w-lg mx-auto min-h-screen">
          {activeTab === 'home' && <HomeTab transactions={transactions} totalBalance={totalBalance} obligations={obligations} monthlySavingsTarget={userProfile?.monthlySavingsTarget} onSmartAdd={handleSmartAdd} />}
          {activeTab === 'analysis' && <AnalysisTab transactions={transactions} />}
          {activeTab === 'dashboard' && <DashboardTab obligations={obligations} setObligations={setObligations} />}
          {activeTab === 'settings' && <SettingsTab userProfile={userProfile} setUserProfile={setUserProfile} logout={handleLogout} currentUser={currentUser} />}
        </main>

        <button onClick={() => { setDraftTx(null); setShowAddModal(true); }} className="fixed right-6 bottom-24 z-40 bg-lime-500 hover:bg-lime-400 text-black p-4 rounded-full shadow-[0_0_20px_rgba(132,204,22,0.4)] transition-transform hover:scale-105 active:scale-95"><Plus size={28} strokeWidth={2.5} /></button>

        <nav className={`fixed bottom-0 w-full pb-safe z-40 border-t ${isDarkMode ? 'bg-neutral-950 border-neutral-900' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center p-2 max-w-lg mx-auto px-6">
            <button onClick={() => setActiveTab('home')} className={`p-4 rounded-2xl transition-all ${activeTab === 'home' ? (isDarkMode ? 'text-lime-400 bg-neutral-900' : 'text-lime-600 bg-lime-50') : 'opacity-50 hover:opacity-100'}`}><Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} /></button>
            <button onClick={() => setActiveTab('analysis')} className={`p-4 rounded-2xl transition-all ${activeTab === 'analysis' ? (isDarkMode ? 'text-lime-400 bg-neutral-900' : 'text-lime-600 bg-lime-50') : 'opacity-50 hover:opacity-100'}`}><FileText size={24} strokeWidth={activeTab === 'analysis' ? 2.5 : 2} /></button>
            <button onClick={() => setActiveTab('dashboard')} className={`p-4 rounded-2xl transition-all ${activeTab === 'dashboard' ? (isDarkMode ? 'text-lime-400 bg-neutral-900' : 'text-lime-600 bg-lime-50') : 'opacity-50 hover:opacity-100'}`}><LayoutDashboard size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} /></button>
            <button onClick={() => setActiveTab('settings')} className={`p-4 rounded-2xl transition-all ${activeTab === 'settings' ? (isDarkMode ? 'text-lime-400 bg-neutral-900' : 'text-lime-600 bg-lime-50') : 'opacity-50 hover:opacity-100'}`}><SettingsIcon size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} /></button>
          </div>
        </nav>

        {showAddModal && <AddTransaction onAdd={(tx) => setTransactions(prev => [...prev, tx])} onClose={() => setShowAddModal(false)} categories={CATEGORIES} initialData={draftTx} />}
      </div>
    </ThemeContext.Provider>
  );
};

export default App;