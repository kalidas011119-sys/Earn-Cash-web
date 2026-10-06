import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { maskAccountNumber } from '../../services/db';
import { BankDetailsModal } from './BankDetailsModal';
import {
  User,
  Phone,
  Wallet,
  CheckCircle2,
  Building2,
  Headphones,
  Info,
  Shield,
  LogOut,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  X
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { currentUser, currentWallet, state, logoutUser, setShowAuthModal, setAuthMode } = useApp();
  const [showBankModal, setShowBankModal] = useState(false);
  const [modalType, setModalType] = useState<'support' | 'about' | 'privacy' | 'faq' | null>(null);

  if (!currentUser) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs space-y-3">
        <User className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">User Account</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Please login to manage your profile, view earnings, configure bank details, and get support.
        </p>
        <button
          onClick={() => {
            setAuthMode('login');
            setShowAuthModal(true);
          }}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow"
        >
          Log In / Sign Up
        </button>
      </div>
    );
  }

  const { settings } = state;

  return (
    <div className="space-y-4 pb-20">
      {/* Profile Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-900 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-xl shadow-inner text-white">
            {currentUser.phone.slice(-2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-300 bg-white/10 px-2 py-0.5 rounded-full">
                UID: {currentUser.uid}
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Active Member
              </span>
            </div>
            <p className="text-base font-bold mt-1 text-white flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>+91 {currentUser.phone}</span>
            </p>
            <p className="text-[10px] text-slate-400">
              Invite Code: <span className="font-mono text-yellow-300 font-bold">{currentUser.inviteCode}</span>
            </p>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10 text-center">
          <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10">
            <span className="text-[10px] text-emerald-200 block">Wallet Balance</span>
            <span className="text-lg font-black text-yellow-300">
              ₹{currentWallet?.balance.toLocaleString('en-IN') || 0}
            </span>
          </div>
          <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10">
            <span className="text-[10px] text-emerald-200 block">Total Lifetime Income</span>
            <span className="text-lg font-black text-white">
              ₹{currentWallet?.totalEarned.toLocaleString('en-IN') || 0}
            </span>
          </div>
          <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10">
            <span className="text-[10px] text-emerald-200 block">Tasks Completed</span>
            <span className="text-base font-black text-white">
              {currentWallet?.completedTaskCount || 0} Tasks
            </span>
          </div>
          <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10">
            <span className="text-[10px] text-emerald-200 block">Referral Earnings</span>
            <span className="text-base font-black text-emerald-400">
              ₹{currentWallet?.referralEarnings.toLocaleString('en-IN') || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Account Settings List */}
      <div className="bg-white rounded-3xl p-3 border border-slate-100 shadow-xs divide-y divide-slate-100">
        {/* Bank details item */}
        <button
          onClick={() => setShowBankModal(true)}
          className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Bank Account Details</h3>
              <p className="text-[11px] text-slate-400">
                {currentUser.bankDetails
                  ? `${currentUser.bankDetails.bankName} (${maskAccountNumber(currentUser.bankDetails.accountNumber)})`
                  : 'Add bank details for withdrawal'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Customer Support item */}
        <button
          onClick={() => setModalType('support')}
          className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Customer Support</h3>
              <p className="text-[11px] text-slate-400">Official Telegram support channel</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* FAQ */}
        <button
          onClick={() => setModalType('faq')}
          className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Help & FAQs</h3>
              <p className="text-[11px] text-slate-400">Common questions about tasks & payouts</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* About App */}
        <button
          onClick={() => setModalType('about')}
          className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">About {settings.appName}</h3>
              <p className="text-[11px] text-slate-400">Version {settings.appVersion}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Privacy Policy */}
        <button
          onClick={() => setModalType('privacy')}
          className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Privacy Policy</h3>
              <p className="text-[11px] text-slate-400">Terms, security & data policy</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Logout button */}
      <button
        onClick={logoutUser}
        className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out of Account</span>
      </button>

      {/* Bank Details Modal */}
      <BankDetailsModal isOpen={showBankModal} onClose={() => setShowBankModal(false)} />

      {/* Support / About / Privacy / FAQ Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base capitalize">
                {modalType === 'support'
                  ? 'Customer Support'
                  : modalType === 'about'
                  ? `About ${settings.appName}`
                  : modalType === 'privacy'
                  ? 'Privacy Policy'
                  : 'Frequently Asked Questions'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs text-slate-700 leading-relaxed">
              {modalType === 'support' && (
                <div className="space-y-4 text-center py-2">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <Headphones className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-800">24/7 Telegram Support</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Need help with a task verification or withdrawal? Connect with our dedicated support executive on Telegram.
                    </p>
                  </div>
                  <a
                    href={settings.supportTelegram}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                  >
                    <span>Open Official Telegram</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <p className="text-[11px] text-slate-400">
                    Channel: {settings.supportTelegram}
                  </p>
                </div>
              )}

              {modalType === 'about' && (
                <div className="space-y-3">
                  <div className="text-center py-2 border-b border-slate-100 pb-4">
                    <h4 className="text-xl font-black text-emerald-700">{settings.appName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Version {settings.appVersion}</p>
                  </div>
                  <p>{settings.aboutText}</p>
                  <div className="pt-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="font-semibold text-slate-700 mb-0.5">Company & Developer Info:</p>
                    <p>{settings.companyInfo}</p>
                  </div>
                </div>
              )}

              {modalType === 'privacy' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm">Earn Cash Privacy & Security Charter</h4>
                  <p className="whitespace-pre-line text-slate-600">{settings.privacyPolicy}</p>
                </div>
              )}

              {modalType === 'faq' && (
                <div className="space-y-3">
                  {settings.faqList.map((faq, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-800 text-xs mb-1">
                        Q: {faq.question}
                      </h4>
                      <p className="text-slate-600 text-[11px]">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="w-full py-2.5 bg-slate-800 text-white rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
