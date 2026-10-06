import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService, maskPhone } from '../../services/db';
import { Gift, Users, Trophy, Settings, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

export const ReferralManagement: React.FC = () => {
  const { state } = useApp();
  const [rewardAmount, setRewardAmount] = useState(state.settings.referralReward.toString());
  const [requiredTasks, setRequiredTasks] = useState(state.settings.requiredReferralTasks.toString());
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.updateSettings(
      {
        referralReward: Number(rewardAmount) || 20,
        requiredReferralTasks: Number(requiredTasks) || 3
      },
      'ADMIN_8471835378'
    );
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const totalReferrals = state.referrals.length;
  const rewardedReferrals = state.referrals.filter((r) => r.rewardPaid || r.status === 'rewarded').length;
  const inProgressReferrals = state.referrals.filter((r) => !r.rewardPaid && r.status !== 'rewarded').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-black text-white">Referral Program Management</h2>
        <p className="text-xs text-slate-400">
          Audit inviter relationships, track 3-task completion qualification, and adjust referral incentives
        </p>
      </div>

      {/* Referral Program Config Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-amber-400" />
          <span>Referral Program Parameters</span>
        </h3>

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Referral Reward Payout (₹)
            </label>
            <input
              type="number"
              min="1"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Default: ₹20 per successful invite</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Required Eligible Tasks
            </label>
            <input
              type="number"
              min="1"
              value={requiredTasks}
              onChange={(e) => setRequiredTasks(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Default: 3 tasks to unlock bonus</span>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition cursor-pointer"
            >
              {savedNotice ? '✓ Saved & Applied!' : 'Update Referral Config'}
            </button>
          </div>
        </form>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Referrals</span>
          <p className="text-2xl font-black text-white mt-1">{totalReferrals}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs font-bold text-slate-400 uppercase">3-Task Qualified</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{rewardedReferrals}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs font-bold text-slate-400 uppercase">In Progress</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{inProgressReferrals}</p>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-700">
              <tr>
                <th className="p-4">Inviter UID</th>
                <th className="p-4">Invited User UID</th>
                <th className="p-4">Invited Phone</th>
                <th className="p-4">Eligible Tasks Completed</th>
                <th className="p-4">Referral Status</th>
                <th className="p-4">Reward Amount</th>
                <th className="p-4">Invite Date</th>
                <th className="p-4 text-right">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {state.referrals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No referrals recorded yet
                  </td>
                </tr>
              ) : (
                state.referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4 font-mono font-bold text-amber-400">{ref.inviterUid}</td>
                    <td className="p-4 font-mono font-bold text-white">{ref.invitedUid}</td>
                    <td className="p-4 font-mono text-slate-300">{maskPhone(ref.invitedPhone)}</td>
                    <td className="p-4 font-bold">
                      <span className="text-white">{ref.eligibleTasksCompleted}</span>
                      <span className="text-slate-500"> / {ref.requiredTasks || 3}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          ref.status === 'rewarded'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : ref.status === 'qualified'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {ref.status}
                      </span>
                    </td>
                    <td className="p-4 font-black text-emerald-400">
                      ₹{ref.rewardAmount || state.settings.referralReward || 20}
                    </td>
                    <td className="p-4 text-[10px] text-slate-400">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {ref.rewardPaid ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          Paid to Inviter
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          Pending 3 tasks completion
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
    </div>
  );
};
