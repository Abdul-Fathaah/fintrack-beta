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
import { supabase } from './utils/supabaseClient';

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

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [obligations, setObligations] = useState<Obligation[]>(INITIAL_OBLIGATIONS);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [draftTx, setDraftTx] = useState<{ amount: number | ''; text: string; type: 'income' | 'expense' | 'investment' } | null>(null);

  // Sync profile changes to Supabase
  useEffect(() => {
    if (!currentUser || !userProfile) return;

    const saveProfileData = async () => {
      await supabase.from('profiles').upsert({
        id: currentUser.id,
        name: userProfile.name,
        email: userProfile.email || currentUser.email,
        monthly_savings_target: userProfile.monthlySavingsTarget,
      });
    };
    saveProfileData();
  }, [userProfile, currentUser]);

  // Debounced sync for obligations changes
  useEffect(() => {
    if (!currentUser) return;

    const handler = setTimeout(async () => {
      try {
        // Fetch current obligations from DB to check for deletions
        const { data: dbObligations } = await supabase
          .from('obligations')
          .select('id')
          .eq('user_id', currentUser.id);

        if (dbObligations) {
          const currentIds = obligations.map((o) => o.id);
          const idsToDelete = dbObligations.filter((o) => !currentIds.includes(o.id)).map((o) => o.id);
          if (idsToDelete.length > 0) {
            await supabase.from('obligations').delete().in('id', idsToDelete);
          }
        }

        // Upsert current obligations
        if (obligations.length > 0) {
          await supabase.from('obligations').upsert(
            obligations.map((o) => ({
              id: o.id,
              user_id: currentUser.id,
              label: o.label,
              amount: o.amount,
              is_recurring: o.isRecurring,
            }))
          );
        }
      } catch (err) {
        console.error('Error syncing obligations to Supabase:', err);
      }
    }, 800);

    return () => clearTimeout(handler);
  }, [obligations, currentUser]);

  const loadUserData = async (authInst: any) => {
    setLoading(true);
    const userObj: User = {
      id: authInst.id,
      name: authInst.user_metadata?.name || 'User',
      email: authInst.email || '',
      joined: new Date(authInst.created_at).toLocaleDateString(),
    };
    setCurrentUser(userObj);

    try {
      // 1. Load Profile
      let profile: UserProfile = { name: userObj.name, email: userObj.email, monthlySavingsTarget: 0 };
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authInst.id)
        .single();

      if (profileData) {
        profile = {
          name: profileData.name,
          email: profileData.email,
          monthlySavingsTarget: Number(profileData.monthly_savings_target) || 0,
        };
      } else {
        await supabase.from('profiles').insert({
          id: authInst.id,
          name: userObj.name,
          email: userObj.email,
          monthly_savings_target: 0,
        });
      }
      setUserProfile(profile);

      // 2. Load Obligations
      const { data: obligationsData } = await supabase
        .from('obligations')
        .select('*')
        .eq('user_id', authInst.id);

      let loadedObligations = INITIAL_OBLIGATIONS;
      if (obligationsData && obligationsData.length > 0) {
        loadedObligations = obligationsData.map((o) => ({
          id: o.id,
          label: o.label,
          amount: Number(o.amount) || 0,
          isRecurring: o.is_recurring,
        }));
      }
      setObligations(loadedObligations);

      // 3. Load Transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', authInst.id)
        .order('date', { ascending: true });

      let loadedTransactions = INITIAL_TRANSACTIONS;
      if (transactionsData && transactionsData.length > 0) {
        loadedTransactions = transactionsData.map((t) => ({
          id: t.id,
          amount: Number(t.amount) || 0,
          text: t.text,
          type: t.type as 'income' | 'expense' | 'investment',
          category: t.category,
          date: t.date,
        }));
      }
      setTransactions(loadedTransactions);

      // 4. Run Legacy Migration Check
      await runLegacyMigration(userObj.email, authInst.id, loadedTransactions, loadedObligations, profile);
    } catch (err) {
      console.error('Error loading user data from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  const runLegacyMigration = async (
    email: string,
    newUserId: string,
    currentTransactions: Transaction[],
    currentObligations: Obligation[],
    currentProfile: UserProfile
  ) => {
    try {
      const usersDbRaw = localStorage.getItem('ft_client_users_db');
      if (!usersDbRaw) return;

      const users: any[] = JSON.parse(usersDbRaw);
      const legacyUser = users.find((u) => u.email === email);
      if (!legacyUser) return;

      const legacyUserId = legacyUser.id;
      const suffix = `_${legacyUserId}`;

      const legacyTxRaw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS + suffix);
      const legacyOblRaw = localStorage.getItem(STORAGE_KEYS.OBLIGATIONS + suffix);
      const legacyProfileRaw = localStorage.getItem(STORAGE_KEYS.PROFILE + suffix);

      let migratedCount = 0;

      // Migrate profile savings target if local exists and cloud target is 0
      if (legacyProfileRaw && currentProfile.monthlySavingsTarget === 0) {
        const legacyProfile = JSON.parse(legacyProfileRaw);
        if (legacyProfile.monthlySavingsTarget > 0) {
          const updatedProfile = { ...currentProfile, monthlySavingsTarget: legacyProfile.monthlySavingsTarget };
          setUserProfile(updatedProfile);
          await supabase.from('profiles').upsert({
            id: newUserId,
            name: updatedProfile.name,
            email: updatedProfile.email || email,
            monthly_savings_target: updatedProfile.monthlySavingsTarget,
          });
          migratedCount++;
        }
      }

      // Migrate transactions if local exists and cloud database is empty
      if (legacyTxRaw && currentTransactions.length === 0) {
        const legacyTx: any[] = JSON.parse(legacyTxRaw);
        if (legacyTx.length > 0) {
          const txsToInsert = legacyTx.map((t) => ({
            id: crypto.randomUUID(),
            user_id: newUserId,
            amount: Number(t.amount) || 0,
            text: t.text || 'Imported Transaction',
            type: t.type,
            category: t.category || 'Other',
            date: t.date ? t.date.split('T')[0] : new Date().toISOString().split('T')[0],
          }));

          const { error } = await supabase.from('transactions').insert(txsToInsert);
          if (!error) {
            setTransactions(
              txsToInsert.map((t) => ({
                id: t.id,
                amount: t.amount,
                text: t.text,
                type: t.type,
                category: t.category,
                date: t.date,
              }))
            );
            migratedCount++;
          }
        }
      }

      // Migrate obligations if local exists and cloud database has default values
      if (legacyOblRaw && currentObligations.length <= INITIAL_OBLIGATIONS.length) {
        const legacyObl: any[] = JSON.parse(legacyOblRaw);
        const hasLegacyValues = legacyObl.some((o) => o.amount > 0);
        if (hasLegacyValues) {
          const obsToUpsert = legacyObl.map((o) => ({
            id: crypto.randomUUID(),
            user_id: newUserId,
            label: o.label,
            amount: Number(o.amount) || 0,
            is_recurring: o.isRecurring ?? true,
          }));

          const { error } = await supabase.from('obligations').upsert(obsToUpsert);
          if (!error) {
            setObligations(
              obsToUpsert.map((o) => ({
                id: o.id,
                label: o.label,
                amount: o.amount,
                isRecurring: o.is_recurring,
              }))
            );
            migratedCount++;
          }
        }
      }

      if (migratedCount > 0) {
        console.log(`Legacy migration successful. Cleaned up legacy localStorage keys.`);
        localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS + suffix);
        localStorage.removeItem(STORAGE_KEYS.OBLIGATIONS + suffix);
        localStorage.removeItem(STORAGE_KEYS.PROFILE + suffix);

        const updatedUsers = users.filter((u) => u.email !== email);
        if (updatedUsers.length > 0) {
          localStorage.setItem('ft_client_users_db', JSON.stringify(updatedUsers));
        } else {
          localStorage.removeItem('ft_client_users_db');
        }
      }
    } catch (e) {
      console.error('Failed to run legacy data migration:', e);
    }
  };

  // Listen to Auth State Changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        loadUserData(session.user);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setTransactions(INITIAL_TRANSACTIONS);
        setObligations(INITIAL_OBLIGATIONS);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    navigate('/home');
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserProfile(null);
    setTransactions(INITIAL_TRANSACTIONS);
    setObligations(INITIAL_OBLIGATIONS);
    setLoading(false);
    navigate('/login');
  };

  const handleAddTransaction = async (tx: Transaction) => {
    setTransactions((prev) => [...prev, tx]);
    if (currentUser) {
      try {
        await supabase.from('transactions').insert({
          id: tx.id,
          user_id: currentUser.id,
          amount: tx.amount,
          text: tx.text,
          type: tx.type,
          category: tx.category,
          date: tx.date.split('T')[0],
        });
      } catch (err) {
        console.error('Error inserting transaction into Supabase:', err);
      }
    }
  };

  const totalBalance = useMemo(() => transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0), [transactions]);

  const handleSmartAdd = (data: { amount: number | ''; text: string; type: 'income' | 'expense' | 'investment' }) => {
    setDraftTx(data);
    setShowAddModal(true);
  };

  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/home') || path === '/') return 'home';
    if (path.startsWith('/analysis')) return 'analysis';
    if (path.startsWith('/obligations')) return 'obligations';
    if (path.startsWith('/settings')) return 'settings';
    return '';
  }, [location.pathname]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans ${isDarkMode ? 'bg-neutral-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium opacity-70">Synchronizing with FinTrack Cloud...</p>
        </div>
      </div>
    );
  }

  if (!currentUser && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-neutral-950 text-white' : 'bg-gray-50 text-gray-900'} font-sans selection:bg-lime-500/30`}>
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
                <SettingsTab userProfile={userProfile} setUserProfile={setUserProfile} logout={handleLogout} currentUser={currentUser} transactions={transactions} obligations={obligations} />
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
                      ? isDarkMode ? 'text-lime-400 bg-neutral-900' : 'text-lime-600 bg-lime-55'
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
              onAdd={handleAddTransaction}
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
