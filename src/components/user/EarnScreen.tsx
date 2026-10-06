import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Zap, ShieldCheck, CheckCircle2, Search, ArrowRight, ExternalLink } from 'lucide-react';

export const EarnScreen: React.FC = () => {
  const { state, currentUser, setSelectedTaskId } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Collect unique categories
  const categories = ['All', ...Array.from(new Set(state.tasks.map((t) => t.category)))];

  // Filter tasks that are active and NOT already completed by this user
  const activeTasks = state.tasks.filter((task) => {
    if (task.status !== 'active') return false;

    if (currentUser) {
      const isCompleted = state.submissions.some(
        (sub) =>
          sub.taskId === task.id &&
          sub.uid === currentUser.uid &&
          (sub.status === 'approved' || sub.status === 'completed')
      );
      if (isCompleted) return false;
    }

    if (selectedCategory !== 'All' && task.category !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.name.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.category.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 rounded-3xl text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 bg-white/10 px-2 py-0.5 rounded-full">
              Reward Zone
            </span>
            <h1 className="text-xl font-black mt-1">Available Tasks</h1>
            <p className="text-xs text-emerald-100 mt-0.5">
              Complete tasks & earn real cash directly in wallet
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-bold text-yellow-300">
            <Zap className="w-7 h-7 fill-current" />
          </div>
        </div>
      </div>

      {/* Search & Categories */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {activeTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No tasks found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              You have completed all active tasks in this category or no tasks match your search.
            </p>
          </div>
        ) : (
          activeTasks.map((task) => {
            // Check if user has a pending or rejected submission
            const userSub = currentUser
              ? state.submissions.find((s) => s.taskId === task.id && s.uid === currentUser.uid)
              : null;

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:border-emerald-300 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={task.logo}
                      alt={task.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-100 shrink-0"
                      onError={(e) => {
                        (e.target as any).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60';
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {task.category}
                        </span>
                        {task.approvalMode === 'automatic' ? (
                          <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5 fill-current" /> Auto Approval
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" /> Manual Review
                          </span>
                        )}
                      </div>
                      <h2 className="text-sm font-bold text-slate-900 leading-snug">{task.name}</h2>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-lg font-black text-emerald-600 block">
                      +₹{task.reward}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Reward</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    {userSub ? (
                      <span className={`font-bold capitalize px-2 py-0.5 rounded ${
                        userSub.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : userSub.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Status: {userSub.status}
                      </span>
                    ) : (
                      <span className="text-slate-400">Status: Available</span>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedTaskId(task.id)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-xs shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <span>{userSub ? 'View Details' : 'Start Earn'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
