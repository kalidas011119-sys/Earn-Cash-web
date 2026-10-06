import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, ShieldAlert, History } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const { state } = useApp();
  const [search, setSearch] = useState('');

  const logs = state.auditLogs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.targetRecord.toLowerCase().includes(q) ||
      log.adminId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Immutable Security & Financial Audit Logs</h2>
          <p className="text-xs text-slate-400">
            Cryptographic audit trail of all administrative actions, financial disbursements, and settings changes
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-700">
              <tr>
                <th className="p-4">Log ID</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Admin Operator</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Audit Details</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                    No audit records found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4 text-slate-500">{log.id}</td>
                    <td className="p-4">
                      <span className="font-bold text-amber-400 font-sans">{log.action}</span>
                    </td>
                    <td className="p-4 text-white font-bold">{log.adminId}</td>
                    <td className="p-4 text-emerald-400">{log.targetRecord}</td>
                    <td className="p-4 text-slate-300 font-sans max-w-sm">{log.details}</td>
                    <td className="p-4 text-right text-slate-400 text-[10px]">
                      {new Date(log.timestamp).toLocaleString()}
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
