import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import {
  Plus, PieChart, Target, Home, Smartphone, TrendingUp, AlertCircle,
  DollarSign, Activity, Zap, Settings as SettingsIcon, Sun, Moon,
  User, RefreshCw, Camera, Check, Pencil, Receipt, Trash2, LogOut, Download, Upload, X
} from 'lucide-react';
// 1. IMPORT LOGIN COMPONENT
import Login from './Login';

// --- PRODUCTION KEYS ---
const STORAGE_KEYS = {
  TRANSACTIONS: 'ft_client_transactions_v1',
  GOALS: 'ft_client_goals_v1',
  OBLIGATIONS: 'ft_client_obligations_v1',
  CORPUS: 'ft_client_corpus_v1',
  PROFILE: 'ft_client_profile_v1',
  SESSION: 'ft_client_session_v1'
};

// --- Theme Context ---
const ThemeContext = React.createContext({ isDarkMode: true, toggleTheme: () => { } });
const useTheme = () => useContext(ThemeContext);

// --- Defaults (EMPTY FOR CLIENT) ---
const INITIAL_TRANSACTIONS = [];
const INITIAL_GOALS = [];
const INITIAL_OBLIGATIONS = [
  { id: 'homeLoan', label: 'Home Loan', amount: 0 },
  { id: 'carLoan', label: 'Car Loan', amount: 0 },
  { id: 'personalLoan', label: 'Personal Loan', amount: 0 },
  { id: 'sip', label: 'SIP (Auto-Invest)', amount: 0 },
  { id: 'rent', label: 'Rent', amount: 0 },
  { id: 'internet', label: 'Internet / WiFi', amount: 0 },
  { id: 'utility', label: 'Electricity / Water', amount: 0 },
  { id: 'other', label: 'Other subscriptions', amount: 0 },
];
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Investment', 'Salary', 'Other'];
const MOCK_SMS_EXAMPLES = [];

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

// --- Sub Components ---

const Dashboard = ({ transactions, totalBalance, obligations, totalInvestment, investmentCorpus, setInvestmentCorpus, deleteTransaction }) => {
  const { isDarkMode } = useTheme();
  const [isEditingInvestment, setIsEditingInvestment] = useState(false);
  const [editValue, setEditValue] = useState(investmentCorpus);
  useEffect(() => { setEditValue(investmentCorpus); }, [investmentCorpus]);
  const handleSaveEdit = () => { const val = parseFloat(editValue); if (!isNaN(val) && val >= 0) { setInvestmentCorpus(val); setIsEditingInvestment(false); } else { setEditValue(investmentCorpus); setIsEditingInvestment(false); } };
  const recentTx = useMemo(() => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5), [transactions]);
  const today = new Date(); const currentMonth = today.getMonth(); const currentYear = today.getFullYear(); const monthName = today.toLocaleString('default', { month: 'long' }).toUpperCase();
  const investmentFromTx = useMemo(() => transactions.filter(t => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const income = useMemo(() => transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const expense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalMonthlyObligations = useMemo(() => obligations.reduce((sum, item) => sum + item.amount, 0), [obligations]);
  const currentMonthIncome = useMemo(() => transactions.filter(t => { if (t.type !== 'income') return false; const txDate = new Date(t.date); return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth; }).reduce((sum, t) => sum + t.amount, 0), [transactions, currentYear, currentMonth]);
  const dynamicMonthlyBudget = Math.max(0, currentMonthIncome - totalMonthlyObligations);
  const totalMonthlyExpense = useMemo(() => transactions.filter(t => { if (t.type !== 'expense') return false; const txDate = new Date(t.date); return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth; }).reduce((sum, t) => sum + t.amount, 0), [transactions, currentYear, currentMonth]);
  const remainingBudget = dynamicMonthlyBudget - totalMonthlyExpense;
  const budgetProgress = dynamicMonthlyBudget > 0 ? Math.min(100, (totalMonthlyExpense / dynamicMonthlyBudget) * 100) : 0;

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className={`${isDarkMode ? 'bg-neutral-950 border-lime-500/50 shadow-[0_0_20px_rgba(132,204,22,0.15)]' : 'bg-white border-lime-500 shadow-xl shadow-lime-500/20'} border rounded-3xl p-6 relative overflow-hidden transition-all duration-300`}>
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-10 -mt-10 ${isDarkMode ? 'bg-lime-500/10' : 'bg-lime-500/20'}`}></div>
        <p className={`text-xs font-mono tracking-widest uppercase mb-2 ${isDarkMode ? 'text-lime-400/80' : 'text-lime-700'}`}>Total Net Worth</p>
        <h1 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'text-gray-900'}`}>₹ {totalBalance.toLocaleString('en-IN')}</h1>
        <div className={`pt-4 border-t ${isDarkMode ? 'border-neutral-800' : 'border-gray-200'}`}>
          <div className="flex justify-between text-sm mb-3"><div><p className={`mb-1 text-xs ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>Total Income</p><p className={`font-semibold text-lg ${isDarkMode ? 'text-lime-400' : 'text-lime-600'}`}>+₹{income.toLocaleString('en-IN')}</p></div><div className="text-right"><p className={`mb-1 text-xs ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>Monthly Fixed</p><p className="font-semibold text-lg text-red-400">-₹{totalMonthlyObligations.toLocaleString('en-IN')}</p></div></div>
          <div className={`flex justify-between text-sm pt-3 border-t border-dashed ${isDarkMode ? 'border-neutral-800' : 'border-gray-200'}`}><div><p className={`mb-1 text-xs ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>Total Expenses</p><p className="font-semibold text-lg text-red-500">-₹{expense.toLocaleString('en-IN')}</p></div><div className="text-right"><p className={`mb-1 text-xs ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>Invested</p><p className={`font-semibold text-lg ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>₹{investmentFromTx.toLocaleString('en-IN')}</p></div></div>
        </div>
      </div>
      <Card className={`p-5 border-l-4 border-l-lime-500/50 ${isDarkMode ? 'shadow-[0_0_10px_rgba(132,204,22,0.1)]' : ''}`}>
        <h3 className={`text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isDarkMode ? 'text-lime-400' : 'text-lime-700'}`}><Activity size={16} /> {monthName} DISCRETIONARY</h3>
        <div className="flex justify-between text-xs font-mono mb-1"><span className={isDarkMode ? 'text-neutral-400' : 'text-gray-500'}>Spent: <b className={isDarkMode ? 'text-white' : 'text-gray-900'}>₹{totalMonthlyExpense.toLocaleString('en-IN')}</b></span><span className={isDarkMode ? 'text-neutral-400' : 'text-gray-500'}>Left: <b className={`${remainingBudget < 0 ? 'text-red-500' : (isDarkMode ? 'text-lime-400' : 'text-lime-600')}`}>₹{Math.abs(remainingBudget).toLocaleString('en-IN')}</b></span></div>
        <div className={`w-full rounded-full h-3 overflow-hidden ${isDarkMode ? 'bg-neutral-800 shadow-inner shadow-black/50' : 'bg-gray-200'}`}><div className={`h-full transition-all duration-700 ease-out ${remainingBudget < 0 ? 'bg-red-500' : 'bg-lime-500'}`} style={{ width: `${budgetProgress}%` }} /></div>
        <p className={`text-xs mt-2 ${isDarkMode ? 'text-neutral-500' : 'text-gray-500'}`}>Limit: <b className={isDarkMode ? 'text-white' : 'text-gray-800'}>₹{dynamicMonthlyBudget.toLocaleString('en-IN')}</b> <span className="text-[10px] ml-1 opacity-70 italic">(Income - Obligations)</span></p>
      </Card>
      <Card className={`flex items-center justify-between ${isDarkMode ? 'border-lime-500/30' : ''}`}>
        <div className="flex items-center gap-3"><div className={`p-3 rounded-full border ${isDarkMode ? 'bg-lime-500/10 text-lime-400 border-lime-500/20' : 'bg-lime-100 text-lime-700 border-lime-200'}`}><TrendingUp size={24} /></div><div><p className={`text-xs font-bold uppercase tracking-wide ${isDarkMode ? 'text-neutral-500' : 'text-gray-500'}`}>Total Corpus</p>{isEditingInvestment ? (<input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={handleSaveEdit} className={`text-xl font-bold w-32 p-1 rounded-md outline-none border focus:border-lime-500 ${isDarkMode ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-white text-gray-900 border-gray-300'}`} autoFocus />) : (<p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹ {totalInvestment.toLocaleString('en-IN')}</p>)}<p className={`text-xs ${isDarkMode ? 'text-neutral-500' : 'text-gray-500'}`}>(Base: ₹{investmentCorpus.toLocaleString('en-IN')} + Tx: ₹{investmentFromTx.toLocaleString('en-IN')})</p></div></div>
        <button onClick={() => isEditingInvestment ? handleSaveEdit() : setIsEditingInvestment(true)} className={`p-2 rounded-lg transition-colors ${isEditingInvestment ? 'text-black bg-lime-500' : (isDarkMode ? 'text-lime-400 hover:bg-neutral-800' : 'text-lime-700 hover:bg-lime-100')}`}>{isEditingInvestment ? <Check size={16} /> : <Pencil size={16} />}</button>
      </Card>
      <div><h3 className={`text-lg font-bold mb-4 px-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Logs <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span></h3>
        <div className="space-y-3">{recentTx.length === 0 ? <p className={`text-center py-4 text-sm ${isDarkMode ? 'text-neutral-500' : 'text-gray-500'}`}>No activity yet.</p> : recentTx.map(tx => (<div key={tx.id} className="group relative"><Card className={`flex justify-between items-center py-3 transition-colors ${isDarkMode ? 'border-neutral-800 hover:border-lime-500/30' : 'border-gray-100 hover:border-lime-400'}`}><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? (tx.type === 'income' ? 'bg-neutral-800 text-lime-400' : tx.type === 'investment' ? 'bg-neutral-800 text-cyan-400' : 'bg-neutral-800 text-red-400') : (tx.type === 'income' ? 'bg-lime-100 text-lime-700' : tx.type === 'investment' ? 'bg-cyan-100 text-cyan-700' : 'bg-red-100 text-red-700')}`}>{tx.type === 'income' ? <DollarSign size={18} /> : tx.type === 'investment' ? <TrendingUp size={18} /> : <Activity size={18} />}</div><div><p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tx.description}</p><p className={`text-xs ${isDarkMode ? 'text-neutral-500' : 'text-gray-500'}`}>{tx.date} • {tx.source}</p></div></div><p className={`font-mono font-bold ${tx.type === 'income' ? (isDarkMode ? 'text-lime-400' : 'text-lime-600') : tx.type === 'investment' ? (isDarkMode ? 'text-cyan-400' : 'text-cyan-600') : (isDarkMode ? 'text-neutral-200' : 'text-gray-800')}`}>{tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}</p></Card><button onClick={() => deleteTransaction(tx.id)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"><Trash2 size={16} /></button></div>))}</div>
      </div>
    </div>
  );
};

const AddTransaction = ({ onAdd }) => {
  const { isDarkMode } = useTheme();
  const [mode, setMode] = useState('manual');
  const [smsText, setSmsText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [parseStatus, setParseStatus] = useState('idle');
  const [manualForm, setManualForm] = useState({ amount: '', description: '', category: 'Food', type: 'expense' });

  const parseSMS = () => {
    const amountRegex = /(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)/i;
    const merchantRegex = /(?:sent to|debited by|spent|at|to|for)\s+([A-Za-z0-9\s]+?)(?:\s+(?:via|on|ref|bal|for)|$|\.)/i;
    const amountMatch = smsText.match(amountRegex);
    const merchantMatch = smsText.match(merchantRegex);
    if (amountMatch) {
      const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      let description = merchantMatch ? merchantMatch[1].trim() : "Unknown Transaction";
      if (description.length > 50) description = description.substring(0, 50) + '...';
      let category = 'Other'; let type = 'expense'; const smsLower = smsText.toLowerCase();
      if (smsLower.includes('salary') || smsLower.includes('credited')) { category = 'Salary'; type = 'income'; }
      else if (smsLower.includes('sip') || smsLower.includes('investment')) { category = 'Investment'; type = 'investment'; }
      else if (smsLower.includes('swiggy') || smsLower.includes('zomato')) category = 'Food';
      else if (smsLower.includes('uber') || smsLower.includes('ola')) category = 'Transport';
      setParsedData({ amount, description, category, type });
      setParseStatus('success'); setTimeout(() => setParseStatus('idle'), 2000);
    } else { setParseStatus('error'); setTimeout(() => setParseStatus('idle'), 2000); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = parsedData ? { ...parsedData, amount: parseFloat(parsedData.amount), source: 'SMS Parsed' } : { ...manualForm, amount: parseFloat(manualForm.amount), source: 'Manual' };
    if (!data.amount || isNaN(data.amount) || data.amount <= 0) return;
    onAdd({ id: Date.now(), date: new Date().toISOString().split('T')[0], ...data });
    setParsedData(null); setSmsText(''); setManualForm({ amount: '', description: '', category: 'Food', type: 'expense' });
  };
  const inputClass = `w-full p-3 border rounded-xl focus:outline-none focus:border-lime-500 transition-colors ${isDarkMode ? 'border-neutral-700 bg-neutral-950 text-white' : 'border-gray-200 bg-gray-50 text-gray-900'}`;

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><Zap className={isDarkMode ? 'text-lime-400' : 'text-lime-600'} /> New Entry</h2>
      <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-gray-100 border-gray-200'}`}><button onClick={() => { setMode('manual'); setParsedData(null); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'manual' ? 'bg-lime-500 text-black shadow-lg' : (isDarkMode ? 'text-neutral-400' : 'text-gray-500')}`}>Manual</button><button onClick={() => { setMode('sms'); setParsedData(null); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'sms' ? 'bg-lime-500 text-black shadow-lg' : (isDarkMode ? 'text-neutral-400' : 'text-gray-500')}`}>SMS Parse</button></div>
      {mode === 'sms' && (<Card className="space-y-4"><textarea className={inputClass} rows="3" placeholder="Paste transaction text..." value={smsText} onChange={(e) => setSmsText(e.target.value)} /><button type="button" onClick={parseSMS} className={`w-full border py-3 rounded-xl font-bold transition-all duration-300 ${parseStatus === 'error' ? 'bg-red-500 text-white border-red-600' : parseStatus === 'success' ? 'bg-green-500 text-white border-green-600' : isDarkMode ? 'bg-neutral-800 text-lime-400 border-lime-500/50 hover:bg-lime-500 hover:text-black' : 'bg-white text-lime-600 border-lime-300 hover:bg-lime-500 hover:text-white'}`}>{parseStatus === 'error' ? 'FAILED TO PARSE' : parseStatus === 'success' ? 'SUCCESS!' : 'DECODE SMS'}</button></Card>)}
      {(mode === 'manual' || parsedData) && (<form onSubmit={handleSubmit} className="space-y-4 animate-fade-in"><Card className="space-y-4">{parsedData && <div className={`text-xs px-2 py-1 rounded inline-block border font-mono ${isDarkMode ? 'bg-lime-500/20 text-lime-400 border-lime-500/30' : 'bg-lime-100 text-lime-800 border-lime-200'}`}>✓ DATA EXTRACTED</div>}<div><label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-neutral-500' : 'text-gray-500'}`}>Type</label><div className="flex gap-2">{['expense', 'income', 'investment'].map(t => (<button key={t} type="button" onClick={() => parsedData ? setParsedData({ ...parsedData, type: t }) : setManualForm({ ...manualForm, type: t })} className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold uppercase border transition-all ${(parsedData ? parsedData.type : manualForm.type) === t ? (isDarkMode ? 'bg-neutral-800 text-lime-400 border-lime-500' : 'bg-white text-lime-600 border-lime-500') : (isDarkMode ? 'bg-neutral-900 text-neutral-500 border-neutral-800' : 'bg-gray-100 text-gray-500 border-gray-200')}`}>{t}</button>))}</div></div><div><label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-neutral-500' : 'text-gray-500'}`}>Amount</label><div className="relative"><span className={`absolute left-3 top-3 ${isDarkMode ? 'text-neutral-400' : 'text-gray-400'}`}>₹</span><input type="number" name="amount" className={`${inputClass} pl-8 font-mono`} placeholder="0.00" value={parsedData ? parsedData.amount : manualForm.amount} onChange={e => parsedData ? setParsedData({ ...parsedData, amount: e.target.value }) : setManualForm({ ...manualForm, amount: e.target.value })} required /></div></div><div><label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-neutral-500' : 'text-gray-500'}`}>Description</label><input type="text" className={inputClass} placeholder="e.g. Swiggy" value={parsedData ? parsedData.description : manualForm.description} onChange={e => parsedData ? setParsedData({ ...parsedData, description: e.target.value }) : setManualForm({ ...manualForm, description: e.target.value })} required /></div><div><label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-neutral-500' : 'text-gray-500'}`}>Category</label><select className={inputClass} value={parsedData ? parsedData.category : manualForm.category} onChange={e => parsedData ? setParsedData({ ...parsedData, category: e.target.value }) : setManualForm({ ...manualForm, category: e.target.value })}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div><button type="submit" className="w-full bg-lime-500 text-black py-4 rounded-xl font-bold shadow-lg hover:bg-lime-400 active:scale-95 transition-all">SAVE TRANSACTION</button></Card></form>)}
    </div>
  );
};

const Reports = ({ transactions, obligations, setObligations }) => {
  const { isDarkMode } = useTheme();
  const [isEditingObligations, setIsEditingObligations] = useState(false);
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const byCategory = expenses.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
  const sortedCategories = Object.entries(byCategory).sort(([, a], [, b]) => b - a);
  const totalObligations = obligations.reduce((sum, item) => sum + item.amount, 0);
  const handleObligationChange = (id, value) => { setObligations(obligations.map(item => item.id === id ? { ...item, amount: parseFloat(value) || 0 } : item)); };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><PieChart className={isDarkMode ? 'text-lime-400' : 'text-lime-600'} /> Analysis</h2>
      <Card>
        <div className="flex justify-between items-center mb-4"><div><h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-lime-400' : 'text-lime-700'}`}><Receipt size={14} /> Monthly Obligations</h3><p className={`text-xl font-bold font-mono mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{totalObligations.toLocaleString('en-IN')}</p></div><button onClick={() => setIsEditingObligations(!isEditingObligations)} className={`p-2 rounded-lg text-xs font-bold transition-all ${isEditingObligations ? 'bg-lime-500 text-black' : (isDarkMode ? 'bg-neutral-800 text-lime-400' : 'bg-gray-100 text-lime-700')}`}>{isEditingObligations ? <Check size={16} /> : <Pencil size={16} />}</button></div>
        <div className="space-y-3">{isEditingObligations ? obligations.map(item => (<div key={item.id} className="flex items-center gap-3 animate-fade-in"><span className={`text-xs w-1/3 font-medium ${isDarkMode ? 'text-neutral-400' : 'text-gray-600'}`}>{item.label}</span><div className="relative flex-1"><span className={`absolute left-3 top-2.5 text-xs ${isDarkMode ? 'text-neutral-500' : 'text-gray-400'}`}>₹</span><input type="number" value={item.amount} onChange={(e) => handleObligationChange(item.id, e.target.value)} className={`w-full pl-6 p-2 rounded-lg text-sm outline-none border focus:border-lime-500 transition-colors ${isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} /></div></div>)) : (<div className="space-y-2 animate-fade-in">{obligations.filter(o => o.amount > 0).length > 0 ? obligations.filter(o => o.amount > 0).map(item => (<div key={item.id} className="flex justify-between text-sm border-b border-dashed pb-1 last:border-0 border-opacity-20 border-gray-500"><span className={isDarkMode ? 'text-neutral-300' : 'text-gray-600'}>{item.label}</span><span className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{item.amount.toLocaleString('en-IN')}</span></div>)) : <p className={`text-xs italic text-center py-2 ${isDarkMode ? 'text-neutral-600' : 'text-gray-400'}`}>No fixed obligations set. Tap edit to add.</p>}</div>)}</div>
      </Card>
      <Card><h3 className={`text-xs font-bold uppercase tracking-widest mb-6 ${isDarkMode ? 'text-lime-400' : 'text-lime-700'}`}>Expense Breakdown</h3><div className="space-y-4">{sortedCategories.length === 0 ? <p className="text-neutral-500 text-center py-4">No data.</p> : sortedCategories.map(([cat, amount]) => (<div key={cat}><div className="flex justify-between text-sm mb-1"><span className={`font-medium ${isDarkMode ? 'text-neutral-300' : 'text-gray-700'}`}>{cat}</span><span className={`font-bold font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{amount.toLocaleString('en-IN')}</span></div><div className={`h-2 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-200'}`}><div className="h-full bg-lime-500 transition-all duration-700" style={{ width: `${(amount / totalExpense) * 100}%` }} /></div></div>))}</div></Card>
      <div className="grid grid-cols-2 gap-4"><Card className={isDarkMode ? 'bg-neutral-900 border-red-500/20' : 'bg-white border-red-200'}><p className="text-red-500 text-xs font-bold uppercase">Top Drain</p><p className={`text-lg font-bold mt-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{sortedCategories[0]?.[0] || 'N/A'}</p><p className={`text-xs font-mono ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>₹{sortedCategories[0]?.[1]?.toLocaleString('en-IN') || 0}</p></Card><Card className={isDarkMode ? 'bg-neutral-900 border-lime-500/20' : 'bg-white border-lime-200'}><p className={isDarkMode ? 'text-lime-500 text-xs font-bold uppercase' : 'text-lime-600 text-xs font-bold uppercase'}>Avg Transaction</p><p className={`text-lg font-bold mt-1 font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{expenses.length ? Math.round(totalExpense / expenses.length).toLocaleString('en-IN') : 0}</p></Card></div>
    </div>
  );
};

const Goals = ({ goals, setGoals, deleteGoal }) => {
  const { isDarkMode } = useTheme();
  const [newGoal, setNewGoal] = useState({ name: '', target: '', deadline: '' });
  const [showAdd, setShowAdd] = useState(false);
  const calculateMonthly = (target, current, deadline) => { const today = new Date(); const end = new Date(deadline); if (end <= today) return Math.max(0, target - current); let months = (end.getFullYear() - today.getFullYear()) * 12 - today.getMonth() + end.getMonth(); return months <= 0 ? Math.max(0, target - current) : Math.ceil(Math.max(0, target - current) / months); };
  const addGoal = (e) => { e.preventDefault(); if (isNaN(parseFloat(newGoal.target)) || parseFloat(newGoal.target) <= 0) return; setGoals([...goals, { id: Date.now(), ...newGoal, target: parseFloat(newGoal.target), current: 0, type: 'Short Term' }]); setShowAdd(false); setNewGoal({ name: '', target: '', deadline: '' }); };
  const inputClass = `w-full p-2 border rounded-lg text-sm focus:border-lime-500 outline-none ${isDarkMode ? 'border-neutral-700 bg-neutral-950 text-white' : 'border-gray-200 bg-white text-gray-900'}`;

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex justify-between items-center"><h2 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><Target className={isDarkMode ? 'text-lime-400' : 'text-lime-600'} /> Targets</h2><button onClick={() => setShowAdd(!showAdd)} className="bg-lime-500 text-black p-2 rounded-full shadow hover:bg-lime-400 transition-all"><Plus size={20} /></button></div>
      {showAdd && (<Card className={`animate-fade-in border-lime-500 border ${isDarkMode ? '' : 'bg-lime-50/50'}`}><form onSubmit={addGoal} className="space-y-3"><h3 className={`font-bold ${isDarkMode ? 'text-lime-400' : 'text-lime-700'}`}>Set New Target</h3><input placeholder="Goal Name" className={inputClass} value={newGoal.name} onChange={e => setNewGoal({ ...newGoal, name: e.target.value })} required /><input type="number" placeholder="Target Amount (₹)" className={inputClass} value={newGoal.target} onChange={e => setNewGoal({ ...newGoal, target: e.target.value })} required /><input type="date" className={inputClass} value={newGoal.deadline} onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })} required /><button className="w-full bg-lime-500 text-black py-2 rounded-lg font-bold text-sm hover:bg-lime-400">INITIATE TARGET</button></form></Card>)}
      <div className="space-y-4">{goals.length === 0 ? <Card className="text-center py-6"><p className="text-neutral-500">No goals set yet.</p></Card> : goals.map(goal => { const progress = Math.min(100, (goal.current / goal.target) * 100); const monthly = calculateMonthly(goal.target, goal.current, goal.deadline); return (<div key={goal.id} className="group relative"><Card className="border-l-4 border-l-lime-500 shadow-md"><div className="flex justify-between items-start mb-2"><div><h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{goal.name}</h3><p className="text-xs font-mono text-gray-500">DEADLINE: {goal.deadline}</p></div><span className="text-[10px] px-2 py-1 rounded border uppercase bg-gray-100 text-gray-600">{goal.type}</span></div><div className={`w-full rounded-full h-2 mb-2 ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-200'}`}><div className="bg-lime-500 h-2 rounded-full transition-all duration-700" style={{ width: `${progress}%` }}></div></div><div className="flex justify-between text-xs mb-4 font-mono"><span className="text-lime-600">SAVED: ₹{goal.current.toLocaleString('en-IN')}</span><span className="text-gray-500">TARGET: ₹{goal.target.toLocaleString('en-IN')}</span></div><div className={`border p-3 rounded-lg flex items-start gap-2 ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-gray-50 border-gray-200'}`}><AlertCircle className="text-lime-500 shrink-0 mt-0.5" size={16} /><div><p className="text-xs font-bold text-lime-500 mb-1 uppercase">Strategy</p><p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-gray-600'}`}>{monthly > 0 ? `Save ₹${monthly.toLocaleString('en-IN')}/mo to reach target.` : "Goal is complete or passed."}</p></div></div></Card><button onClick={() => deleteGoal(goal.id)} className="absolute right-2 top-2 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button></div>); })}</div>
    </div>
  );
};

const Settings = ({ userProfile, setUserProfile, onLogout, onImport, onExport }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const fileInputRef = useRef(null);
  const dataInputRef = useRef(null); // Ref for the JSON file input

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) { alert("Image too large (max 500KB)"); return; }
      const reader = new FileReader();
      reader.onloadend = () => setUserProfile({ ...userProfile, profileImage: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const inputClass = `w-full p-3 border rounded-xl focus:outline-none focus:border-lime-500 transition-colors ${isDarkMode ? 'border-neutral-700 bg-neutral-950 text-white' : 'border-gray-200 bg-gray-50 text-gray-900'}`;

  // If in editing mode, show the "Separate Page" (simulated by a full-screen view)
  if (isEditingProfile) {
    return (
      <div className="space-y-6 pb-24 animate-fade-in relative">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setIsEditingProfile(false)}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-neutral-800 text-white' : 'bg-white text-gray-900'} shadow-sm`}
          >
            <X size={20} />
          </button>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Profile</h2>
        </div>

        <Card>
          <h3 className={`text-xs font-bold uppercase tracking-widest mb-6 ${isDarkMode ? 'text-lime-400' : 'text-lime-700'}`}>Update Details</h3>

          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className={`w-28 h-28 rounded-full overflow-hidden border-4 ${isDarkMode ? 'border-lime-500/20' : 'border-lime-200'}`}>
                <img src={userProfile.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatarSeed}&mouth=smile`} alt="Profile" className="w-full h-full object-cover bg-neutral-800" />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <div className="absolute -bottom-2 -right-2 flex gap-2">
                <button onClick={() => setUserProfile({ ...userProfile, avatarSeed: Math.random().toString(36).substring(7), profileImage: null })} className={`p-2 rounded-full shadow border ${isDarkMode ? 'bg-neutral-800 text-lime-400 border-lime-500/50' : 'bg-white text-lime-600'}`}><RefreshCw size={16} /></button>
                <button onClick={() => fileInputRef.current.click()} className="p-2 bg-lime-500 text-black rounded-full shadow border border-lime-600"><Camera size={16} /></button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div><label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-neutral-500' : 'text-gray-500'}`}>Display Name</label><input type="text" value={userProfile.name} onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })} className={inputClass} /></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold uppercase mb-1 text-gray-500">DOB</label><input type="date" value={userProfile.dob} onChange={(e) => setUserProfile({ ...userProfile, dob: e.target.value })} className={inputClass} /></div><div><label className="block text-xs font-bold uppercase mb-1 text-gray-500">Gender</label><select value={userProfile.gender} onChange={(e) => setUserProfile({ ...userProfile, gender: e.target.value })} className={inputClass}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select></div></div>
            <button onClick={() => setIsEditingProfile(false)} className="w-full py-3 mt-4 bg-lime-500 text-black font-bold rounded-xl shadow-lg hover:bg-lime-400">Save Changes</button>
          </div>
        </Card>
      </div>
    );
  }

  // Default View (Read-Only Card)
  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><SettingsIcon className={isDarkMode ? 'text-lime-400' : 'text-lime-600'} /> Settings</h2>

      {/* Redesigned Read-Only Profile Card */}
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 ${isDarkMode ? 'bg-lime-500/20' : 'bg-lime-500/30'}`}></div>

        <div className="flex items-center gap-4 relative z-10">
          <div className={`w-20 h-20 rounded-full overflow-hidden border-2 ${isDarkMode ? 'border-lime-500/50' : 'border-lime-500'}`}>
            <img src={userProfile.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatarSeed}&mouth=smile`} alt="Profile" className="w-full h-full object-cover bg-neutral-800" />
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.name}</h3>
            <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>{userProfile.email || 'User Account'}</p>
            <div className="mt-2 flex gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded border ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>{userProfile.gender ? userProfile.gender : 'N/A'}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded border ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>{userProfile.dob ? new Date(userProfile.dob).getFullYear() : 'N/A'}</span>
            </div>
          </div>
          <button
            onClick={() => setIsEditingProfile(true)}
            className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-neutral-800 text-lime-400 hover:bg-neutral-700' : 'bg-gray-100 text-lime-600 hover:bg-gray-200'}`}
          >
            <Pencil size={20} />
          </button>
        </div>
      </Card>

      <Card>
        <h3 className={`text-xs font-bold uppercase tracking-widest mb-6 ${isDarkMode ? 'text-lime-400' : 'text-lime-700'}`}>Data Management</h3>
        <div className="space-y-3">
          <input type="file" ref={dataInputRef} onChange={onImport} accept=".json" className="hidden" />
          <button onClick={onExport} className={`w-full py-3 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-900'}`}>
            <Download size={18} /> Backup Data (Export JSON)
          </button>
          <button onClick={() => dataInputRef.current.click()} className={`w-full py-3 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-900'}`}>
            <Upload size={18} /> Restore Data (Import JSON)
          </button>
        </div>
      </Card>

      <Card>
        <h3 className={`text-xs font-bold uppercase tracking-widest mb-6 ${isDarkMode ? 'text-lime-400' : 'text-lime-700'}`}>App Preferences</h3>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-neutral-800 text-white' : 'bg-gray-100 text-gray-900'}`}>{isDarkMode ? <Moon size={20} /> : <Sun size={20} />}</div>
            <div><p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Appearance</p><p className="text-xs text-gray-500">Toggle Dark Mode</p></div>
          </div>
          <button onClick={toggleTheme} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-lime-500' : 'bg-gray-300'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} /></button>
        </div>
        <button onClick={onLogout} className="w-full py-3 rounded-xl border border-red-500 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"><LogOut size={18} /> Sign Out</button>
      </Card>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION)) || null);

  const [activeTab, setActiveTab] = useState('home');
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [obligations, setObligations] = useState(INITIAL_OBLIGATIONS);
  const [investmentCorpus, setInvestmentCorpus] = useState(0);
  const [userProfile, setUserProfile] = useState({ name: 'User', dob: '', gender: '', avatarSeed: 'Default', profileImage: null });
  const [lastSipUpdateMonth, setLastSipUpdateMonth] = useState(-1);

  // --- Auth Handlers ---
  const handleLogin = (user) => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    setCurrentUser(user);
    loadUserData(user.id);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    setCurrentUser(null);
    setTransactions([]);
    setGoals([]);
  };

  // --- Data Loading & Saving ---
  const loadUserData = (userId) => {
    const suffix = `_${userId}`;
    setTransactions(JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS + suffix)) || INITIAL_TRANSACTIONS);
    setGoals(JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS + suffix)) || INITIAL_GOALS);
    setObligations(JSON.parse(localStorage.getItem(STORAGE_KEYS.OBLIGATIONS + suffix)) || INITIAL_OBLIGATIONS);
    setInvestmentCorpus(JSON.parse(localStorage.getItem(STORAGE_KEYS.CORPUS + suffix)) || 0);
    setUserProfile(JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE + suffix)) || { name: 'User', dob: '', gender: '', avatarSeed: 'Default', profileImage: null });
  };

  useEffect(() => {
    if (currentUser) {
      loadUserData(currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const suffix = `_${currentUser.id}`;
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS + suffix, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.GOALS + suffix, JSON.stringify(goals));
      localStorage.setItem(STORAGE_KEYS.OBLIGATIONS + suffix, JSON.stringify(obligations));
      localStorage.setItem(STORAGE_KEYS.CORPUS + suffix, JSON.stringify(investmentCorpus));
      localStorage.setItem(STORAGE_KEYS.PROFILE + suffix, JSON.stringify(userProfile));
    }
  }, [transactions, goals, obligations, investmentCorpus, userProfile, currentUser]);

  // SIP Auto-Add
  useEffect(() => {
    const today = new Date();
    if (currentUser && today.getDate() === 1 && today.getMonth() !== lastSipUpdateMonth) {
      const sipAmt = obligations.find(o => o.id === 'sip')?.amount || 0;
      if (sipAmt > 0) { setInvestmentCorpus(prev => prev + sipAmt); setLastSipUpdateMonth(today.getMonth()); }
    }
  }, [obligations, lastSipUpdateMonth, currentUser]);

  // --- Backup & Restore Logic ---
  const handleExportData = () => {
    if (!currentUser) return;
    const dataToExport = {
      user: currentUser,
      profile: userProfile,
      transactions,
      goals,
      obligations,
      investmentCorpus,
      timestamp: new Date().toISOString(),
      appVersion: '3.0'
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fintrack_backup_${currentUser.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        // Basic validation
        if (!importedData.appVersion || !importedData.transactions) {
          alert("Invalid backup file.");
          return;
        }

        if (window.confirm("Restoring data will overwrite your current session. Continue?")) {
          setTransactions(importedData.transactions || []);
          setGoals(importedData.goals || []);
          setObligations(importedData.obligations || INITIAL_OBLIGATIONS);
          setInvestmentCorpus(importedData.investmentCorpus || 0);
          setUserProfile(importedData.profile || userProfile);
          alert("Data restored successfully!");
        }
      } catch (err) {
        alert("Error parsing backup file.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const totalBalance = useMemo(() => transactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0), [transactions]);
  const investmentFromTx = useMemo(() => transactions.filter(t => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalInvestment = investmentCorpus + investmentFromTx;

  const handleAddTransaction = (newTx) => { setTransactions([newTx, ...transactions]); setActiveTab('home'); };
  const handleDeleteTransaction = (id) => { if (window.confirm("Delete transaction?")) setTransactions(transactions.filter(t => t.id !== id)); };
  const handleDeleteGoal = (id) => { if (window.confirm("Delete goal?")) setGoals(goals.filter(g => g.id !== id)); };

  const tabItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'reports', icon: PieChart, label: 'Stats' },
    { id: 'add', icon: Plus, label: 'Add' },
    { id: 'goals', icon: Target, label: 'Goals' },
    { id: 'settings', icon: SettingsIcon, label: 'Profile' },
  ];

  const themeValue = useMemo(() => ({ isDarkMode, toggleTheme: () => setIsDarkMode(!isDarkMode) }), [isDarkMode]);

  // 6. CONDITIONAL RENDERING (The Gatekeeper)
  if (!currentUser) {
    return <Login onLogin={handleLogin} theme={isDarkMode ? 'dark' : 'light'} />;
  }

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className={`max-w-md mx-auto h-screen flex flex-col font-sans overflow-hidden border-x relative transition-colors duration-300 ${isDarkMode ? 'bg-black border-neutral-800' : 'bg-gray-50 border-gray-200'}`}>
        <header className={`backdrop-blur-md p-4 border-b z-20 flex justify-between items-center sticky top-0 transition-colors ${isDarkMode ? 'bg-black/90 border-neutral-800' : 'bg-white/90 border-gray-200'}`}>
          <FinTrackLogo />
          <button onClick={() => setActiveTab('settings')} className={`w-10 h-10 rounded-full overflow-hidden border-2 cursor-pointer transition-colors ${isDarkMode ? 'bg-neutral-800 border-lime-500/50' : 'bg-gray-200 border-lime-500'}`}>
            <img src={userProfile.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatarSeed}&mouth=smile`} alt="Profile" className="w-full h-full object-cover" />
          </button>
        </header>
        <main className={`flex-1 overflow-y-auto p-4 z-10 scrollbar-hide ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
          {activeTab === 'home' && <Dashboard transactions={transactions} totalBalance={totalBalance} obligations={obligations} totalInvestment={totalInvestment} investmentCorpus={investmentCorpus} setInvestmentCorpus={setInvestmentCorpus} deleteTransaction={handleDeleteTransaction} />}
          {activeTab === 'add' && <AddTransaction onAdd={handleAddTransaction} />}
          {activeTab === 'reports' && <Reports transactions={transactions} obligations={obligations} setObligations={setObligations} />}
          {activeTab === 'goals' && <Goals goals={goals} setGoals={setGoals} deleteGoal={handleDeleteGoal} />}
          {activeTab === 'settings' && <Settings userProfile={userProfile} setUserProfile={setUserProfile} onLogout={handleLogout} onImport={handleImportData} onExport={handleExportData} />}
        </main>
        <nav className={`fixed bottom-0 left-0 right-0 mx-auto max-w-md backdrop-blur-xl border-t z-30 p-2 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] transition-colors ${isDarkMode ? 'bg-neutral-950/90 border-neutral-800' : 'bg-white/90 border-gray-200'}`}>
          <div className="flex justify-around items-center">
            {tabItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center flex-1 py-2 rounded-xl transition-all ${activeTab === item.id ? (isDarkMode ? 'text-lime-400' : 'text-lime-600') : (isDarkMode ? 'text-neutral-500' : 'text-gray-400')}`}>
                <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 1.5} />
                <span className={`text-[10px] font-bold mt-0.5 ${activeTab === item.id ? (isDarkMode ? 'text-lime-400' : 'text-lime-600') : (isDarkMode ? 'text-neutral-500' : 'text-gray-400')}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </ThemeContext.Provider>
  );
}