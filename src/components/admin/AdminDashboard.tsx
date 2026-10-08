import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { TaskSubmission } from '../../types';
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
  AlertCircle,
  Eye,
  X
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { state, setActiveAdminTab } = useApp();
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; sub: TaskSubmission | null }>({
    isOpen: false,
    sub: null
  });
  const [rejectReason, setRejectReason] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleApprove = async (subId: string, taskReward: number) => {
    try {
      setActionLoading(subId);
      const res = await dbService.approveSubmission(subId, 'ADMIN_8471835378');
      if (res.success) {
        setActionNotice(`Successfully approved! ₹${taskReward} credited to user wallet.`);
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        setActionNotice(res.error || 'Failed to approve');
        setTimeout(() => setActionNotice(null), 4000);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModal.sub) return;

    try {
      setActionLoading(rejectModal.sub.id);
      const reason = rejectReason.trim() || 'Proof image did not match task requirements';
      await dbService.rejectSubmission(rejectModal.sub.id, reason, 'ADMIN_8471835378');
      setActionNotice(`Submission rejected: "${reason}"`);
      setTimeout(() => setActionNotice(null), 4000);
      setRejectModal({ isOpen: false, sub: null });
      setRejectReason('');
    } finally {
      setActionLoading(null);
    }
  };

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

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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

          <div className="space-y-2.5">
            {recentSubmissions.length === 0 ? (
              <p className="text-center py-6 text-slate-500 text-xs">No task submissions yet</p>
            ) : (
              recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-2xl text-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white line-clamp-1">{sub.taskName}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        UID: <span className="text-amber-400 font-mono font-bold">{sub.uid}</span> • Contact: {sub.phoneOrEmail}
                      </p>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
                        ID: {sub.id} • {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize inline-block ${
                          sub.status === 'approved' || sub.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : sub.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {sub.status}
                      </span>
                      <span className="text-xs font-black text-emerald-400 mt-0.5 block">
                        +₹{sub.taskReward}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons bar */}
                  <div className="pt-2 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-2">
                    {sub.proofImageUrl ? (
                      <button
                        type="button"
                        onClick={() => setSelectedProof(sub.proofImageUrl)}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white text-[11px] font-semibold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Inspect Proof</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">No image uploaded</span>
                    )}

                    {sub.status === 'pending' ? (
                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          disabled={actionLoading === sub.id}
                          onClick={() => handleApprove(sub.id, sub.taskReward)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve (+₹{sub.taskReward})</span>
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading === sub.id}
                          onClick={() => setRejectModal({ isOpen: true, sub })}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-600/50 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 ml-auto font-medium">
                        {sub.reviewedBy ? `Reviewed by ${sub.reviewedBy}` : 'Processed'}
                      </span>
                    )}
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

      {/* Proof Image View Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-lg w-full text-white space-y-3 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Proof Screenshot Inspection</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedProof(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-auto rounded-2xl bg-black flex items-center justify-center p-2 border border-slate-800">
              <img
                src={selectedProof}
                alt="Proof"
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </div>
            <button
              type="button"
              onClick={() => setSelectedProof(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
            >
              Close Viewer
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.isOpen && rejectModal.sub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-rose-400">Reject Task Submission</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Task: &ldquo;{rejectModal.sub.taskName}&rdquo; • User: <span className="font-mono text-amber-400 font-bold">{rejectModal.sub.uid}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, sub: null })}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Rejection Reason (Visible to user)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Screenshot does not show task completion, please retry..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRejectModal({ isOpen: false, sub: null })}
                  className="px-4 py-2.5 border border-slate-700 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === rejectModal.sub.id}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-900/30 disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
