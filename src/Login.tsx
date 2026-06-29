import React, { useState } from 'react';
import { User as UserIcon, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { User } from './types';

interface LoginProps {
  onLogin: (user: User) => void;
  theme: 'dark' | 'light';
}

export const Login: React.FC<LoginProps> = ({ onLogin, theme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const t =
    theme === 'dark'
      ? {
          bg: 'bg-black',
          card: 'bg-neutral-900 border-neutral-800',
          text: 'text-white',
          input: 'bg-neutral-950 border-neutral-700 text-white',
          accent: 'text-lime-400',
          btn: 'bg-lime-505 text-black hover:bg-lime-400',
        }
      : {
          bg: 'bg-gray-50',
          card: 'bg-white border-gray-200 shadow-xl',
          text: 'text-gray-900',
          input: 'bg-gray-50 border-gray-200 text-gray-900',
          accent: 'text-lime-600',
          btn: 'bg-lime-600 text-white hover:bg-lime-700',
        };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users: User[] = JSON.parse(localStorage.getItem('ft_client_users_db') || '[]');

    if (isLogin) {
      const user = users.find(
        (u) => u.email === formData.email && u.password === formData.password
      );
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid email or password.');
      }
    } else {
      if (users.find((u) => u.email === formData.email)) {
        setError('User already exists.');
        return;
      }
      const newUser: User = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        joined: new Date().toLocaleDateString(),
      };
      localStorage.setItem('ft_client_users_db', JSON.stringify([...users, newUser]));
      onLogin(newUser);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 font-sans ${t.bg} transition-colors duration-300`}
    >
      <div className={`w-full max-w-md p-8 rounded-3xl border ${t.card} animate-fade-in`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 border-2 ${
              theme === 'dark'
                ? 'border-lime-500/20 bg-lime-500/10'
                : 'border-lime-200 bg-lime-50'
            }`}
          >
            <ShieldCheck size={32} className={t.accent} />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${t.text}`}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>
            {isLogin ? 'Enter your credentials to access FinTrack' : 'Start your financial journey today'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon
                className={`absolute left-3 top-3.5 w-5 h-5 ${
                  theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
                }`}
              />
              <input
                type="text"
                placeholder="Full Name"
                className={`w-full pl-10 p-3 rounded-xl border focus:outline-none focus:border-lime-500 transition-all ${t.input}`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail
              className={`absolute left-3 top-3.5 w-5 h-5 ${
                theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
              }`}
            />
            <input
              type="email"
              placeholder="Email Address"
              className={`w-full pl-10 p-3 rounded-xl border focus:outline-none focus:border-lime-500 transition-all ${t.input}`}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="relative">
            <Lock
              className={`absolute left-3 top-3.5 w-5 h-5 ${
                theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
              }`}
            />
            <input
              type="password"
              placeholder="Password"
              className={`w-full pl-10 p-3 rounded-xl border focus:outline-none focus:border-lime-500 transition-all ${t.input}`}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${t.btn}`}
          >
            {isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight size={20} />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className={`text-sm ${theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'}`}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className={`ml-2 font-bold hover:underline ${t.accent}`}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
