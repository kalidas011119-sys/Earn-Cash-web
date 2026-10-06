import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { Settings, Save, CheckCircle2, ShieldAlert } from 'lucide-react';

export const SettingsManagement: React.FC = () => {
  const { state } = useApp();
  const currentSettings = state.settings;

  const [appName, setAppName] = useState(currentSettings.appName);
  const [signupBonus, setSignupBonus] = useState(currentSettings.signupBonus.toString());
  const [referralReward, setReferralReward] = useState(currentSettings.referralReward.toString());
  const [requiredTasks, setRequiredTasks] = useState(currentSettings.requiredReferralTasks.toString());
  const [supportTelegram, setSupportTelegram] = useState(currentSettings.supportTelegram);
  const [appVersion, setAppVersion] = useState(currentSettings.appVersion);
  const [companyInfo, setCompanyInfo] = useState(currentSettings.companyInfo);
  const [privacyPolicy, setPrivacyPolicy] = useState(currentSettings.privacyPolicy);
  const [aboutText, setAboutText] = useState(currentSettings.aboutText);
  const [withdrawalAmounts, setWithdrawalAmounts] = useState(currentSettings.withdrawalAmounts.join(', '));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmounts = withdrawalAmounts
      .split(',')
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);

    dbService.updateSettings(
      {
        appName: appName.trim(),
        signupBonus: Number(signupBonus) || 20,
        referralReward: Number(referralReward) || 20,
        requiredReferralTasks: Number(requiredTasks) || 3,
        supportTelegram: supportTelegram.trim(),
        appVersion: appVersion.trim(),
        companyInfo: companyInfo.trim(),
        privacyPolicy: privacyPolicy.trim(),
        aboutText: aboutText.trim(),
        withdrawalAmounts: parsedAmounts.length ? parsedAmounts : [100, 300, 500, 1000, 5000, 50000]
      },
      'ADMIN_8471835378'
    );

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">System Global Settings</h2>
          <p className="text-xs text-slate-400">
            Configure financial rules, reward bonuses, Telegram customer support link, and legal content
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Settings successfully updated! All changes reflect across all connected User Panels in real-time.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Financial Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Financial & Reward Rules</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                Automatic Signup Bonus (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={signupBonus}
                onChange={(e) => setSignupBonus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: ₹20</span>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                Referral Reward (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={referralReward}
                onChange={(e) => setReferralReward(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: ₹20</span>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                Required Tasks for Referral
              </label>
              <input
                type="number"
                min="1"
                required
                value={requiredTasks}
                onChange={(e) => setRequiredTasks(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 3 tasks</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Available Fixed Withdrawal Amounts (Comma-separated)
            </label>
            <input
              type="text"
              required
              value={withdrawalAmounts}
              onChange={(e) => setWithdrawalAmounts(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Default: 100, 300, 500, 1000, 5000, 50000
            </span>
          </div>
        </div>

        {/* Branding & Support */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-amber-400">Branding, App Details & Support Link</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">App Name</label>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">App Version</label>
              <input
                type="text"
                required
                value={appVersion}
                onChange={(e) => setAppVersion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                Support Link (Telegram)
              </label>
              <input
                type="url"
                required
                value={supportTelegram}
                onChange={(e) => setSupportTelegram(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-slate-300 font-bold mb-1.5">Company / Developer Info</label>
            <input
              type="text"
              required
              value={companyInfo}
              onChange={(e) => setCompanyInfo(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Content Management (About & Privacy Policy) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-amber-400">Legal & App Content Management</h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">About App Content</label>
              <textarea
                rows={3}
                required
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Privacy Policy Content</label>
              <textarea
                rows={4}
                required
                value={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-2xl text-sm shadow-xl hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save & Apply System Settings</span>
        </button>
      </form>
    </div>
  );
};
