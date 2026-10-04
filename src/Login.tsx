import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, User as UserIcon } from 'lucide-react';
import { supabase } from './utils/supabaseClient';

interface LoginProps {
  onLogin: () => void;
  theme: 'dark' | 'light';
}

export const Login: React.FC<LoginProps> = ({ theme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const dm = theme === 'dark';

  const inputCls = `w-full pl-10 p-3 rounded-xl border focus:outline-none focus:border-lime-500 transition-all ${
    dm ? 'bg-neutral-950 border-neutral-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
  }`;

  const iconCls = `absolute left-3 top-3.5 w-5 h-5 ${dm ? 'text-neutral-500' : 'text-gray-400'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (authError) setError(authError.message);
        // onAuthStateChange in App.tsx handles the rest
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { name: formData.name } },
        });

        if (authError) { setError(authError.message); return; }

        if (data?.session) {
          // Auto-logged in — App.tsx listener takes over
        } else {
          setMessage('Check your email to verify your account, then sign in.');
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans ${dm ? 'bg-black' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md p-8 rounded-3xl border ${dm ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200 shadow-xl'}`}>

        <div className="text-center mb-8">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 border-2 ${
            dm ? 'border-lime-500/20 bg-lime-500/10' : 'border-lime-200 bg-lime-50'
          }`}>
            <ShieldCheck size={32} className={dm ? 'text-lime-400' : 'text-lime-600'} />
          </div>
          <h1 className={`text-3xl font-bold mb-1 ${dm ? 'text-white' : 'text-gray-900'}`}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className={`text-sm ${dm ? 'text-neutral-400' : 'text-gray-500'}`}>
            {isLogin ? 'Sign in to FinTrack' : 'Start tracking your finances'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon className={iconCls} />
              <input type="text" placeholder="Full Name" className={inputCls}
                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required disabled={loading} />
            </div>
          )}

          <div className="relative">
            <Mail className={iconCls} />
            <input type="email" placeholder="Email" className={inputCls}
              value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required disabled={loading} />
          </div>

          <div className="relative">
            <Lock className={iconCls} />
            <input type="password" placeholder="Password" className={inputCls}
              value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required disabled={loading} />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 rounded-lg bg-lime-500/10 border border-lime-500/40 text-lime-400 text-sm text-center">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${
              dm ? 'bg-lime-500 text-black hover:bg-lime-400' : 'bg-lime-600 text-white hover:bg-lime-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <p className={`mt-6 text-center text-sm ${dm ? 'text-neutral-500' : 'text-gray-500'}`}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
            className={`ml-2 font-bold hover:underline ${dm ? 'text-lime-400' : 'text-lime-600'}`}
            disabled={loading}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
