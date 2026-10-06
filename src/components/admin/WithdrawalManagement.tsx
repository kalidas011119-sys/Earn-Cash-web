import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { Withdrawal } from '../../types';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Search,
  AlertCircle,
  X,
  CreditCard
} from 'lucide-react';

export const WithdrawalManagement: React.FC = () => {
  const { state } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; wth: Withdrawal | null }>({
    isOpen: false,
    wth: null
  });
  const [rejectReason, setRejectReason] = useState('');

  const filtered = state.withdrawals.filter((w) => {
    if (filter !== 'all' && w.status !== filter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        w.id.toLowerCase().includes(q) ||
        w.uid.toLowerCase().includes(q) ||
        w.phone.includes(q) ||
        w.bankName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = (wthId: string, nextStatus: 'processing' | 'completed') => {
    const res = dbService.updateWithdrawalStatus(wthId, nextStatus, '', 'ADMIN_8471835378');
    if (!res.success) {
      alert(res.error || 'Failed to update withdrawal status');
    }
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModal.wth) return;

    const res = dbService.updateWithdrawalStatus(
      rejectModal.wth.id,
      'rejected',
      rejectReason.trim() || 'Bank account details invalid / verification failed',
      'ADMIN_8471835378'
    );

    if (!res.success) {
      alert(res.error || 'Failed to reject withdrawal');
      return;
    }

    setRejectModal({ isOpen: false, wth: null });
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Withdrawal & Payout Management</h2>
          <p className="text-xs text-slate-400">
            Process bank transfers, approve pending payouts, or reject with automatic wallet refund
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          {(['all', 'pending', 'processing', 'completed', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 rounded-lg capitalize transition font-bold ${
                filter === st ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-700">
              <tr>
                <th className="p-4">Withdrawal ID</th>
                <th className="p-4">User UID</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Bank Name</th>
                <th className="p-4">Account Holder</th>
                <th className="p-4">Account No & IFSC</th>
                <th className="p-4">Request Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No withdrawal requests matching filter
                  </td>
                </tr>
              ) : (
                filtered.map((wth) => (
                  <tr key={wth.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4 font-mono font-bold text-amber-400">{wth.id}</td>
                    <td className="p-4">
                      <span className="font-mono font-bold text-white block">{wth.uid}</span>
                      <span className="text-[10px] text-slate-400 font-mono">+91 {wth.phone}</span>
                    </td>
                    <td className="p-4 font-black text-emerald-400 text-sm">
                      ₹{wth.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-semibold text-white">{wth.bankName}</td>
                    <td className="p-4 text-slate-200">{wth.accountHolderName}</td>
                    <td className="p-4 font-mono text-[11px]">
                      <span className="text-white block font-bold">{wth.accountNumber}</span>
                      <span className="text-emerald-400">{wth.ifsc}</span>
                    </td>
                    <td className="p-4 text-[10px] text-slate-400">
                      {new Date(wth.requestedAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          wth.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : wth.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : wth.status === 'processing'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {wth.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {wth.status === 'pending' || wth.status === 'processing' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {wth.status === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(wth.id, 'processing')}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow"
                              title="Mark as Processing"
                            >
                              Process
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusChange(wth.id, 'completed')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow"
                            title="Mark as Transferred / Completed"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => setRejectModal({ isOpen: true, wth })}
                            className="px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-600/50 rounded-lg text-xs font-bold transition"
                            title="Reject & Refund Amount"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          {wth.status === 'completed' ? 'Paid' : 'Refunded'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal.isOpen && rejectModal.wth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-rose-400">
              Reject Withdrawal & Refund Balance
            </h3>
            <p className="text-xs text-slate-400">
              This will mark withdrawal #{rejectModal.wth.id} as Rejected and{' '}
              <strong>automatically refund ₹{rejectModal.wth.amount}</strong> back into user {rejectModal.wth.uid}&apos;s wallet.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Rejection
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Account number invalid according to bank IFSC branch..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal({ isOpen: false, wth: null })}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Confirm Rejection & Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
