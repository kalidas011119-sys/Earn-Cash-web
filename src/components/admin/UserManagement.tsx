import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService, maskAccountNumber } from '../../services/db';
import { User, Wallet, WalletTransaction } from '../../types';
import {
  Search,
  User as UserIcon,
  ShieldAlert,
  PlusCircle,
  MinusCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  X,
  CreditCard
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceModal, setBalanceModal] = useState<{ isOpen: boolean; type: 'credit' | 'debit'; user: User | null }>({
    isOpen: false,
    type: 'credit',
    user: null
  });
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [activeUserDetailTab, setActiveUserDetailTab] = useState<'info' | 'tasks' | 'wallet' | 'referrals' | 'withdrawals'>('info');

  const usersList = Object.values(state.users);

  const filteredUsers = usersList.filter((u) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      u.uid.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.inviteCode.toLowerCase().includes(q)
    );
  });

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustError(null);
    if (!balanceModal.user) return;

    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt <= 0) {
      setAdjustError('Please enter a valid positive amount');
      return;
    }
    const reasonText = adjustReason.trim() || `Admin manual ${balanceModal.type} adjustment`;

    const res = await dbService.adjustUserBalance(
      balanceModal.user.uid,
      amt,
      balanceModal.type,
      reasonText,
      'ADMIN_8471835378'
    );

    if (!res.success) {
      setAdjustError(res.error || 'Failed to adjust balance');
      return;
    }

    const targetUid = balanceModal.user.uid;
    const actionType = balanceModal.type === 'credit' ? 'credited to' : 'deducted from';
    const newBal = typeof res.newBalance === 'number' ? ` New Balance: ₹${res.newBalance}` : '';
    setActionNotice(`✓ Successfully ${actionType} ₹${amt} for user ${targetUid}!${newBal}`);
    setTimeout(() => setActionNotice(null), 5000);

    setBalanceModal({ isOpen: false, type: 'credit', user: null });
    setAdjustAmount('');
    setAdjustReason('');
  };

  const toggleUserStatus = (uid: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    dbService.setUserStatus(uid, nextStatus, 'ADMIN_8471835378');
  };

  return (
    <div className="space-y-6">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">User Management</h2>
          <p className="text-xs text-slate-400">
            Search, view profiles, audit histories, and manage wallet balances
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by UID, Phone, Invite Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-700">
              <tr>
                <th className="p-4">User Details</th>
                <th className="p-4">Invite Code</th>
                <th className="p-4">Wallet Balance</th>
                <th className="p-4">Tasks Done</th>
                <th className="p-4">Total Earned</th>
                <th className="p-4">Bank Status</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No users found matching search
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const wallet = state.wallets[user.uid];
                  const hasBank = !!user.bankDetails;

                  return (
                    <tr key={user.uid} className="hover:bg-slate-800/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400">
                            {user.phone ? user.phone.slice(-2) : 'U'}
                          </div>
                          <div>
                            <span className="font-mono font-bold text-white block">
                              UID: {user.uid}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              +91 {user.phone}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-amber-400">{user.inviteCode}</td>
                      <td className="p-4 font-black text-emerald-400">
                        ₹{wallet ? wallet.balance.toLocaleString('en-IN') : 0}
                      </td>
                      <td className="p-4 font-semibold text-slate-300">
                        {wallet ? wallet.completedTaskCount : 0}
                      </td>
                      <td className="p-4 font-bold text-white">
                        ₹{wallet ? wallet.totalEarned.toLocaleString('en-IN') : 0}
                      </td>
                      <td className="p-4">
                        {hasBank ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                            Linked ({user.bankDetails?.bankName.slice(0, 8)})
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                            Not Added
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${
                            user.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                            title="View User Details & History"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setBalanceModal({ isOpen: true, type: 'credit', user })}
                            className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 rounded-lg transition border border-emerald-800/50"
                            title="Add Balance"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setBalanceModal({ isOpen: true, type: 'debit', user })}
                            className="p-1.5 bg-rose-950 hover:bg-rose-900 text-rose-400 rounded-lg transition border border-rose-800/50"
                            title="Deduct Balance"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.uid, user.status)}
                            className={`p-1.5 rounded-lg transition ${
                              user.status === 'active'
                                ? 'bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-800/50'
                                : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/50'
                            }`}
                            title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                          >
                            {user.status === 'active' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Balance Modal */}
      {balanceModal.isOpen && balanceModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black">
                {balanceModal.type === 'credit' ? 'Add Balance (Credit)' : 'Deduct Balance (Debit)'}
              </h3>
              <button
                onClick={() => setBalanceModal({ isOpen: false, type: 'credit', user: null })}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
              <div>
                <span className="text-slate-400 block text-[10px]">User Profile</span>
                <span className="text-white font-bold">{balanceModal.user.phone}</span>
                <span className="text-slate-500 font-mono text-[10px] ml-1.5">({balanceModal.user.uid})</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Current Balance</span>
                <span className="text-base font-black text-emerald-400">
                  ₹{state.wallets[balanceModal.user.uid]?.balance || 0}
                </span>
              </div>
            </div>

            {adjustError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl">
                {adjustError}
              </div>
            )}

            <form onSubmit={handleAdjustBalance} className="space-y-3.5">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Amount (₹)
                  </label>
                  <span className="text-[10px] text-slate-400">Tap preset to fill:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[10, 20, 50, 100, 200, 500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAdjustAmount(preset.toString())}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 border border-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      +₹{preset}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Enter amount (e.g. 50)"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mandatory Audit Reason
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Promotional campaign compensation, dispute resolution..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setBalanceModal({ isOpen: false, type: 'credit', user: null })}
                  className="px-4 py-2.5 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold shadow-lg transition ${
                    balanceModal.type === 'credit'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  Confirm {balanceModal.type === 'credit' ? 'Credit' : 'Debit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details & History Drawer / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full text-white space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">User Comprehensive Profile</h3>
                <p className="text-xs text-slate-400 font-mono">
                  UID: {selectedUser.uid} • +91 {selectedUser.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-2 text-xs font-bold">
              {(['info', 'tasks', 'wallet', 'referrals', 'withdrawals'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveUserDetailTab(tab)}
                  className={`px-3 py-1.5 rounded-xl capitalize transition ${
                    activeUserDetailTab === tab
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 text-xs">
              {activeUserDetailTab === 'info' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/80 p-3 rounded-2xl">
                      <span className="text-slate-400 text-[10px] block">Wallet Balance</span>
                      <span className="text-lg font-black text-emerald-400">
                        ₹{state.wallets[selectedUser.uid]?.balance || 0}
                      </span>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-2xl">
                      <span className="text-slate-400 text-[10px] block">Total Earned</span>
                      <span className="text-lg font-black text-white">
                        ₹{state.wallets[selectedUser.uid]?.totalEarned || 0}
                      </span>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-2xl">
                      <span className="text-slate-400 text-[10px] block">Invite Code</span>
                      <span className="text-sm font-mono font-bold text-amber-400">
                        {selectedUser.inviteCode}
                      </span>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-2xl">
                      <span className="text-slate-400 text-[10px] block">Registration Date</span>
                      <span className="text-xs text-slate-200">
                        {new Date(selectedUser.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>Bank Account Details</span>
                    </h4>
                    {selectedUser.bankDetails ? (
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                        <div>
                          <span className="text-slate-500 block">Bank Name:</span>
                          <span className="font-semibold">{selectedUser.bankDetails.bankName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Account Holder:</span>
                          <span className="font-semibold">{selectedUser.bankDetails.accountHolderName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Account Number:</span>
                          <span className="font-mono font-semibold">{maskAccountNumber(selectedUser.bankDetails.accountNumber)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">IFSC Code:</span>
                          <span className="font-mono font-semibold text-emerald-400">{selectedUser.bankDetails.ifscCode}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-[11px]">No bank details saved by user.</p>
                    )}
                  </div>
                </div>
              )}

              {activeUserDetailTab === 'wallet' && (
                <div className="space-y-2">
                  {state.transactions.filter((t) => t.uid === selectedUser.uid).length === 0 ? (
                    <p className="text-slate-500 py-4 text-center">No wallet transactions</p>
                  ) : (
                    state.transactions
                      .filter((t) => t.uid === selectedUser.uid)
                      .map((tx) => (
                        <div key={tx.id} className="p-3 bg-slate-800/70 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-bold text-white">{tx.description}</p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {tx.id} • {new Date(tx.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <span className={`font-black ${tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              )}

              {activeUserDetailTab === 'tasks' && (
                <div className="space-y-2">
                  {state.submissions.filter((s) => s.uid === selectedUser.uid).length === 0 ? (
                    <p className="text-slate-500 py-4 text-center">No tasks submitted</p>
                  ) : (
                    state.submissions
                      .filter((s) => s.uid === selectedUser.uid)
                      .map((s) => (
                        <div key={s.id} className="p-3 bg-slate-800/70 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-bold text-white">{s.taskName}</p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {s.id} • Reward: ₹{s.taskReward}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            s.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {s.status}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              )}

              {activeUserDetailTab === 'referrals' && (
                <div className="space-y-2">
                  {state.referrals.filter((r) => r.inviterUid === selectedUser.uid).length === 0 ? (
                    <p className="text-slate-500 py-4 text-center">No invited referrals</p>
                  ) : (
                    state.referrals
                      .filter((r) => r.inviterUid === selectedUser.uid)
                      .map((r) => (
                        <div key={r.id} className="p-3 bg-slate-800/70 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-bold text-white font-mono">Invited: {r.invitedUid}</p>
                            <span className="text-[10px] text-slate-400">
                              Tasks: {r.eligibleTasksCompleted}/{r.requiredTasks}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.rewardPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {r.rewardPaid ? '₹20 Paid' : 'In Progress'}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              )}

              {activeUserDetailTab === 'withdrawals' && (
                <div className="space-y-2">
                  {state.withdrawals.filter((w) => w.uid === selectedUser.uid).length === 0 ? (
                    <p className="text-slate-500 py-4 text-center">No withdrawals</p>
                  ) : (
                    state.withdrawals
                      .filter((w) => w.uid === selectedUser.uid)
                      .map((w) => (
                        <div key={w.id} className="p-3 bg-slate-800/70 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-bold text-white">₹{w.amount} to {w.bankName}</p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {w.id} • {new Date(w.requestedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            w.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {w.status}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
