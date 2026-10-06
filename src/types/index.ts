export interface User {
  uid: string;
  phone: string;
  passwordHash: string;
  inviteCode: string;
  inviterUid?: string | null;
  inviterCode?: string | null;
  status: 'active' | 'suspended';
  createdAt: string;
  bankDetails?: BankDetails | null;
}

export interface BankDetails {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  isLocked: boolean;
  savedAt: string;
}

export interface Wallet {
  uid: string;
  balance: number;
  totalEarned: number;
  referralEarnings: number;
  completedTaskCount: number;
  lastUpdated: string;
}

export interface WalletTransaction {
  id: string;
  uid: string;
  amount: number;
  type: 'credit' | 'debit';
  category: 
    | 'signup_bonus' 
    | 'task_reward' 
    | 'referral_reward' 
    | 'admin_credit' 
    | 'admin_debit' 
    | 'withdrawal_hold' 
    | 'withdrawal_refund';
  description: string;
  createdAt: string;
  adminId?: string;
  referenceId?: string;
}

export interface Task {
  id: string;
  name: string;
  logo: string;
  reward: number;
  description: string;
  rules: string[];
  conditions: string[];
  steps: string[];
  taskLink: string;
  category: string;
  status: 'active' | 'inactive' | 'expired';
  approvalMode: 'manual' | 'automatic';
  isReferralEligible: boolean;
  createdAt: string;
  startDate?: string;
  endDate?: string;
}

export interface TaskStart {
  id: string;
  taskId: string;
  uid: string;
  startedAt: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  taskName: string;
  taskReward: number;
  uid: string;
  phoneOrEmail: string;
  proofImageUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Referral {
  id: string;
  inviterUid: string;
  invitedUid: string;
  invitedPhone: string;
  status: 'pending' | 'qualified' | 'rewarded' | 'invalid';
  eligibleTasksCompleted: number;
  requiredTasks: number;
  rewardPaid: boolean;
  rewardAmount: number;
  createdAt: string;
  rewardPaidAt?: string;
}

export interface Withdrawal {
  id: string;
  uid: string;
  phone: string;
  amount: number;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  rejectionReason?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
  order: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  target: 'all' | string;
  isActive: boolean;
  createdAt: string;
}

export interface AppSettings {
  appName: string;
  appLogo?: string;
  signupBonus: number;
  referralReward: number;
  requiredReferralTasks: number;
  withdrawalAmounts: number[];
  supportTelegram: string;
  appVersion: string;
  companyInfo: string;
  privacyPolicy: string;
  aboutText: string;
  faqList: { question: string; answer: string }[];
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetRecord: string;
  details: string;
  timestamp: string;
}

export interface InviteRankingUser {
  rank: number;
  uid: string;
  maskedPhone: string;
  successfulReferrals: number;
  referralEarnings: number;
}
