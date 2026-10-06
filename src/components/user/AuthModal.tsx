import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { Phone, Lock, Gift, UserPlus, LogIn, X, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode, loginUser, initialInviteCode } = useApp();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState(initialInviteCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authMode === 'signup') {
        const res = await dbService.signup(phone, password, inviteCode);
        if (!res.success || !res.user) {
          setError(res.error || 'Registration failed');
          setLoading(false);
          return;
        }
        loginUser(res.user);
      } else {
        const res = await dbService.login(phone, password);
        if (!res.success || !res.user) {
          setError(res.error || 'Login failed');
          setLoading(false);
          return;
        }
        loginUser(res.user);
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white text-center relative">
          <button
            onClick={() => setShowAuthModal(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Gift className="w-8 h-8 text-yellow-300" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Earn Cash</h2>
          <p className="text-emerald-100 text-xs mt-1">
            {authMode === 'signup'
              ? 'Join now & get ₹20 Instant Welcome Bonus!'
              : 'Welcome back! Login to claim rewards'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition ${
              authMode === 'login'
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" /> Login
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition ${
              authMode === 'signup'
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Sign Up (+₹20)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mobile Number (10 digits)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-13 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Enter password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Invite Code (Optional)</span>
                <span className="text-emerald-600 font-normal text-[11px]">Extra rewards</span>
              </label>
              <div className="relative">
                <Gift className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. EC9042"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white uppercase font-mono tracking-wider transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg active:scale-98 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Please wait...' : authMode === 'signup' ? 'Claim ₹20 & Sign Up' : 'Log In to Account'}
          </button>

          {authMode === 'signup' ? (
            <p className="text-center text-xs text-slate-500 pt-1">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Log In
              </button>
            </p>
          ) : (
            <p className="text-center text-xs text-slate-500 pt-1">
              New to Earn Cash?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Sign Up & Get ₹20
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
