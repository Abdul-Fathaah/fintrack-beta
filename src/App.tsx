import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, LogOut } from 'lucide-react';
import { Login } from './Login';
import { HomeTab } from './tabs/HomeTab';
import { AnalysisTab } from './tabs/AnalysisTab';
import { AddTransactionModal } from './components/AddTransactionModal';
import { FinTrackLogo } from './components/FinTrackLogo';
import { ThemeContext } from './hooks/useTheme';
import { Transaction, User } from './types';
import { supabase } from './utils/supabaseClient';

const THEME_KEY = 'ft_theme_v1';

const App: React.FC = () => {
  const { pathname } = useLocation();

  // ── Theme ──────────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const s = localStorage.getItem(THEME_KEY);
    return s ? JSON.parse(s) : true;
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((p) => !p);

  // ── Auth / state ───────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load user data from Supabase ───────────────────────
  const loadUserData = async (authUser: any) => {
    if (!authUser?.id) { setLoading(false); return; }

    setLoading(true);
    setCurrentUser({
      id: authUser.id,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      joined: new Date(authUser.created_at).toLocaleDateString(),
    });

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', authUser.id)
        .order('date', { ascending: true });

      if (error) throw error;

      setTransactions(
        (data ?? []).map((t) => ({
          id: t.id,
          amount: Number(t.amount) || 0,
          text: t.text || 'Transaction',
          type: ['income', 'expense', 'investment'].includes(t.type) ? t.type : 'expense',
          category: t.category || 'Other',
          date: t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        }))
      );
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Auth listener ──────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUserData(session.user);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        loadUserData(session.user);
      } else {
        setCurrentUser(null);
        setTransactions([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Transaction handlers ───────────────────────────────
  const handleAddTransaction = async (tx: Transaction) => {
    setTransactions((prev) => [...prev, tx]);
    if (!currentUser) return;

    const { error } = await supabase.from('transactions').insert({
      id: tx.id,
      user_id: currentUser.id,
      amount: tx.amount,
      text: tx.text,
      type: tx.type,
      category: tx.category,
      date: tx.date,
    });

    if (error) {
      setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
      showToast('Failed to save transaction', 'error');
    } else {
      showToast('Transaction saved');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const prev = transactions;
    setTransactions((t) => t.filter((tx) => tx.id !== id));
    if (!currentUser) return;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id);

    if (error) {
      setTransactions(prev);
      showToast('Failed to delete transaction', 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setTransactions([]);
  };

  // ── Derived ────────────────────────────────────────────
  const totalBalance = useMemo(
    () => transactions.reduce((acc, t) =>
      t.type === 'income' ? acc + t.amount : t.type === 'expense' ? acc - t.amount : acc, 0),
    [transactions]
  );

  const dm = isDarkMode;

  // ── Loading screen ─────────────────────────────────────
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dm ? 'bg-neutral-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm opacity-50">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className={`min-h-screen transition-colors duration-300 font-sans ${dm ? 'bg-neutral-950 text-white' : 'bg-gray-50 text-gray-900'}`}>

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-lg border text-sm font-semibold transition-all ${
            toast.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-lime-500/10 border-lime-500/30 text-lime-400'
          }`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        {currentUser && (
          <header className={`fixed top-0 w-full z-40 px-5 py-3.5 flex justify-between items-center border-b backdrop-blur-md ${
            dm ? 'bg-neutral-950/80 border-neutral-900' : 'bg-white/80 border-gray-200'
          }`}>
            <FinTrackLogo />
            <div className="flex items-center gap-2">
              <nav className="flex items-center gap-3">
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    pathname === '/'
                      ? dm
                        ? 'bg-neutral-800 text-neutral-100'
                        : 'bg-lime-500 text-black'
                      : dm
                      ? 'hover:bg-neutral-800 text-neutral-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/analysis"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    pathname === '/analysis'
                      ? dm
                        ? 'bg-neutral-800 text-neutral-100'
                        : 'bg-lime-500 text-black'
                      : dm
                      ? 'hover:bg-neutral-800 text-neutral-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  Analysis
                </Link>
              </nav>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all ${dm ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-gray-100 text-gray-500'}`}
                title="Toggle theme"
              >
                {dm ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={handleLogout}
                className={`p-2 rounded-xl transition-all ${dm ? 'hover:bg-neutral-800 text-neutral-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-500 hover:text-red-500'}`}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </header>
        )}

        {/* Main */}
        <main className={currentUser ? 'pt-20 px-4 max-w-lg mx-auto' : ''}>
          <Routes>
            <Route
              path="/login"
              element={currentUser
                ? <Navigate to="/" replace />
                : <Login onLogin={() => {}} theme={dm ? 'dark' : 'light'} />}
            />
            <Route
              path="/analysis"
              element={currentUser
                ? <AnalysisTab transactions={transactions} />
                : <Navigate to="/login" replace />}
            />
            <Route
              path="/"
              element={currentUser
                ? <HomeTab
                    transactions={transactions}
                    totalBalance={totalBalance}
                    onDeleteTransaction={handleDeleteTransaction}
                    onAddClick={() => setShowAddModal(true)}
                  />
                : <Navigate to="/login" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Add modal */}
        {currentUser && (
          <AddTransactionModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddTransaction}
          />
        )}
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
