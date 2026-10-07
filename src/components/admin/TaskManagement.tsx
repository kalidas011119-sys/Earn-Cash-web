import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { Task } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Zap,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X
} from 'lucide-react';

export const TaskManagement: React.FC = () => {
  const { state } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [reward, setReward] = useState('25');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('Stay active for 7 days\nOne submission per user');
  const [conditions, setConditions] = useState('Valid registered account\nOriginal screenshot proof');
  const [steps, setSteps] = useState('Open the task link\nComplete the required action\nUpload screenshot proof');
  const [taskLink, setTaskLink] = useState('https://t.me/luckyuserbonus');
  const [category, setCategory] = useState('Social');
  const [status, setStatus] = useState<'active' | 'inactive' | 'expired'>('active');
  const [approvalMode, setApprovalMode] = useState<'manual' | 'automatic'>('manual');
  const [isReferralEligible, setIsReferralEligible] = useState(true);

  const openAddModal = () => {
    setEditingTask(null);
    setName('');
    setLogo('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60');
    setReward('25');
    setDescription('Complete this simple task to earn instant cash reward.');
    setRules('Stay active for 7 days\nOne submission per user');
    setConditions('Valid registered account\nOriginal screenshot proof');
    setSteps('Open the task link\nComplete the required action\nUpload screenshot proof');
    setTaskLink('https://t.me/luckyuserbonus');
    setCategory('Social');
    setStatus('active');
    setApprovalMode('manual');
    setIsReferralEligible(true);
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setName(task.name);
    setLogo(task.logo);
    setReward(task.reward.toString());
    setDescription(task.description);
    setRules(task.rules.join('\n'));
    setConditions(task.conditions.join('\n'));
    setSteps(task.steps.join('\n'));
    setTaskLink(task.taskLink);
    setCategory(task.category);
    setStatus(task.status);
    setApprovalMode(task.approvalMode);
    setIsReferralEligible(task.isReferralEligible);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const taskData: Partial<Task> = {
      ...(editingTask ? { id: editingTask.id } : {}),
      name: name.trim(),
      logo: logo.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
      reward: Number(reward) || 20,
      description: description.trim(),
      rules: rules.split('\n').map((s) => s.trim()).filter(Boolean),
      conditions: conditions.split('\n').map((s) => s.trim()).filter(Boolean),
      steps: steps.split('\n').map((s) => s.trim()).filter(Boolean),
      taskLink: taskLink.trim(),
      category: category.trim(),
      status,
      approvalMode,
      isReferralEligible
    };

    dbService.saveTask(taskData, 'ADMIN_8471835378');
    setModalOpen(false);
  };

  const openDeleteConfirm = (task: Task, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTaskToDelete(task);
  };

  const confirmDelete = () => {
    if (taskToDelete && !isDeleting) {
      setIsDeleting(true);
      const deletedName = taskToDelete.name;
      const res = dbService.deleteTask(taskToDelete.id, 'ADMIN_8471835378');
      setIsDeleting(false);
      setTaskToDelete(null);
      if (res.success) {
        setDeleteNotice(`Task "${deletedName}" was deleted successfully.`);
        setTimeout(() => setDeleteNotice(null), 3500);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Task Management</h2>
          <p className="text-xs text-slate-400">
            Create and edit tasks, configure reward amounts and toggle automatic approvals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const res = dbService.autoReplenishTasks('ADMIN_8471835378');
              setDeleteNotice(`⚡ ${res.count} fresh daily tasks generated successfully!`);
              setTimeout(() => setDeleteNotice(null), 3500);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl text-xs border border-slate-700 transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Auto-Add Daily Tasks</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg hover:opacity-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Task</span>
          </button>
        </div>
      </div>

      {deleteNotice && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{deleteNotice}</span>
        </div>
      )}

      {/* Task List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-700">
              <tr>
                <th className="p-4">Task</th>
                <th className="p-4">Category</th>
                <th className="p-4">Reward</th>
                <th className="p-4">Approval Mode</th>
                <th className="p-4">Referral Bonus</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {state.tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={task.logo}
                        alt={task.name}
                        className="w-10 h-10 rounded-xl object-cover bg-slate-800 border border-slate-700 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-white block">{task.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {task.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 text-[10px] font-bold">
                      {task.category}
                    </span>
                  </td>
                  <td className="p-4 font-black text-emerald-400 text-sm">₹{task.reward}</td>
                  <td className="p-4">
                    {task.approvalMode === 'automatic' ? (
                      <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                        <Zap className="w-3 h-3 fill-current" /> Auto Approval
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                        <ShieldCheck className="w-3 h-3" /> Manual Review
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {task.isReferralEligible ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Yes (Counts 1/3)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">No</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        task.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(task)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1 font-bold text-xs"
                        title="Edit Task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => openDeleteConfirm(task, e)}
                        className="px-2.5 py-1.5 bg-rose-950/90 hover:bg-rose-900 text-rose-300 hover:text-white rounded-xl transition border border-rose-800/60 cursor-pointer flex items-center gap-1 font-bold text-xs shadow-xs"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Modal (Add/Edit) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full text-white space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black">
                {editingTask ? 'Edit Task Campaign' : 'Create New Task Campaign'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto space-y-3.5 pr-1 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Task Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Join Official Telegram"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Reward Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Social, App Install, Review..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Task Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="active">Active (Visible in App)</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              {/* Approval Mode & Referral Eligibility */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
                <div>
                  <label className="block text-[11px] font-bold text-amber-400 mb-1">
                    Approval Mode
                  </label>
                  <select
                    value={approvalMode}
                    onChange={(e) => setApprovalMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  >
                    <option value="manual">1. Manual Approval</option>
                    <option value="automatic">2. Automatic Approval (Instant)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-400 mb-1">
                    Referral Qualification
                  </label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="refEligible"
                      checked={isReferralEligible}
                      onChange={(e) => setIsReferralEligible(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700"
                    />
                    <label htmlFor="refEligible" className="text-slate-300 text-xs">
                      Counts toward 3-task referral
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Task Link</label>
                <input
                  type="url"
                  required
                  placeholder="https://t.me/luckyuserbonus"
                  value={taskLink}
                  onChange={(e) => setTaskLink(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Logo / Icon Image URL
                </label>
                <input
                  type="url"
                  required
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Task Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Rules (one per line)
                  </label>
                  <textarea
                    rows={2}
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Required Steps (one per line)
                  </label>
                  <textarea
                    rows={2}
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-xs shadow-lg hover:opacity-95 transition"
                >
                  {editingTask ? 'Save Task Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-md w-full text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Delete Task Campaign?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Task Name:</span>
                <span className="font-bold text-white text-right line-clamp-1">{taskToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Task ID:</span>
                <span className="font-mono text-amber-400">{taskToDelete.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reward:</span>
                <span className="font-black text-emerald-400">₹{taskToDelete.reward}</span>
              </div>
            </div>

            <p className="text-xs text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-800/40">
              The task will be immediately deleted from the database and will no longer appear in the User Panel.
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs transition shadow-lg shadow-rose-900/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Task'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
