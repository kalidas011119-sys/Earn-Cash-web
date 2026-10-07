import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { TaskSubmission } from '../../types';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  ExternalLink,
  AlertCircle,
  Search,
  Filter,
  X
} from 'lucide-react';

export const TaskSubmissions: React.FC = () => {
  const { state } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; sub: TaskSubmission | null }>({
    isOpen: false,
    sub: null
  });
  const [rejectReason, setRejectReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [activeProofSub, setActiveProofSub] = useState<TaskSubmission | null>(null);

  const filtered = state.submissions.filter((sub) => {
    if (filterStatus !== 'all' && sub.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        sub.id.toLowerCase().includes(q) ||
        sub.uid.toLowerCase().includes(q) ||
        sub.taskName.toLowerCase().includes(q) ||
        sub.phoneOrEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApprove = async (sub: TaskSubmission) => {
    try {
      setActionLoading(sub.id);
      const res = await dbService.approveSubmission(sub.id, 'ADMIN_8471835378');
      if (res.success) {
        setActionNotice(`Approved! ₹${sub.taskReward} credited to user ${sub.uid}'s wallet.`);
        setTimeout(() => setActionNotice(null), 4000);
        if (activeProofSub?.id === sub.id) {
          setActiveProofSub(null);
          setSelectedProof(null);
        }
      } else {
        alert(res.error || 'Failed to approve');
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
      await dbService.rejectSubmission(
        rejectModal.sub.id,
        reason,
        'ADMIN_8471835378'
      );
      setActionNotice(`Submission for ${rejectModal.sub.uid} rejected.`);
      setTimeout(() => setActionNotice(null), 4000);
      setRejectModal({ isOpen: false, sub: null });
      setRejectReason('');
      if (activeProofSub?.id === rejectModal.sub.id) {
        setActiveProofSub(null);
        setSelectedProof(null);
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Notice */}
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

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Task Submissions Review</h2>
          <p className="text-xs text-slate-400">
            Verify user proof screenshots, approve rewards, and audit automated credits
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search UID, task, contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 w-44 sm:w-56"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            {['all', 'pending', 'approved', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg capitalize transition font-bold ${
                  filterStatus === st
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE CARD VIEW (Optimized for Phones & Tablets) */}
      <div className="block lg:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-500 text-xs">
            No submissions found for the selected filter.
          </div>
        ) : (
          filtered.map((sub) => (
            <div
              key={sub.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-xs space-y-3 shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 block">{sub.id}</span>
                  <h3 className="font-bold text-white text-sm line-clamp-1 mt-0.5">{sub.taskName}</h3>
                  <div className="text-[11px] text-slate-400 mt-1 space-y-0.5">
                    <p>User UID: <span className="text-white font-mono font-bold">{sub.uid}</span></p>
                    <p>Contact: <span className="text-slate-300 font-medium">{sub.phoneOrEmail}</span></p>
                    <p className="text-[10px] text-slate-500">{new Date(sub.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
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
                  <span className="text-base font-black text-emerald-400 mt-1 block">
                    +₹{sub.taskReward}
                  </span>
                </div>
              </div>

              {/* Proof Image Preview */}
              {sub.proofImageUrl ? (
                <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={sub.proofImageUrl}
                      alt="Proof"
                      className="w-12 h-12 object-cover rounded-xl border border-slate-700 bg-slate-800 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Attached Screenshot</span>
                      <span className="text-xs font-semibold text-slate-200">Tap to inspect full-size</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveProofSub(sub);
                      setSelectedProof(sub.proofImageUrl);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold border border-slate-700 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Proof</span>
                  </button>
                </div>
              ) : (
                <div className="p-2 bg-slate-950/60 rounded-xl text-[11px] text-slate-500 italic">
                  No screenshot uploaded
                </div>
              )}

              {/* Action Buttons for Mobile */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                {sub.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      disabled={actionLoading === sub.id}
                      onClick={() => handleApprove(sub)}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/30 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve (+₹{sub.taskReward})</span>
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading === sub.id}
                      onClick={() => setRejectModal({ isOpen: true, sub })}
                      className="px-4 py-2.5 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-600/50 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center py-1 text-[11px] text-slate-500 font-medium">
                    {sub.reviewedBy ? `Reviewed by ${sub.reviewedBy}` : 'Processed'}
                    {sub.rejectionReason && (
                      <span className="text-rose-400 block text-[10px] mt-0.5">Reason: {sub.rejectionReason}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP SUBMISSIONS TABLE */}
      <div className="hidden lg:block bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-700">
              <tr>
                <th className="p-4">Submission ID</th>
                <th className="p-4">User UID</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Task Name</th>
                <th className="p-4">Reward</th>
                <th className="p-4">Proof</th>
                <th className="p-4">Date/Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No submissions found
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4 font-mono font-bold text-amber-400">{sub.id}</td>
                    <td className="p-4 font-mono font-bold text-white">{sub.uid}</td>
                    <td className="p-4 text-slate-300">{sub.phoneOrEmail}</td>
                    <td className="p-4 font-semibold text-white max-w-xs truncate">
                      {sub.taskName}
                    </td>
                    <td className="p-4 font-black text-emerald-400 text-sm">
                      +₹{sub.taskReward}
                    </td>
                    <td className="p-4">
                      {sub.proofImageUrl ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveProofSub(sub);
                            setSelectedProof(sub.proofImageUrl);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span className="text-slate-500">No image</span>
                      )}
                    </td>
                    <td className="p-4 text-[10px] text-slate-400">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          sub.status === 'approved' || sub.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : sub.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {sub.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={actionLoading === sub.id}
                            onClick={() => handleApprove(sub)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow transition cursor-pointer active:scale-95 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve (+₹{sub.taskReward})</span>
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading === sub.id}
                            onClick={() => setRejectModal({ isOpen: true, sub })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-600/50 rounded-lg font-bold text-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          {sub.reviewedBy ? `by ${sub.reviewedBy}` : 'Processed'}
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

      {/* Proof Image View Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-lg w-full text-white space-y-3.5 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Proof Screenshot Inspection</span>
                </h3>
                {activeProofSub && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    User: <span className="font-mono text-amber-400 font-bold">{activeProofSub.uid}</span> • Task: {activeProofSub.taskName}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedProof(null);
                  setActiveProofSub(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto rounded-2xl bg-black flex items-center justify-center p-2 border border-slate-800">
              <img
                src={selectedProof}
                alt="Proof"
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Direct action buttons right under image */}
            {activeProofSub && activeProofSub.status === 'pending' ? (
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  disabled={actionLoading === activeProofSub.id}
                  onClick={() => handleApprove(activeProofSub)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/30 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Credit (+₹{activeProofSub.taskReward})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRejectModal({ isOpen: true, sub: activeProofSub })}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProof(null);
                    setActiveProofSub(null);
                  }}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedProof(null);
                  setActiveProofSub(null);
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close Viewer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.isOpen && rejectModal.sub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-rose-400">Reject Task Submission</h3>
            <p className="text-xs text-slate-400">
              Rejecting submission for task &ldquo;{rejectModal.sub.taskName}&rdquo; by user {rejectModal.sub.uid}.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rejection Reason (Visible to user)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Screenshot does not show joined channel status, please retry..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal({ isOpen: false, sub: null })}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow"
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
