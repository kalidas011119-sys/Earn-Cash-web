import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService, maskPhone } from '../../services/db';
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Trophy,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const InviteScreen: React.FC = () => {
  const { currentUser, currentWallet, state, setShowAuthModal, setAuthMode } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inviteCode = currentUser?.inviteCode || 'ECXXXX';
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteLink = `${appOrigin}/?ref=${inviteCode}`;

  const copyToClipboard = (text: string, isLink: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const shareViaWhatsApp = () => {
    const text = `Hey! Join Earn Cash to earn daily rewards. Use my Invite Code: ${inviteCode} to get ₹20 signup bonus! Register here: ${inviteLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Referrals made by this user
  const myReferrals = currentUser
    ? state.referrals.filter((r) => r.inviterUid === currentUser.uid)
    : [];

  const successfulInvites = myReferrals.filter(
    (r) => r.status === 'rewarded' || r.status === 'qualified' || r.rewardPaid
  ).length;

  const totalInviteEarnings = currentWallet?.referralEarnings || (successfulInvites * 20);

  const rankings = dbService.getInviteRankings();

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-emerald-700 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Referral Program
            </span>
            <span className="text-[10px] font-bold text-yellow-300">₹20 per active friend</span>
          </div>
          <h1 className="text-2xl font-black">Invite & Earn ₹20</h1>
          <p className="text-xs text-purple-100 mt-1 max-w-xs">
            Share your invite code. When your friend completes 3 eligible tasks, you instantly get ₹20 in your wallet!
          </p>

          {/* User code box */}
          {currentUser ? (
            <div className="mt-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-purple-200 block">Your Invite Code</span>
                <span className="text-xl font-black font-mono tracking-widest text-yellow-300">
                  {inviteCode}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(inviteCode, false)}
                className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow hover:bg-slate-100 transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
              className="mt-4 w-full py-2.5 bg-yellow-400 text-slate-900 rounded-xl font-bold text-xs shadow"
            >
              Log in to see your Invite Code
            </button>
          )}

          {/* Action buttons */}
          {currentUser && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => copyToClipboard(inviteLink, true)}
                className="flex-1 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-white/20 transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
              </button>
              <button
                onClick={shareViaWhatsApp}
                className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Total Invited</span>
          <p className="text-lg font-black text-slate-800 mt-0.5">{myReferrals.length}</p>
          <span className="text-[10px] text-slate-400">Users</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Successful</span>
          <p className="text-lg font-black text-emerald-600 mt-0.5">{successfulInvites}</p>
          <span className="text-[10px] text-slate-400">3 tasks done</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Total Earnings</span>
          <p className="text-lg font-black text-purple-600 mt-0.5">₹{totalInviteEarnings}</p>
          <span className="text-[10px] text-slate-400">Paid to wallet</span>
        </div>
      </div>

      {/* Rules Explainer */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-amber-800">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>Referral Reward Rule:</span>
        </div>
        <p className="text-[11px] leading-relaxed text-amber-950">
          The ₹20 referral reward is <strong>not paid immediately upon signup</strong>. To prevent fraud, your invited friend must complete at least <strong>3 eligible tasks</strong>. Once they complete 3 tasks, ₹20 is automatically deposited into your wallet balance!
        </p>
      </div>

      {/* My Referrals List */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-slate-800">My Referrals ({myReferrals.length})</h2>
          </div>
          <span className="text-[10px] text-slate-400">Live progress tracker</span>
        </div>

        {myReferrals.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No friends invited yet. Share your code above to start earning!
          </div>
        ) : (
          <div className="space-y-2.5">
            {myReferrals.map((ref) => {
              const completed = ref.eligibleTasksCompleted || 0;
              const required = ref.requiredTasks || 3;
              const percent = Math.min(100, Math.round((completed / required) * 100));

              return (
                <div
                  key={ref.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-800">
                        {ref.invitedUid}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        {maskPhone(ref.invitedPhone)}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ref.rewardPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : completed >= required
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ref.rewardPaid
                        ? '₹20 Rewarded'
                        : completed >= required
                        ? 'Condition Met'
                        : `${completed}/${required} Tasks`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span>Tasks: {completed} / {required} completed</span>
                      <span>{ref.rewardPaid ? 'Reward paid' : 'Needs 3 tasks'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite Ranking Leaderboard */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-bold text-slate-800">Top Invite Ranking</h2>
          </div>
          <span className="text-[10px] text-slate-400">All-time champions</span>
        </div>

        <div className="space-y-2">
          {rankings.map((user, idx) => (
            <div
              key={user.uid}
              className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs ${
                idx === 0
                  ? 'bg-amber-50/50 border-amber-200'
                  : idx === 1
                  ? 'bg-slate-50 border-slate-200'
                  : idx === 2
                  ? 'bg-orange-50/40 border-orange-200'
                  : 'bg-white border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                    idx === 0
                      ? 'bg-amber-400 text-slate-900 shadow-xs'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-800'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {user.rank}
                </span>
                <div>
                  <p className="font-bold text-slate-800 font-mono text-xs">{user.maskedPhone}</p>
                  <p className="text-[10px] text-slate-400">
                    UID: {user.uid} • {user.successfulReferrals} active referrals
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-black text-emerald-600 block text-xs">
                  +₹{user.referralEarnings.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] text-slate-400">Earned</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
