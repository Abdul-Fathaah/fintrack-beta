import React, { useState } from 'react';
import { User as UserIcon, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { User } from './types';
import { supabase } from './utils/supabaseClient';

interface LoginProps {
  onLogin: (user: User) => void;
  theme: 'dark' | 'light';
}

export const Login: React.FC<LoginProps> = ({ onLogin, theme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t =
    theme === 'dark'
      ? {
          bg: 'bg-black',
          card: 'bg-neutral-900 border-neutral-800',
          text: 'text-white',
          input: 'bg-neutral-950 border-neutral-700 text-white',
          accent: 'text-lime-400',
          btn: 'bg-lime-500 text-black hover:bg-lime-400',
        }
      : {
          bg: 'bg-gray-50',
          card: 'bg-white border-gray-200 shadow-xl',
          text: 'text-gray-900',
          input: 'bg-gray-50 border-gray-200 text-gray-900',
          accent: 'text-lime-600',
          btn: 'bg-lime-600 text-white hover:bg-lime-700',
        };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }

        if (data?.user) {
          // Fetch the profile for this user
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          onLogin({
            id: data.user.id,
            name: profileData?.name || data.user.user_metadata?.name || 'User',
            email: data.user.email || formData.email,
            joined: new Date(data.user.created_at).toLocaleDateString(),
          });
        }
      } else {
        // Sign Up
        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            },
          },
        });

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }

        if (data?.user) {
          // Create user profile in profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              name: formData.name,
              email: formData.email,
              monthly_savings_target: 0,
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }

          onLogin({
            id: data.user.id,
            name: formData.name,
            email: formData.email,
            joined: new Date(data.user.created_at).toLocaleDateString(),
          });
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
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
                disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${t.btn} ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}{' '}
            {!loading && <ArrowRight size={20} />}
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
              disabled={loading}
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
