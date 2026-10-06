import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Lock, Phone, AlertCircle, ArrowLeft } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { adminLogin, setActivePanel } = useApp();
  const [identifier, setIdentifier] = useState('8471835378');
  const [password, setPassword] = useState('Nayan@@123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanId = identifier.trim();
    if ((cleanId === '8471835378' || cleanId.toLowerCase() === 'admin@earncash.com') && password === 'Nayan@@123') {
      adminLogin();
    } else {
      setError('Invalid admin credentials. Please check phone/email and password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Back button */}
      <button
        onClick={() => setActivePanel('user')}
        className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to User Panel</span>
      </button>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-white">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
            <ShieldAlert className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Earn Cash Admin</h1>
          <p className="text-xs text-slate-400 mt-1">Authorized Administration & Financial Control</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Phone / Email
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="8471835378"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Default: 8471835378</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nayan@@123"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Default: Nayan@@123</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-sm shadow-lg hover:opacity-95 transition cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};
