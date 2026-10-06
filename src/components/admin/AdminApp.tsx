import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { UserManagement } from './UserManagement';
import { TaskManagement } from './TaskManagement';
import { TaskSubmissions } from './TaskSubmissions';
import { ReferralManagement } from './ReferralManagement';
import { WithdrawalManagement } from './WithdrawalManagement';
import { BannerManagement } from './BannerManagement';
import { NotificationManagement } from './NotificationManagement';
import { SettingsManagement } from './SettingsManagement';
import { AuditLogs } from './AuditLogs';
import {
  LayoutDashboard,
  Users,
  Zap,
  CheckSquare,
  Gift,
  ArrowUpRight,
  Image as ImageIcon,
  Bell,
  Settings,
  History,
  LogOut,
  Smartphone,
  Menu,
  X,
  ShieldAlert
} from 'lucide-react';

export const AdminApp: React.FC = () => {
  const {
    isAdminLoggedIn,
    adminLogout,
    activeAdminTab,
    setActiveAdminTab,
    setActivePanel,
    state
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isAdminLoggedIn) {
    return <AdminLogin />;
  }

  const pendingSubmissionsCount = state.submissions.filter((s) => s.status === 'pending').length;
  const pendingWithdrawalsCount = state.withdrawals.filter((w) => w.status === 'pending').length;

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'tasks', label: 'Task Campaigns', icon: Zap },
    {
      id: 'submissions',
      label: 'Task Submissions',
      icon: CheckSquare,
      badge: pendingSubmissionsCount > 0 ? pendingSubmissionsCount : null,
      badgeColor: 'bg-amber-500 text-slate-950'
    },
    { id: 'referrals', label: 'Referral Program', icon: Gift },
    {
      id: 'withdrawals',
      label: 'Withdrawals & Payouts',
      icon: ArrowUpRight,
      badge: pendingWithdrawalsCount > 0 ? pendingWithdrawalsCount : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    { id: 'banners', label: 'Banner Carousels', icon: ImageIcon },
    { id: 'notifications', label: 'Broadcast Alerts', icon: Bell },
    { id: 'settings', label: 'Global Settings', icon: Settings },
    { id: 'audit', label: 'Security Audit Logs', icon: History }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-slate-950">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-sm text-white">Earn Cash Admin</h1>
            <p className="text-[10px] text-slate-400">8471835378</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePanel('user')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>User Panel</span>
          </button>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-white"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-slate-800/80 hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-amber-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-black text-base text-white tracking-tight">Earn Cash</h1>
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Admin Authority
                </p>
              </div>
            </div>
          </div>

          {/* Operator chip */}
          <div className="p-4 mx-4 mt-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Operator ID
              </span>
              <span className="text-xs font-bold text-white font-mono">8471835378</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeAdminTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveAdminTab(item.id as any);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setActivePanel('user')}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open User Mobile View</span>
          </button>

          <button
            onClick={adminLogout}
            className="w-full py-2.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        {activeAdminTab === 'dashboard' && <AdminDashboard />}
        {activeAdminTab === 'users' && <UserManagement />}
        {activeAdminTab === 'tasks' && <TaskManagement />}
        {activeAdminTab === 'submissions' && <TaskSubmissions />}
        {activeAdminTab === 'referrals' && <ReferralManagement />}
        {activeAdminTab === 'withdrawals' && <WithdrawalManagement />}
        {activeAdminTab === 'banners' && <BannerManagement />}
        {activeAdminTab === 'notifications' && <NotificationManagement />}
        {activeAdminTab === 'settings' && <SettingsManagement />}
        {activeAdminTab === 'audit' && <AuditLogs />}
      </main>
    </div>
  );
};
