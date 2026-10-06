import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  Wallet,
  Zap,
  Gift,
  TrendingUp,
  Activity,
  AlertCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { state, setActiveAdminTab } = useApp();

  const totalUsers = Object.keys(state.users).length;
  const activeUsers = Object.values(state.users).filter((u) => u.status === 'active').length;
  const totalTasks = state.tasks.length;

  const pendingSubmissions = state.submissions.filter((s) => s.status === 'pending').length;
  const approvedSubmissions = state.submissions.filter((s) => s.status === 'approved' || s.status === 'completed').length;
  const rejectedSubmissions = state.submissions.filter((s) => s.status === 'rejected').length;

  const pendingWithdrawals = state.withdrawals.filter((w) => w.status === 'pending').length;
  const completedWithdrawals = state.withdrawals.filter((w) => w.status === 'completed').length;

  const totalWalletBalance = Object.values(state.wallets).reduce((sum, w) => sum + (w.balance || 0), 0);

  const totalTaskRewardsPaid = state.transactions
    .filter((t) => t.category === 'task_reward')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReferralRewardsPaid = state.transactions
    .filter((t) => t.category === 'referral_reward')
    .reduce((sum, t) => sum + t.amount, 0);

  // Recent activity lists
  const recentUsers = Object.values(state.users)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentSubmissions = state.submissions.slice(0, 5);
  const recentWithdrawals = state.withdrawals.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
            System Operational
          </span>
          <h1 className="text-2xl font-black text-white mt-2">Executive Admin Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics, user payouts, submission reviews & task configuration
          </p>
        </div>

        <div className="flex items-center gap-3">
          {pendingSubmissions > 0 && (
            <button
              onClick={() => setActiveAdminTab('submissions')}
              className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg"
            >
              <Clock className="w-4 h-4" />
              <span>{pendingSubmissions} Submissions Pending</span>
            </button>
          )}

          {pendingWithdrawals > 0 && (
            <button
              onClick={() => setActiveAdminTab('withdrawals')}
              className="flex items-center gap-2 px-3.5 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-xs font-bold transition shadow-lg"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{pendingWithdrawals} Withdrawals Pending</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Grid (11 Required Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {/* Total Users */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Total Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{totalUsers}</p>
          <span className="text-[10px] text-emerald-400 mt-1 block">
            {activeUsers} active accounts
          </span>
        </div>

        {/* Total Tasks */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Total Tasks</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{totalTasks}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Active task campaigns</span>
        </div>

        {/* Pending Submissions */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Pending Submissions</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{pendingSubmissions}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Requires manual review</span>
        </div>

        {/* Approved Tasks */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Approved Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{approvedSubmissions}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Successfully verified</span>
        </div>

        {/* Rejected Tasks */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Rejected Tasks</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">{rejectedSubmissions}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Invalid proof / rejected</span>
        </div>

        {/* Pending Withdrawals */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Pending Withdrawals</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">{pendingWithdrawals}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Bank payouts awaiting</span>
        </div>

        {/* Completed Withdrawals */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Completed Payouts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{completedWithdrawals}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Processed via IMPS</span>
        </div>

        {/* Total Wallet Balance */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Total Wallet Balance</span>
            <Wallet className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400">
            ₹{totalWalletBalance.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">User funds held in app</span>
        </div>

        {/* Total Task Rewards Paid */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Task Rewards Paid</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">
            ₹{totalTaskRewardsPaid.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">From verified task work</span>
        </div>

        {/* Total Referral Rewards Paid */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Referral Rewards Paid</span>
            <Gift className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-black text-yellow-400">
            ₹{totalReferralRewardsPaid.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">3-task qualified referrals</span>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Task Submissions */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Recent Task Submissions</span>
            </h3>
            <button
              onClick={() => setActiveAdminTab('submissions')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              View All Submissions
            </button>
          </div>

          <div className="space-y-2">
            {recentSubmissions.length === 0 ? (
              <p className="text-center py-6 text-slate-500 text-xs">No task submissions yet</p>
            ) : (
              recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 bg-slate-800/70 border border-slate-700/60 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white line-clamp-1">{sub.taskName}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      UID: <span className="text-amber-400 font-mono">{sub.uid}</span> • Contact: {sub.phoneOrEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize block ${
                        sub.status === 'approved' || sub.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : sub.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {sub.status}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 mt-0.5 block">
                      +₹{sub.taskReward}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span>Recent Withdrawals</span>
            </h3>
            <button
              onClick={() => setActiveAdminTab('withdrawals')}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              View All Withdrawals
            </button>
          </div>

          <div className="space-y-2">
            {recentWithdrawals.length === 0 ? (
              <p className="text-center py-6 text-slate-500 text-xs">No withdrawal requests yet</p>
            ) : (
              recentWithdrawals.map((wth) => (
                <div
                  key={wth.id}
                  className="p-3 bg-slate-800/70 border border-slate-700/60 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-black text-white text-sm">₹{wth.amount.toLocaleString('en-IN')}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      UID: <span className="text-amber-400 font-mono">{wth.uid}</span> • Bank: {wth.bankName}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      wth.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : wth.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {wth.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
