import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  Sparkles,
  Users,
  Trophy,
  ChevronRight,
  Zap,
  Gift,
  TrendingUp,
  CheckCircle2,
  Share2,
  Clock
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { state, currentUser, currentWallet, setActiveUserTab, setSelectedTaskId, setShowAuthModal, setAuthMode } = useApp();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const activeBanners = state.banners.filter((b) => b.isActive);

  // Auto rotate banners
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const rankings = dbService.getInviteRankings().slice(0, 5);

  // Available tasks (active and not completed by current user)
  const availableTasks = state.tasks.filter((t) => {
    if (t.status !== 'active') return false;
    if (currentUser) {
      const done = state.submissions.some(
        (s) => s.taskId === t.id && s.uid === currentUser.uid && (s.status === 'approved' || s.status === 'completed')
      );
      if (done) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Welcome & Wallet Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-5 text-white shadow-xl">
        {/* Glow circles */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-teal-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-yellow-300">
                ₹
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-emerald-100 font-semibold">
                  Wallet Balance
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tight">
                    ₹{currentWallet ? currentWallet.balance.toLocaleString('en-IN') : '0'}
                  </span>
                  <span className="text-[11px] text-emerald-200">INR</span>
                </div>
              </div>
            </div>

            {currentUser ? (
              <div className="text-right">
                <span className="inline-block text-[10px] font-mono bg-white/15 px-2.5 py-1 rounded-full text-emerald-100 border border-white/20 font-bold">
                  UID: {currentUser.uid}
                </span>
                <p className="text-[10px] text-emerald-200 mt-1">
                  {currentUser.phone ? `+91 ${currentUser.phone}` : ''}
                </p>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                className="bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow hover:bg-yellow-300 transition"
              >
                Sign Up (+₹20)
              </button>
            )}
          </div>

          {/* Quick stats in wallet */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
            <div className="bg-white/10 rounded-xl p-2">
              <span className="text-[10px] text-emerald-200 block">Total Earned</span>
              <span className="text-xs font-bold">
                ₹{currentWallet ? currentWallet.totalEarned.toLocaleString('en-IN') : '0'}
              </span>
            </div>
            <div className="bg-white/10 rounded-xl p-2">
              <span className="text-[10px] text-emerald-200 block">Referral Inc.</span>
              <span className="text-xs font-bold">
                ₹{currentWallet ? currentWallet.referralEarnings.toLocaleString('en-IN') : '0'}
              </span>
            </div>
            <div className="bg-white/10 rounded-xl p-2">
              <span className="text-[10px] text-emerald-200 block">Tasks Done</span>
              <span className="text-xs font-bold">
                {currentWallet ? currentWallet.completedTaskCount : 0}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 mt-4">
            <button
              onClick={() => setActiveUserTab('withdraw')}
              className="flex-1 py-2.5 bg-yellow-400 text-slate-900 font-bold text-xs rounded-xl shadow hover:bg-yellow-300 transition flex items-center justify-center gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4" /> Withdraw Cash
            </button>
            <button
              onClick={() => setActiveUserTab('earn')}
              className="flex-1 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl border border-white/30 transition flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-yellow-300" /> Start Tasks
            </button>
          </div>
        </div>
      </div>

      {/* Banner Carousel */}
      {activeBanners.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-21/9 bg-slate-900 group">
          <img
            src={activeBanners[currentBannerIndex]?.imageUrl}
            alt={activeBanners[currentBannerIndex]?.title}
            className="w-full h-full object-cover transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
            <span className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">
              Special Event
            </span>
            <h3 className="text-sm font-bold line-clamp-1">
              {activeBanners[currentBannerIndex]?.title}
            </h3>
          </div>
          {/* Dots */}
          <div className="absolute bottom-2 right-3 flex gap-1">
            {activeBanners.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentBannerIndex ? 'bg-white w-4' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Navigation grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <button
          onClick={() => setActiveUserTab('earn')}
          className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-500 transition group"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 block">Daily Tasks</span>
        </button>

        <button
          onClick={() => setActiveUserTab('invite')}
          className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-500 transition group"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
            <Gift className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 block">Invite ₹20</span>
        </button>

        <button
          onClick={() => setActiveUserTab('withdraw')}
          className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-500 transition group"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
            <WalletIcon className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 block">Withdraw</span>
        </button>

        <button
          onClick={() => setActiveUserTab('history')}
          className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-500 transition group"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 block">History</span>
        </button>
      </div>

      {/* Featured / Recommended Tasks Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Available Tasks</span>
            </h2>
            <p className="text-[11px] text-slate-500">Complete & get instant cash</p>
          </div>
          <button
            onClick={() => setActiveUserTab('earn')}
            className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 hover:underline"
          >
            <span>View All ({availableTasks.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {availableTasks.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-2xl border border-slate-100 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-slate-700">All available tasks completed!</p>
            <p className="text-[11px] text-slate-400">
              Tap below to automatically generate new daily bonus earning tasks.
            </p>
            <button
              type="button"
              onClick={() => {
                dbService.autoReplenishTasks('DAILY_AUTO_SYSTEM');
                setActiveUserTab('earn');
              }}
              className="mt-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold shadow hover:opacity-95 cursor-pointer active:scale-95 transition"
            >
              ⚡ Auto-Add Fresh Daily Tasks
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {availableTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between hover:border-emerald-400 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={task.logo}
                    alt={task.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-100 shrink-0"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60';
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] font-bold uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {task.category}
                      </span>
                      {task.approvalMode === 'automatic' && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 fill-current" /> Instant
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{task.name}</h3>
                    <p className="text-[11px] text-emerald-600 font-extrabold mt-0.5">
                      Reward: +₹{task.reward}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTaskId(task.id)}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow hover:scale-102 transition shrink-0"
                >
                  Start Earn
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Ranking List */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Top Invite Leaderboard</h3>
              <p className="text-[10px] text-slate-400">Users earning with referrals</p>
            </div>
          </div>
          <button
            onClick={() => setActiveUserTab('invite')}
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            Invite Friends
          </button>
        </div>

        <div className="space-y-2">
          {rankings.map((user, idx) => (
            <div
              key={user.uid}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                    idx === 0
                      ? 'bg-amber-400 text-slate-900'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-800'
                      : idx === 2
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {user.rank}
                </span>
                <div>
                  <span className="font-bold text-slate-800 font-mono">{user.maskedPhone}</span>
                  <span className="text-[10px] text-slate-400 block">
                    {user.successfulReferrals} active referrals
                  </span>
                </div>
              </div>
              <span className="font-extrabold text-emerald-600">
                +₹{user.referralEarnings.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
