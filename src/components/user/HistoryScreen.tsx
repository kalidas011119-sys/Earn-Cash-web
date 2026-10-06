import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { maskPhone } from '../../services/db';
import {
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Wallet
} from 'lucide-react';

export const HistoryScreen: React.FC = () => {
  const { currentUser, state, setShowAuthModal, setAuthMode } = useApp();
  const [tab, setTab] = useState<'tasks' | 'referrals' | 'wallet' | 'withdrawals'>('wallet');

  if (!currentUser) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs space-y-3">
        <Clock className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Login to View History</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Sign in or create an account to view your tasks, wallet transactions, referrals, and withdrawals.
        </p>
        <button
          onClick={() => {
            setAuthMode('login');
            setShowAuthModal(true);
          }}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow"
        >
          Log In
        </button>
      </div>
    );
  }

  // Filter histories for current user
  const userSubmissions = state.submissions.filter((s) => s.uid === currentUser.uid);
  const userReferrals = state.referrals.filter((r) => r.inviterUid === currentUser.uid);
  const userTransactions = state.transactions.filter((t) => t.uid === currentUser.uid);
  const userWithdrawals = state.withdrawals.filter((w) => w.uid === currentUser.uid);

  return (
    <div className="space-y-4 pb-20">
      {/* Title */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 rounded-3xl text-white shadow-md">
        <h1 className="text-xl font-black">History & Activity</h1>
        <p className="text-xs text-emerald-100 mt-0.5">
          Detailed real-time records of all your earnings and transactions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
        <button
          onClick={() => setTab('wallet')}
          className={`flex-1 py-2 rounded-xl transition ${
            tab === 'wallet' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Wallet
        </button>
        <button
          onClick={() => setTab('tasks')}
          className={`flex-1 py-2 rounded-xl transition ${
            tab === 'tasks' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Tasks
        </button>
        <button
          onClick={() => setTab('referrals')}
          className={`flex-1 py-2 rounded-xl transition ${
            tab === 'referrals' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Referrals
        </button>
        <button
          onClick={() => setTab('withdrawals')}
          className={`flex-1 py-2 rounded-xl transition ${
            tab === 'withdrawals' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Payouts
        </button>
      </div>

      {/* Tab 1: Wallet Transactions */}
      {tab === 'wallet' && (
        <div className="space-y-2.5">
          {userTransactions.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-xs">No transactions recorded yet</p>
          ) : (
            userTransactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'credit'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {tx.type === 'credit' ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{tx.description}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-mono">{tx.id}</span>
                      <span>•</span>
                      <span>{new Date(tx.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-black ${
                      tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                    {tx.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Task History */}
      {tab === 'tasks' && (
        <div className="space-y-2.5">
          {userSubmissions.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-xs">No tasks submitted yet</p>
          ) : (
            userSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{sub.taskName}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      sub.status === 'approved' || sub.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sub.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-mono text-[10px]">ID: {sub.id}</span>
                  <span className="font-extrabold text-emerald-600">+₹{sub.taskReward}</span>
                </div>

                {sub.rejectionReason && (
                  <p className="text-[10px] text-rose-600 bg-rose-50 p-2 rounded-xl">
                    Rejection note: {sub.rejectionReason}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Referral History */}
      {tab === 'referrals' && (
        <div className="space-y-2.5">
          {userReferrals.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-xs">No referrals invited yet</p>
          ) : (
            userReferrals.map((ref) => (
              <div
                key={ref.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      UID: {ref.invitedUid}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      {maskPhone(ref.invitedPhone)}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      ref.rewardPaid
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ref.rewardPaid ? '₹20 Paid' : 'In Progress'}
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>
                    Tasks: {ref.eligibleTasksCompleted} / {ref.requiredTasks} completed
                  </span>
                  <span className="font-bold text-emerald-600">
                    {ref.rewardPaid ? '+₹20 Credited' : 'Pending 3 Tasks'}
                  </span>
                </div>

                <div className="text-[9px] text-slate-400">
                  Joined on: {new Date(ref.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Withdrawal History */}
      {tab === 'withdrawals' && (
        <div className="space-y-2.5">
          {userWithdrawals.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-xs">No withdrawal history found</p>
          ) : (
            userWithdrawals.map((wth) => (
              <div
                key={wth.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-black text-slate-900 text-sm">
                      ₹{wth.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      ID: {wth.id}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                      wth.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : wth.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : wth.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {wth.status}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Bank: {wth.bankName}</span>
                  <span>{new Date(wth.requestedAt).toLocaleString()}</span>
                </div>

                {wth.rejectionReason && (
                  <p className="text-[10px] text-rose-600 bg-rose-50 p-2 rounded-xl">
                    Rejection: {wth.rejectionReason} (Amount has been refunded to your wallet)
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
