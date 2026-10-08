import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HomeScreen } from './HomeScreen';
import { EarnScreen } from './EarnScreen';
import { InviteScreen } from './InviteScreen';
import { WithdrawScreen } from './WithdrawScreen';
import { HistoryScreen } from './HistoryScreen';
import { ProfileScreen } from './ProfileScreen';
import { AuthModal } from './AuthModal';
import { TaskSubmissionModal } from './TaskSubmissionModal';
import {
  Home,
  Zap,
  Gift,
  ArrowUpRight,
  Clock,
  User,
  Bell,
  X
} from 'lucide-react';

export const UserApp: React.FC = () => {
  const {
    activeUserTab,
    setActiveUserTab,
    currentWallet,
    currentUser,
    setShowAuthModal,
    setAuthMode,
    state
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifs = state.notifications.filter((n) => n.isActive);

  return (
    <div className="min-h-screen bg-slate-900/5 sm:bg-slate-900/90 flex flex-col items-center justify-start sm:p-4">
      {/* Mobile Device Frame */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen sm:min-h-[844px] sm:max-h-[92vh] sm:rounded-[36px] shadow-2xl flex flex-col overflow-hidden relative border border-slate-200/60 sm:border-slate-800">
        {/* Android App Top Header */}
        <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 py-3 shrink-0 flex items-center justify-between shadow-xs sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm text-yellow-300 shadow-inner">
              ₹
            </div>
            <div>
              <h1 className="font-black text-base tracking-tight leading-none">Earn Cash</h1>
              <p className="text-[10px] text-emerald-100 font-medium">Daily Task & Rewards</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Wallet Chip */}
            <button
              onClick={() => setActiveUserTab('withdraw')}
              className="flex items-center gap-1.5 bg-black/20 hover:bg-black/30 border border-white/20 px-2.5 py-1 rounded-full text-xs font-black text-yellow-300 transition"
            >
              <span>₹{currentWallet ? currentWallet.balance.toLocaleString('en-IN') : '0'}</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white relative transition"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400 ring-2 ring-emerald-600" />
              )}
            </button>
          </div>
        </header>

        {/* Notifications Dropdown Drawer */}
        {showNotifications && (
          <div className="bg-white border-b border-slate-200 p-4 shadow-lg z-20 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs text-slate-800">Announcements & Alerts</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Close
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {unreadNotifs.map((n) => (
                <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <h4 className="font-bold text-slate-800">{n.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                  <span className="text-[9px] text-slate-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Scrollable Screen Content */}
        <main className="flex-1 overflow-y-auto px-4 pt-3 pb-6 scrollbar-none">
          {activeUserTab === 'home' && <HomeScreen />}
          {activeUserTab === 'earn' && <EarnScreen />}
          {activeUserTab === 'invite' && <InviteScreen />}
          {activeUserTab === 'withdraw' && <WithdrawScreen />}
          {activeUserTab === 'history' && <HistoryScreen />}
          {activeUserTab === 'profile' && <ProfileScreen />}
        </main>

        {/* Android Bottom Navigation Bar */}
        <nav className="bg-white border-t border-slate-200/80 px-2 py-2 shrink-0 flex items-center justify-around z-30 shadow-lg">
          <button
            onClick={() => setActiveUserTab('home')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${
              activeUserTab === 'home' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => setActiveUserTab('earn')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${
              activeUserTab === 'earn' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span className="text-[10px]">Earn</span>
          </button>

          <button
            onClick={() => setActiveUserTab('invite')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition relative ${
              activeUserTab === 'invite' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Gift className="w-5 h-5" />
            <span className="text-[10px]">Invite ₹20</span>
          </button>

          <button
            onClick={() => setActiveUserTab('withdraw')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${
              activeUserTab === 'withdraw' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-5 h-5" />
            <span className="text-[10px]">Payout</span>
          </button>

          <button
            onClick={() => setActiveUserTab('history')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${
              activeUserTab === 'history' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px]">History</span>
          </button>

          <button
            onClick={() => setActiveUserTab('profile')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${
              activeUserTab === 'profile' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Profile</span>
          </button>
        </nav>
      </div>

      {/* Global Modals */}
      <AuthModal />
      <TaskSubmissionModal />
    </div>
  );
};
