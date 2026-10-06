import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { Bell, Send, CheckCircle2 } from 'lucide-react';

export const NotificationManagement: React.FC = () => {
  const { state } = useApp();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sentNotice, setSentNotice] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    dbService.addNotification(title.trim(), message.trim(), 'ADMIN_8471835378');
    setTitle('');
    setMessage('');
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Broadcast Notifications</h2>
        <p className="text-xs text-slate-400">
          Send instantaneous announcements and alerts directly to all user mobile panels
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Announcement Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-400" />
            <span>Compose Announcement</span>
          </h3>

          {sentNotice && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Broadcast alert sent to all user panels!</span>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Alert Title</label>
              <input
                type="text"
                required
                placeholder="e.g. ⚡ Special 2X Task Bonus Today!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Message Content</label>
              <textarea
                required
                rows={4}
                placeholder="Write detailed message text for users..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-xs shadow-lg hover:opacity-95 transition cursor-pointer"
            >
              Broadcast Notification to Users
            </button>
          </form>
        </div>

        {/* Existing Notifications History */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <span>Active Broadcasts ({state.notifications.length})</span>
          </h3>

          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {state.notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 bg-slate-800/70 border border-slate-700/60 rounded-2xl text-xs space-y-1"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white text-xs">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{n.message}</p>
                <span className="text-[9px] text-amber-400 block font-mono">
                  Target: {n.target}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
