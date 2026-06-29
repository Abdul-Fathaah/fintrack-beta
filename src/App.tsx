import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  Plus, Home, FileText, LayoutDashboard, Settings as SettingsIcon
} from 'lucide-react';
import { Login } from './Login';
import { HomeTab } from './tabs/HomeTab';
import { AnalysisTab } from './tabs/AnalysisTab';
import { DashboardTab } from './tabs/DashboardTab';
import { SettingsTab } from './tabs/SettingsTab';
import { FinTrackLogo } from './components/FinTrackLogo';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ThemeContext } from './hooks/useTheme';
import { Transaction, Obligation, User, UserProfile } from './types';

export const STORAGE_KEYS = {
  TRANSACTIONS: 'ft_client_transactions_v1',
  GOALS: 'ft_client_goals_v1',
  OBLIGATIONS: 'ft_client_obligations_v1',
  CORPUS: 'ft_client_corpus_v1',
  PROFILE: 'ft_client_profile_v1',
  SESSION: 'ft_client_session_v1',
  THEME: 'ft_client_theme_v1',
};

const INITIAL_TRANSACTIONS: Transaction[] = [];
const INITIAL_OBLIGATIONS: Obligation[] = [
  { id: 'homeLoan', label: 'Home Loan', amount: 0, isRecurring: true },
  { id: 'sip', label: 'SIP (Auto-Invest)', amount: 0, isRecurring: true },
  { id: 'rent', label: 'Rent', amount: 0, isRecurring: true },
  { id: 'internet', label: 'Internet / WiFi', amount: 0, isRecurring: true },
  { id: 'utility', label: 'Electricity / Water', amount: 0, isRecurring: true },
];
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Investment', 'Salary', 'Other'];

export const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(isDarkMode));
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
    return savedSession ? JSON.parse(savedSession) : null;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (savedSession) {
      const user = JSON.parse(savedSession);
      const suffix = `_${user.id}`;
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE + suffix) || 'null') || { name: user.name || 'User', email: user.email, monthlySavingsTarget: 0 };
    }
    return null;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (savedSession) {
      const user = JSON.parse(savedSession);
      const suffix = `_${user.id}`;
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS + suffix) || 'null') || INITIAL_TRANSACTIONS;
    }
    return INITIAL_TRANSACTIONS;
  });

  const [obligations, setObligations] = useState<Obligation[]>(() => {
    const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (savedSession) {
      const user = JSON.parse(savedSession);
      const suffix = `_${user.id}`;
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.OBLIGATIONS + suffix) || 'null') || INITIAL_OBLIGATIONS;
    }
    return INITIAL_OBLIGATIONS;
  });

  const [draftTx, setDraftTx] = useState<{ amount: number | ''; text: string; type: 'income' | 'expense' | 'investment' } | null>(null);

  const loadUserData = (user: User) => {
    const suffix = `_${user.id}`;
    setTransactions(JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS + suffix) || 'null') || INITIAL_TRANSACTIONS);
    setObligations(JSON.parse(localStorage.getItem(STORAGE_KEYS.OBLIGATIONS + suffix) || 'null') || INITIAL_OBLIGATIONS);
    setUserProfile(JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE + suffix) || 'null') || { name: user.name || 'User', email: user.email, monthlySavingsTarget: 0 });
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    loadUserData(user);
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    navigate('/home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    navigate('/login');
  };

  useEffect(() => {
    if (currentUser) {
      const suffix = `_${currentUser.id}`;
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS + suffix, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.OBLIGATIONS + suffix, JSON.stringify(obligations));
      if (userProfile) localStorage.setItem(STORAGE_KEYS.PROFILE + suffix, JSON.stringify(userProfile));
    }
  }, [transactions, obligations, userProfile, currentUser]);

  const totalBalance = useMemo(() => transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0), [transactions]);

  const handleSmartAdd = (data: { amount: number | ''; text: string; type: 'income' | 'expense' | 'investment' }) => {
    setDraftTx(data);
    setShowAddModal(true);
  };

  // Determine active tab/route
  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/home') || path === '/') return 'home';
    if (path.startsWith('/analysis')) return 'analysis';
    if (path.startsWith('/obligations')) return 'obligations';
    if (path.startsWith('/settings')) return 'settings';
    return '';
  }, [location.pathname]);

  if (!currentUser && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-neutral-950 text-white' : 'bg-gray-55 text-gray-900'} font-sans selection:bg-lime-500/30`}>
        {currentUser && (
          <header className={`fixed top-0 w-full z-40 px-6 py-4 flex justify-between items-center ${isDarkMode ? 'bg-neutral-950/80' : 'bg-white/80'} backdrop-blur-md border-b ${isDarkMode ? 'border-neutral-900' : 'border-gray-200'}`}>
            <FinTrackLogo />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isDarkMode ? 'bg-neutral-800 text-lime-400' : 'bg-lime-100 text-lime-600'}`}>
              {userProfile?.name?.charAt(0) || 'U'}
            </div>
          </header>
        )}

        <main className={currentUser ? "pt-24 px-4 max-w-lg mx-auto min-h-screen" : "min-h-screen"}>
          <Routes>
            <Route path="/login" element={
              currentUser ? <Navigate to="/home" replace /> : <Login onLogin={handleLogin} theme={isDarkMode ? 'dark' : 'light'} />
            } />
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={
              <HomeTab transactions={transactions} totalBalance={totalBalance} obligations={obligations} monthlySavingsTarget={userProfile?.monthlySavingsTarget || 0} onSmartAdd={handleSmartAdd} />
            } />
            <Route path="/analysis" element={<AnalysisTab transactions={transactions} />} />
            <Route path="/obligations" element={<DashboardTab obligations={obligations} setObligations={setObligations} />} />
            <Route path="/settings" element={
              userProfile && currentUser ? (
                <SettingsTab userProfile={userProfile} setUserProfile={setUserProfile} logout={handleLogout} currentUser={currentUser} />
              ) : <Navigate to="/login" replace />
            } />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>

        {currentUser && (
          <>
            <button
              onClick={() => { setDraftTx(null); setShowAddModal(true); }}
              className="fixed right-6 bottom-24 z-40 bg-lime-500 hover:bg-lime-400 text-black p-4 rounded-full shadow-[0_0_20px_rgba(132,204,22,0.4)] transition-transform hover:scale-105 active:scale-95"
            >
              <Plus size={28} strokeWidth={2.5} />
            </button>

            <nav className={`fixed bottom-0 w-full pb-safe z-40 border-t ${isDarkMode ? 'bg-neutral-950 border-neutral-900' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center p-2 max-w-lg mx-auto px-6">
                <button
                  onClick={() => navigate('/home')}
                  className={`p-4 rounded-2xl transition-all ${
                    activeTab === 'home'
                      ? isDarkMode ? 'text-lime-400 bg-neutral-900' : 'text-lime-600 bg-lime-50'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                </button>
                <button
                  onClick={() => navigate('/analysis')}
                  className={`p-4 rounded-2xl transition-all ${
                    activeTab === 'analysis'
                      ? isDarkMode ? 'text-lime-400 bg-neutral-900' : 'text-lime-600 bg-lime-50'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <FileText size={24} strokeWidth={activeTab === 'analysis' ? 2.5 : 2} />
                </button>
                <button
                  onClick={() => navigate('/obligations')}
                  className={`p-4 rounded-2xl transition-all ${
                    activeTab === 'obligations'
                      ? isDarkMode ? 'text-lime-400 bg-neutral-900' : 'text-lime-600 bg-lime-50'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <LayoutDashboard size={24} strokeWidth={activeTab === 'obligations' ? 2.5 : 2} />
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className={`p-4 rounded-2xl transition-all ${
                    activeTab === 'settings'
                      ? isDarkMode ? 'text-lime-400 bg-neutral-900' : 'text-lime-600 bg-lime-50'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <SettingsIcon size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
                </button>
              </div>
            </nav>

            <AddTransactionModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onAdd={(tx) => setTransactions((prev) => [...prev, tx])}
              categories={CATEGORIES}
              initialData={draftTx}
            />
          </>
        )}
      </div>
    </ThemeContext.Provider>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
