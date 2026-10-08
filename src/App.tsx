/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { UserApp } from './components/user/UserApp';
import { AdminApp } from './components/admin/AdminApp';
import { ShieldAlert, Smartphone } from 'lucide-react';

// Checks if app is running in Google AI Studio development environment or via admin param
const checkIsGoogleAiStudio = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const path = window.location.pathname.toLowerCase();

  return (
    host.includes('ais-dev') ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    search.includes('panel=admin') ||
    search.includes('admin=true') ||
    path.includes('/admin')
  );
};

const AppContent: React.FC = () => {
  const { activePanel, setActivePanel } = useApp();
  const [isAiStudio, setIsAiStudio] = useState<boolean>(false);

  useEffect(() => {
    const isDev = checkIsGoogleAiStudio();
    setIsAiStudio(isDev);

    // If outside Google AI Studio and not on explicit admin URL, ensure regular user mode
    if (!isDev && activePanel === 'admin') {
      setActivePanel('user');
    }
  }, []);

  return (
    <div className="relative">
      {/* Active Panel Display */}
      {activePanel === 'admin' && isAiStudio ? <AdminApp /> : <UserApp />}

      {/* Google AI Studio ONLY Developer Switcher Badge */}
      {isAiStudio && (
        <aside
          aria-label="Google AI Studio Developer Controls"
          className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 p-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl text-[11px] font-bold text-white transition animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-mono">
            AI Studio Dev
          </span>

          <button
            onClick={() => setActivePanel('user')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition cursor-pointer ${
              activePanel === 'user'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Preview User App"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>User View</span>
          </button>

          <button
            onClick={() => setActivePanel('admin')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition cursor-pointer ${
              activePanel === 'admin'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Open Admin Panel"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </button>
        </aside>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
