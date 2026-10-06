import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService, maskAccountNumber } from '../../services/db';
import { BankDetailsModal } from './BankDetailsModal';
import {
  Wallet as WalletIcon,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Lock
} from 'lucide-react';

export const WithdrawScreen: React.FC = () => {
  const { currentUser, currentWallet, state, setShowAuthModal, setAuthMode } = useApp();
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [showBankModal, setShowBankModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const amounts = state.settings.withdrawalAmounts || [100, 300, 500, 1000, 5000, 50000];
  const userBalance = currentWallet ? currentWallet.balance : 0;
  const bankDetails = currentUser?.bankDetails;

  // Withdrawals for this user
  const userWithdrawals = currentUser
    ? state.withdrawals.filter((w) => w.uid === currentUser.uid)
    : [];

  const handleWithdrawSubmit = () => {
    setError(null);
    setSuccess(null);

    if (!currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    if (!bankDetails) {
      setError('Please add your Bank Details first before submitting a withdrawal request.');
      setShowBankModal(true);
      return;
    }

    if (userBalance < selectedAmount) {
      setError(`Insufficient balance. You have ₹${userBalance}, required ₹${selectedAmount}.`);
      return;
    }

    setLoading(true);

    const res = dbService.requestWithdrawal(currentUser.uid, selectedAmount);
    if (!res.success) {
      setError(res.error || 'Failed to submit withdrawal request.');
      setLoading(false);
      return;
    }

    setSuccess(`Withdrawal request of ₹${selectedAmount} submitted successfully! Your funds are reserved.`);
    setLoading(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Wallet Card */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
              Available For Withdrawal
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black">₹{userBalance.toLocaleString('en-IN')}</span>
              <span className="text-xs text-emerald-200">INR</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <WalletIcon className="w-6 h-6 text-yellow-300" />
          </div>
        </div>
      </div>

      {/* Bank Details Status Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-slate-800">Bank Account Details</h2>
          </div>
          {bankDetails ? (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified & Locked
            </span>
          ) : (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Required
            </span>
          )}
        </div>

        {bankDetails ? (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Bank:</span>
              <span className="font-bold text-slate-800">{bankDetails.bankName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Holder:</span>
              <span className="font-bold text-slate-800">{bankDetails.accountHolderName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Account:</span>
              <span className="font-mono font-bold text-slate-800">
                {maskAccountNumber(bankDetails.accountNumber)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">IFSC:</span>
              <span className="font-mono font-bold text-emerald-700">{bankDetails.ifscCode}</span>
            </div>
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setShowBankModal(true)}
                className="text-[11px] text-emerald-600 hover:underline font-semibold"
              >
                View Full Details
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-2">
            <p className="text-[11px] leading-relaxed">
              You must link your bank account once to receive payouts. Bank details will be securely locked after saving.
            </p>
            <button
              onClick={() => setShowBankModal(true)}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Bank Account Now</span>
            </button>
          </div>
        )}
      </div>

      {/* Select Amount */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-slate-800">Select Withdrawal Amount</h2>

        <div className="grid grid-cols-3 gap-2.5">
          {amounts.map((amt) => {
            const isSelected = selectedAmount === amt;
            const canAfford = userBalance >= amt;

            return (
              <button
                key={amt}
                type="button"
                onClick={() => setSelectedAmount(amt)}
                className={`py-3 px-2 rounded-2xl font-black text-sm border transition flex flex-col items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>₹{amt.toLocaleString('en-IN')}</span>
                <span
                  className={`text-[9px] font-normal mt-0.5 ${
                    canAfford ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {canAfford ? 'Eligible' : 'Needs more'}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="button"
          disabled={loading || userBalance < selectedAmount}
          onClick={handleWithdrawSubmit}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition active:scale-98 cursor-pointer"
        >
          {loading ? 'Processing...' : `Withdraw ₹${selectedAmount.toLocaleString('en-IN')}`}
        </button>
      </div>

      {/* Withdrawal History */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-slate-800">Recent Withdrawals</h2>

        {userWithdrawals.length === 0 ? (
          <p className="text-center py-4 text-slate-400 text-xs">No withdrawal requests yet</p>
        ) : (
          <div className="space-y-2">
            {userWithdrawals.map((wth) => (
              <div
                key={wth.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-800 text-sm">
                    ₹{wth.amount.toLocaleString('en-IN')}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      wth.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : wth.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : wth.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {wth.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span className="font-mono">ID: {wth.id}</span>
                  <span>{new Date(wth.requestedAt).toLocaleDateString()}</span>
                </div>
                {wth.rejectionReason && (
                  <p className="text-[10px] text-rose-600 pt-0.5">
                    Reason: {wth.rejectionReason} (Amount refunded)
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BankDetailsModal isOpen={showBankModal} onClose={() => setShowBankModal(false)} />
    </div>
  );
};
