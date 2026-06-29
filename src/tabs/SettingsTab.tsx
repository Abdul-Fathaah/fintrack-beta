import React, { useState } from 'react';
import {
  ChevronLeft,
  Pencil,
  Download,
  Upload,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useTheme } from '../hooks/useTheme';
import { User, UserProfile } from '../types';

// Import STORAGE_KEYS from App to ensure synchronization of keys
import { STORAGE_KEYS } from '../App';

interface SettingsTabProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  logout: () => void;
  currentUser: User;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  userProfile,
  setUserProfile,
  logout,
  currentUser,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editEmail, setEditEmail] = useState(userProfile.email || '');
  const [editSavingsTarget, setEditSavingsTarget] = useState<string>(
    userProfile.monthlySavingsTarget?.toString() || '0'
  );

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
    const suffix = `_${currentUser.id}`;
    const data = {
      profile: JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE + suffix) || 'null'),
      transactions: JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS + suffix) || 'null'),
      obligations: JSON.parse(localStorage.getItem(STORAGE_KEYS.OBLIGATIONS + suffix) || 'null'),
      theme: JSON.parse(localStorage.getItem(STORAGE_KEYS.THEME) || 'null'),
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
    reader.onload = (event) => {
      try {
        const resultText = event.target?.result as string;
        const data = JSON.parse(resultText);
        const suffix = `_${currentUser.id}`;
        if (data.profile) localStorage.setItem(STORAGE_KEYS.PROFILE + suffix, JSON.stringify(data.profile));
        if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS + suffix, JSON.stringify(data.transactions));
        if (data.obligations) localStorage.setItem(STORAGE_KEYS.OBLIGATIONS + suffix, JSON.stringify(data.obligations));
        alert('Import successful! Reloading...');
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert('Invalid backup file.');
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
                isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-gray-55 border-gray-200'
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
                isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-gray-55 border-gray-200'
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
                isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-gray-55 border-gray-200'
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
