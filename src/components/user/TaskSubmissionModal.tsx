import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { X, ExternalLink, CheckCircle2, AlertCircle, Clock, Upload, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const TaskSubmissionModal: React.FC = () => {
  const { selectedTaskId, setSelectedTaskId, currentUser, setShowAuthModal, setAuthMode, state } = useApp();
  const [step, setStep] = useState<'details' | 'form' | 'success'>('details');
  const [contact, setContact] = useState('');
  const [proofImage, setProofImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedStatus, setSubmittedStatus] = useState<string>('pending');

  if (!selectedTaskId) return null;

  const task = state.tasks.find((t) => t.id === selectedTaskId);
  if (!task) return null;

  // Find existing submission for this user
  const userSubmission = currentUser
    ? state.submissions.find((s) => s.taskId === task.id && s.uid === currentUser.uid)
    : null;

  const handleStartEarn = () => {
    if (!currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    dbService.startTask(task.id, currentUser.uid);
    // Open external link safely
    window.open(task.taskLink, '_blank', 'noopener,noreferrer');
    setStep('form');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size exceeds 5MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset demo screenshots for fast mobile testing
  const useSampleProof = () => {
    setProofImage('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError(null);
    setLoading(true);

    if (!proofImage) {
      setError('Please upload or select proof screenshot');
      setLoading(false);
      return;
    }

    const res = dbService.submitTask({
      taskId: task.id,
      uid: currentUser.uid,
      phoneOrEmail: contact.trim() || currentUser.phone,
      proofImageUrl: proofImage
    });

    if (!res.success) {
      setError(res.error || 'Failed to submit proof');
      setLoading(false);
      return;
    }

    setSubmittedStatus(res.submission?.status || 'pending');
    setStep('success');
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={task.logo}
              alt={task.name}
              className="w-12 h-12 rounded-2xl object-cover bg-white/20 p-0.5 border border-white/30"
              onError={(e) => {
                (e.target as any).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  {task.category}
                </span>
                {task.approvalMode === 'automatic' ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-yellow-400 text-slate-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" /> Auto Approval
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Manual Review
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold leading-tight mt-1 line-clamp-1">
                {task.name}
              </h2>
            </div>
          </div>
          <button
            onClick={() => setSelectedTaskId(null)}
            className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* Reward banner */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Reward Payout
              </span>
              <p className="text-2xl font-black text-emerald-700">₹{task.reward}</p>
            </div>
            {task.isReferralEligible && (
              <div className="text-right">
                <span className="inline-block bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                  Counts for Referral ₹20
                </span>
                <p className="text-[11px] text-emerald-700 mt-1">Eligible for 3-task bonus</p>
              </div>
            )}
          </div>

          {/* If already submitted */}
          {userSubmission && step !== 'success' && (
            <div className={`p-4 rounded-2xl border text-sm ${
              userSubmission.status === 'approved' || userSubmission.status === 'completed'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : userSubmission.status === 'rejected'
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-amber-50 border-amber-300 text-amber-800'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {userSubmission.status === 'approved' || userSubmission.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : userSubmission.status === 'rejected' ? (
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600" />
                )}
                <span className="capitalize">Status: {userSubmission.status}</span>
              </div>
              <p className="text-xs">
                {userSubmission.status === 'approved' || userSubmission.status === 'completed'
                  ? `Task completed! ₹${userSubmission.taskReward} has been added to your wallet.`
                  : userSubmission.status === 'rejected'
                  ? `Rejected: ${userSubmission.rejectionReason || 'Proof did not match instructions.'}`
                  : 'Your submission is under review by admin.'}
              </p>
            </div>
          )}

          {step === 'details' && !userSubmission && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">{task.description}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Required Steps
                </h3>
                <div className="space-y-2">
                  {task.steps.map((st, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{st}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Rules & Conditions
                </h3>
                <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                  {task.rules.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                  {task.conditions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartEarn}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
                >
                  <span>Start Earn</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'form' && !userSubmission && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs p-3 rounded-xl flex items-center justify-between">
                <span>Task Link opened in new tab. Completed the steps? Submit your proof below.</span>
                <a
                  href={task.taskLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 font-bold underline shrink-0 ml-2"
                >
                  Reopen Link
                </a>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* UID strictly read-only */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your UID (Read-only)
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={currentUser?.uid || ''}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600 cursor-not-allowed font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  UID is protected and bound to your authenticated account.
                </span>
              </div>

              {/* Phone or Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Phone or Email
                </label>
                <input
                  type="text"
                  required
                  placeholder={currentUser?.phone || 'Enter your phone/email'}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Proof Image Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Upload Proof Screenshot
                  </label>
                  <button
                    type="button"
                    onClick={useSampleProof}
                    className="text-[11px] text-emerald-600 hover:underline font-semibold"
                  >
                    Use Sample Demo Proof
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-emerald-500 transition cursor-pointer relative bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {proofImage ? (
                    <div className="space-y-2">
                      <img
                        src={proofImage}
                        alt="Proof preview"
                        className="max-h-40 mx-auto rounded-lg shadow-sm border border-slate-200 object-contain"
                      />
                      <p className="text-[11px] text-emerald-600 font-semibold">
                        Image ready. Click to change.
                      </p>
                    </div>
                  ) : (
                    <div className="py-3 text-slate-500">
                      <Upload className="w-8 h-8 mx-auto mb-1 text-slate-400" />
                      <p className="text-xs font-semibold text-slate-700">Click to upload screenshot</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Submitting...' : 'Submit Proof for Reward'}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  {submittedStatus === 'approved' ? 'Reward Credited!' : 'Proof Submitted!'}
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                  {submittedStatus === 'approved'
                    ? `Automatic approval passed! ₹${task.reward} has been deposited to your wallet balance instantly.`
                    : 'Your proof has been submitted to Admin. Once verified, ₹' + task.reward + ' will be credited.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTaskId(null)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800"
              >
                Close & Continue Earning
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
