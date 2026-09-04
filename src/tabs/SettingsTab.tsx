import React, { useState } from 'react';
import {
  ChevronLeft,
  Pencil,
  Download,
  Upload,
  Moon,
  Sun,
  LogOut,
  Sparkles,
  Cpu,
  Check
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useTheme } from '../hooks/useTheme';
import { User, UserProfile, Transaction, Obligation } from '../types';
import { supabase } from '../utils/supabaseClient';

interface SettingsTabProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  logout: () => void;
  currentUser: User;
  transactions: Transaction[];
  obligations: Obligation[];
  isAutoDetectEnabled?: boolean;
  toggleAutoDetect?: () => void;
  onOpenSimulate?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  userProfile,
  setUserProfile,
  logout,
  currentUser,
  transactions,
  obligations,
  isAutoDetectEnabled = true,
  toggleAutoDetect,
  onOpenSimulate,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editEmail, setEditEmail] = useState(userProfile.email || '');
  const [editSavingsTarget, setEditSavingsTarget] = useState<string>(
    userProfile.monthlySavingsTarget?.toString() || '0'
  );

  const [osApiKey, setOsApiKey] = useState<string>(
    () => localStorage.getItem('ft_os_llm_api_key') || ''
  );
  const [osProvider, setOsProvider] = useState<'groq' | 'openrouter'>(
    () => (localStorage.getItem('ft_os_llm_provider') as any) || 'groq'
  );
  const [showKeySaved, setShowKeySaved] = useState(false);

  const saveAiSettings = () => {
    localStorage.setItem('ft_os_llm_api_key', osApiKey.trim());
    localStorage.setItem('ft_os_llm_provider', osProvider);
    setShowKeySaved(true);
    setTimeout(() => setShowKeySaved(false), 2500);
  };

  const saveProfile = () => {
    setUserProfile({
      ...userProfile,
      name: editName,
      email: editEmail,
      monthlySavingsTarget: parseFloat(editSavingsTarget) || 0,
    });
    setIsEditingProfile(false);
  };

  const handleExport = () => {
    const data = {
      profile: userProfile,
      transactions: transactions,
      obligations: obligations,
    };
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    link.download = `fintrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const resultText = event.target?.result as string;
        const data = JSON.parse(resultText);
        
        // 1. Sync Profile
        if (data.profile) {
          await supabase.from('profiles').upsert({
            id: currentUser.id,
            name: data.profile.name,
            email: data.profile.email || currentUser.email,
            monthly_savings_target: data.profile.monthlySavingsTarget || 0,
          });
        }
        
        // 2. Sync Obligations
        if (data.obligations && Array.isArray(data.obligations)) {
          await supabase.from('obligations').delete().eq('user_id', currentUser.id);
          const obsToInsert = data.obligations.map((o: any) => ({
            id: crypto.randomUUID(),
            user_id: currentUser.id,
            label: o.label,
            amount: o.amount || 0,
            is_recurring: o.isRecurring ?? true,
          }));
          await supabase.from('obligations').insert(obsToInsert);
        }

        // 3. Sync Transactions
        if (data.transactions && Array.isArray(data.transactions)) {
          await supabase.from('transactions').delete().eq('user_id', currentUser.id);
          const txsToInsert = data.transactions.map((t: any) => ({
            id: crypto.randomUUID(),
            user_id: currentUser.id,
            amount: t.amount || 0,
            text: t.text || 'Imported',
            type: t.type,
            category: t.category || 'Other',
            date: t.date ? t.date.split('T')[0] : new Date().toISOString().split('T')[0],
          }));
          await supabase.from('transactions').insert(txsToInsert);
        }

        alert('Import successful! Reloading...');
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert('Invalid backup file or sync error.');
      }
    };
    reader.readAsText(file);
  };

  if (isEditingProfile) {
    return (
      <div className="animate-fade-in pb-24">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setIsEditingProfile(false)}
            className={`p-2 rounded-full ${
              isDarkMode ? 'bg-neutral-800 text-white' : 'bg-white text-gray-900 shadow-sm'
            }`}
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Edit Profile
          </h2>
        </div>
        <Card className="space-y-6">
          <div>
            <label
              className={`block text-xs font-medium mb-2 ${
                isDarkMode ? 'text-neutral-400' : 'text-gray-500'
              }`}
            >
              Full Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={`w-full p-3 rounded-xl border outline-none ${
                isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label
              className={`block text-xs font-medium mb-2 ${
                isDarkMode ? 'text-neutral-400' : 'text-gray-500'
              }`}
            >
              Email
            </label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className={`w-full p-3 rounded-xl border outline-none ${
                isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div className="pt-4 border-t border-dashed border-neutral-700">
            <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-lime-400' : 'text-lime-600'}`}>
              Financial Goals
            </h3>
            <label
              className={`block text-xs font-medium mb-2 ${
                isDarkMode ? 'text-neutral-400' : 'text-gray-500'
              }`}
            >
              Minimum Monthly Savings Target
            </label>
            <input
              type="number"
              value={editSavingsTarget === '0' ? '' : editSavingsTarget}
              onChange={(e) => setEditSavingsTarget(e.target.value)}
              placeholder="0"
              className={`w-full p-3 pl-4 rounded-xl border outline-none ${
                isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <button
            onClick={saveProfile}
            className="w-full py-4 bg-lime-500 hover:bg-lime-400 text-black font-bold rounded-xl mt-4 animate-pulse-subtle"
          >
            Save Changes
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div
        className={`relative overflow-hidden rounded-3xl p-6 ${
          isDarkMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-gray-200 shadow-sm'
        }`}
      >
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${
                isDarkMode ? 'bg-neutral-700 text-lime-400' : 'bg-lime-100 text-lime-600'
              }`}
            >
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {userProfile.name}
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
                {userProfile.email || 'No email set'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditName(userProfile.name);
              setEditEmail(userProfile.email || '');
              setEditSavingsTarget(userProfile.monthlySavingsTarget?.toString() || '0');
              setIsEditingProfile(true);
            }}
            className={`p-2 rounded-full ${
              isDarkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Pencil size={18} className={isDarkMode ? 'text-white' : 'text-gray-700'} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3
          className={`text-sm font-semibold uppercase tracking-wider px-1 ${
            isDarkMode ? 'text-neutral-500' : 'text-gray-500'
          }`}
        >
          Data Management
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 ${
              isDarkMode
                ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Download size={24} className="mb-2 text-lime-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Backup Data
            </span>
          </button>
          <label
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 cursor-pointer ${
              isDarkMode
                ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Upload size={24} className="mb-2 text-blue-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Import Data
            </span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <h3
          className={`text-sm font-semibold uppercase tracking-wider px-1 ${
            isDarkMode ? 'text-neutral-500' : 'text-gray-500'
          }`}
        >
          AI & Smart Automation
        </h3>

        {/* Auto Clipboard Detection Toggle */}
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-lime-500/10 text-lime-400' : 'bg-lime-50 text-lime-600'}`}>
              <Sparkles size={20} />
            </div>
            <div>
              <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Auto-Detect Transactions
              </p>
              <p className="text-[11px] opacity-60">
                Pops up approval modal when opening app after receiving bank SMS
              </p>
            </div>
          </div>
          {toggleAutoDetect && (
            <button
              onClick={toggleAutoDetect}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                isAutoDetectEnabled ? 'bg-lime-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  isAutoDetectEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          )}
        </Card>

        {/* Test Simulator Trigger */}
        {onOpenSimulate && (
          <button
            onClick={onOpenSimulate}
            className={`w-full p-3.5 rounded-2xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              isDarkMode
                ? 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800 text-lime-400'
                : 'bg-white border-gray-200 hover:bg-gray-50 text-lime-700 shadow-sm'
            }`}
          >
            <Sparkles size={16} />
            <span>Simulate / Test Auto-Detection Modal</span>
          </button>
        )}

        {/* Open-Source LLM Configuration */}
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-neutral-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <Cpu size={16} />
            </div>
            <div>
              <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Free Open-Source LLM
              </p>
              <p className="text-[10px] opacity-60">
                Uses local 30+ bank regex parser by default. Add free API key for Llama 3.3.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setOsProvider('groq')}
              className={`p-2 rounded-xl border font-semibold transition-all ${
                osProvider === 'groq'
                  ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                  : isDarkMode
                  ? 'border-neutral-800 text-neutral-400'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              Groq (Llama 3.3)
            </button>
            <button
              onClick={() => setOsProvider('openrouter')}
              className={`p-2 rounded-xl border font-semibold transition-all ${
                osProvider === 'openrouter'
                  ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                  : isDarkMode
                  ? 'border-neutral-800 text-neutral-400'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              OpenRouter (Free)
            </button>
          </div>

          <div className="space-y-2">
            <input
              type="password"
              placeholder={`Optional: Enter free ${osProvider === 'groq' ? 'Groq' : 'OpenRouter'} API Key`}
              value={osApiKey}
              onChange={(e) => setOsApiKey(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-xs border outline-none font-mono ${
                isDarkMode
                  ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600 focus:border-lime-500/50'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-lime-500'
              }`}
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] opacity-50">
                Leave blank to use built-in zero-latency local bank parser.
              </span>
              <button
                onClick={saveAiSettings}
                className="px-3 py-1 bg-lime-500 hover:bg-lime-400 text-black text-xs font-bold rounded-lg transition-all flex items-center gap-1"
              >
                {showKeySaved ? (
                  <>
                    <Check size={12} /> Saved!
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-2">
        <h3
          className={`text-sm font-semibold uppercase tracking-wider px-1 ${
            isDarkMode ? 'text-neutral-500' : 'text-gray-500'
          }`}
        >
          App Preferences
        </h3>
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-100'}`}>
              {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Dark Mode</span>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full relative transition-colors ${
              isDarkMode ? 'bg-lime-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                isDarkMode ? 'left-7' : 'left-1'
              }`}
            ></div>
          </button>
        </Card>
      </div>

      <button
        onClick={logout}
        className="w-full py-4 text-red-500 font-medium flex items-center justify-center gap-2"
      >
        <LogOut size={20} /> Sign Out
      </button>
    </div>
  );
};
