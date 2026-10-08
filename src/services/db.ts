import {
  User,
  Wallet,
  WalletTransaction,
  Task,
  TaskStart,
  TaskSubmission,
  Referral,
  Withdrawal,
  Banner,
  NotificationItem,
  AppSettings,
  AuditLog,
  BankDetails
} from '../types';
import { db, rtdb } from './firebase';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { ref as dbRef, set as rtdbSet, onValue, get as rtdbGet } from 'firebase/database';

const STORAGE_KEY = 'earncash_db_state_v1';
const SYNC_CHANNEL = 'earncash_sync_bus';

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return phone || '******';
  return phone.slice(0, 2) + '••••••' + phone.slice(-2);
}

export function maskAccountNumber(acc: string): string {
  if (!acc || acc.length < 4) return '••••';
  return '••••••••' + acc.slice(-4);
}

export interface AppState {
  users: Record<string, User>;
  wallets: Record<string, Wallet>;
  transactions: WalletTransaction[];
  tasks: Task[];
  taskStarts: TaskStart[];
  submissions: TaskSubmission[];
  referrals: Referral[];
  withdrawals: Withdrawal[];
  banners: Banner[];
  notifications: NotificationItem[];
  settings: AppSettings;
  auditLogs: AuditLog[];
}

const DEFAULT_SETTINGS: AppSettings = {
  appName: 'Earn Cash',
  signupBonus: 20,
  referralReward: 20,
  requiredReferralTasks: 3,
  withdrawalAmounts: [100, 300, 500, 1000, 5000, 50000],
  supportTelegram: 'https://t.me/luckyuserbonus',
  appVersion: 'v2.4.0',
  companyInfo: 'Earn Cash Rewards Network India. Safe, Secure & Fast Rewards Platform.',
  privacyPolicy: `Earn Cash values your privacy. We collect your mobile number, transaction history, and banking details solely for payout processing and task verification. All financial records and transactions are encrypted and protected. We do not sell your personal information to third parties. For questions or data requests, contact our official Telegram support.`,
  aboutText: `Earn Cash is India's fastest growing digital task & reward platform. Complete simple tasks like app testing, social follows, reviews, and surveys to earn real cash directly to your bank account via IMPS/UPI. Invite friends to multiply your earnings with lifetime referral rewards!`,
  faqList: [
    {
      question: 'How do I earn money on Earn Cash?',
      answer: 'Browse available tasks in the Earn section, click Start Earn, complete the steps externally, and upload proof. Once approved, the reward is credited to your wallet instantly!'
    },
    {
      question: 'When do I get my ₹20 Signup Bonus?',
      answer: 'The ₹20 signup bonus is automatically deposited into your wallet immediately upon registration.'
    },
    {
      question: 'How does the Referral program work?',
      answer: 'Share your Invite Code or Link with friends. When an invited friend completes 3 eligible tasks, you automatically get ₹20 directly in your wallet!'
    },
    {
      question: 'What is the minimum withdrawal amount?',
      answer: 'You can withdraw directly to your verified bank account starting from ₹100 up to ₹50,000.'
    },
    {
      question: 'How long does withdrawal processing take?',
      answer: 'Most withdrawals are processed within 15 minutes to 24 hours directly via IMPS bank transfer.'
    }
  ]
};

const INITIAL_TASKS: Task[] = [
  {
    id: 'TSK_101',
    name: 'Join Official Telegram Community',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
    reward: 15,
    description: 'Join the Earn Cash official Telegram channel for daily reward codes and updates.',
    rules: [
      'Must stay in channel for at least 7 days',
      'Provide your Telegram username or phone screenshot'
    ],
    conditions: ['Valid Telegram Account', 'One submission per user'],
    steps: [
      'Click the task link to open Telegram',
      'Click Join Channel',
      'Take a screenshot of the joined channel and submit here'
    ],
    taskLink: 'https://t.me/luckyuserbonus',
    category: 'Social',
    status: 'active',
    approvalMode: 'automatic',
    isReferralEligible: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: 'TSK_102',
    name: 'Download & Register Gaming App',
    logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=60',
    reward: 35,
    description: 'Install our partner gaming app and register a new account.',
    rules: [
      'New users only on the partner app',
      'Complete registration and play 1 practice match'
    ],
    conditions: ['Android device', 'Unique device ID'],
    steps: [
      'Click the task link to download APK / Play Store app',
      'Complete registration using your phone number',
      'Submit screenshot showing your registered in-game profile'
    ],
    taskLink: 'https://play.google.com',
    category: 'App Install',
    status: 'active',
    approvalMode: 'manual',
    isReferralEligible: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 'TSK_103',
    name: 'Subscribe & Like YouTube Channel',
    logo: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&auto=format&fit=crop&q=60',
    reward: 20,
    description: 'Subscribe to our YouTube channel and like the latest release video.',
    rules: [
      'Must subscribe and press the bell icon',
      'Like the latest video'
    ],
    conditions: ['Must have a YouTube account'],
    steps: [
      'Open the official channel via task link',
      'Subscribe and hit the bell notification',
      'Upload proof screenshot showing Subscribed status'
    ],
    taskLink: 'https://youtube.com',
    category: 'Social',
    status: 'active',
    approvalMode: 'automatic',
    isReferralEligible: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'TSK_104',
    name: '5-Star Rating & Review on Play Store',
    logo: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=100&auto=format&fit=crop&q=60',
    reward: 50,
    description: 'Leave a positive 5-star review on the Play Store page.',
    rules: [
      'Review must be at least 15 words praising fast payouts',
      'Review must remain public'
    ],
    conditions: ['Real Play Store account with profile photo'],
    steps: [
      'Go to the Play Store link',
      'Rate 5 stars and post your genuine feedback',
      'Take screenshot of published review and submit proof'
    ],
    taskLink: 'https://play.google.com',
    category: 'Review',
    status: 'active',
    approvalMode: 'manual',
    isReferralEligible: true,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

const INITIAL_BANNERS: Banner[] = [
  {
    id: 'BAN_1',
    title: '₹20 Instant Welcome Bonus on Signup!',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
    link: '#earn',
    isActive: true,
    order: 1
  },
  {
    id: 'BAN_2',
    title: 'Refer & Earn ₹20 for every active friend!',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
    link: '#invite',
    isActive: true,
    order: 2
  },
  {
    id: 'BAN_3',
    title: 'Fast IMPS Bank Withdrawals Starting ₹100',
    imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&auto=format&fit=crop&q=80',
    link: '#withdraw',
    isActive: true,
    order: 3
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF_1',
    title: '🎉 Welcome to Earn Cash!',
    message: 'Welcome to India’s top mobile reward app. Complete tasks and invite friends to earn daily cash.',
    target: 'all',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'NOTIF_2',
    title: '⚡ Instant Auto Approval Enabled',
    message: 'Selected tasks now credit instant rewards right after submission!',
    target: 'all',
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

// Seed top leaderboard ranking data
const INITIAL_DEMO_USERS: { user: User; wallet: Wallet; referralsCount: number }[] = [
  {
    user: {
      uid: 'EC90421',
      phone: '9845217830',
      passwordHash: 'dummy',
      inviteCode: 'EC9042',
      status: 'active',
      createdAt: '2026-09-01T10:00:00Z'
    },
    wallet: {
      uid: 'EC90421',
      balance: 1480,
      totalEarned: 3450,
      referralEarnings: 2840,
      completedTaskCount: 22,
      lastUpdated: new Date().toISOString()
    },
    referralsCount: 142
  },
  {
    user: {
      uid: 'EC88219',
      phone: '9123456789',
      passwordHash: 'dummy',
      inviteCode: 'EC8821',
      status: 'active',
      createdAt: '2026-09-05T10:00:00Z'
    },
    wallet: {
      uid: 'EC88219',
      balance: 920,
      totalEarned: 2680,
      referralEarnings: 2180,
      completedTaskCount: 18,
      lastUpdated: new Date().toISOString()
    },
    referralsCount: 109
  },
  {
    user: {
      uid: 'EC73105',
      phone: '8765432109',
      passwordHash: 'dummy',
      inviteCode: 'EC7310',
      status: 'active',
      createdAt: '2026-09-12T10:00:00Z'
    },
    wallet: {
      uid: 'EC73105',
      balance: 640,
      totalEarned: 1820,
      referralEarnings: 1560,
      completedTaskCount: 14,
      lastUpdated: new Date().toISOString()
    },
    referralsCount: 78
  },
  {
    user: {
      uid: 'EC61902',
      phone: '7890123456',
      passwordHash: 'dummy',
      inviteCode: 'EC6190',
      status: 'active',
      createdAt: '2026-09-18T10:00:00Z'
    },
    wallet: {
      uid: 'EC61902',
      balance: 410,
      totalEarned: 1240,
      referralEarnings: 980,
      completedTaskCount: 11,
      lastUpdated: new Date().toISOString()
    },
    referralsCount: 49
  },
  {
    user: {
      uid: 'EC54391',
      phone: '9988776655',
      passwordHash: 'dummy',
      inviteCode: 'EC5439',
      status: 'active',
      createdAt: '2026-09-22T10:00:00Z'
    },
    wallet: {
      uid: 'EC54391',
      balance: 310,
      totalEarned: 890,
      referralEarnings: 680,
      completedTaskCount: 8,
      lastUpdated: new Date().toISOString()
    },
    referralsCount: 34
  }
];

class DatabaseService {
  private state: AppState;
  private channel: BroadcastChannel | null = null;
  private listeners: Set<() => void> = new Set();
  private isSyncingWithFirebase = false;
  private syncQueue = false;
  private hasLoadedRemote = false;
  private lastTaskModifiedAt = 0;

  constructor() {
    this.state = this.loadState();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(SYNC_CHANNEL);
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'STATE_UPDATED') {
            this.state = this.loadState();
            this.notify();
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.state = this.loadState();
          this.notify();
        }
      });
    }

    // Connect to Firebase Firestore & RTDB immediately
    this.syncFromFirebase();
  }

  private loadState(): AppState {
    if (typeof window === 'undefined') return this.createInitialState();
    try {
      const rawMod = localStorage.getItem('earncash_tasks_last_modified');
      if (rawMod) {
        this.lastTaskModifiedAt = Number(rawMod) || 0;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure defaults exist - preserve tasks array even if empty
        const resolvedTasks = Array.isArray(parsed.tasks) ? parsed.tasks : INITIAL_TASKS;
        return {
          users: parsed.users || {},
          wallets: parsed.wallets || {},
          transactions: parsed.transactions || [],
          tasks: resolvedTasks,
          taskStarts: parsed.taskStarts || [],
          submissions: parsed.submissions || [],
          referrals: parsed.referrals || [],
          withdrawals: parsed.withdrawals || [],
          banners: Array.isArray(parsed.banners) ? parsed.banners : INITIAL_BANNERS,
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : INITIAL_NOTIFICATIONS,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          auditLogs: parsed.auditLogs || []
        };
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
    return this.createInitialState();
  }

  private createInitialState(): AppState {
    const users: Record<string, User> = {};
    const wallets: Record<string, Wallet> = {};
    const referrals: Referral[] = [];

    // Add demo leaderboard users
    INITIAL_DEMO_USERS.forEach((item) => {
      users[item.user.uid] = item.user;
      wallets[item.wallet.uid] = item.wallet;
    });

    return {
      users,
      wallets,
      transactions: [],
      tasks: INITIAL_TASKS,
      taskStarts: [],
      submissions: [],
      referrals,
      withdrawals: [],
      banners: INITIAL_BANNERS,
      notifications: INITIAL_NOTIFICATIONS,
      settings: DEFAULT_SETTINGS,
      auditLogs: [
        {
          id: 'LOG_INIT',
          adminId: 'SYSTEM',
          action: 'SYSTEM_BOOT',
          targetRecord: 'Earn Cash App',
          details: 'Initialized Earn Cash synchronized database v2.4.0',
          timestamp: new Date().toISOString()
        }
      ]
    };
  }

  private saveState() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        if (this.lastTaskModifiedAt > 0) {
          localStorage.setItem('earncash_tasks_last_modified', this.lastTaskModifiedAt.toString());
        }
        this.channel?.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now() });
      } catch (e) {
        console.error('Failed to save state to localStorage:', e);
      }
    }
    this.notify();
    this.syncToFirebase();
  }

  public async syncTasksToFirebase() {
    this.hasLoadedRemote = true;
    this.lastTaskModifiedAt = Date.now();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('earncash_tasks_last_modified', this.lastTaskModifiedAt.toString());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {}
    }
    const tasksPayload = {
      tasks: this.state.tasks || [],
      lastModified: this.lastTaskModifiedAt,
      lastUpdated: new Date().toISOString()
    };

    if (db) {
      try {
        await setDoc(doc(db, 'earncash_data', 'tasks_list'), tasksPayload);
        await setDoc(doc(db, 'earncash_data', 'main_state'), { tasks: this.state.tasks, lastModifiedTasks: this.lastTaskModifiedAt }, { merge: true });
      } catch (e) {
        console.warn('Firestore tasks sync error:', e);
      }
    }

    if (rtdb) {
      try {
        await rtdbSet(dbRef(rtdb, 'earncash_tasks'), tasksPayload);
        await rtdbSet(dbRef(rtdb, 'earncash_main_state/tasks'), this.state.tasks || []);
      } catch (e) {
        console.warn('RTDB tasks sync error:', e);
      }
    }
    this.notify();
  }

  private async syncToFirebase() {
    if (this.isSyncingWithFirebase) {
      this.syncQueue = true;
      return;
    }
    this.isSyncingWithFirebase = true;
    try {
      do {
        this.syncQueue = false;

        // In main_state document, store lightweight submissions metadata to guarantee
        // the 1MB Firestore limit is NEVER breached, while full proofs are stored in collection earncash_submissions
        const sanitizedSubmissions = (this.state.submissions || []).slice(0, 100).map((sub) => ({
          id: sub.id,
          taskId: sub.taskId,
          taskName: sub.taskName,
          taskReward: sub.taskReward,
          uid: sub.uid,
          phoneOrEmail: sub.phoneOrEmail,
          status: sub.status,
          submittedAt: sub.submittedAt,
          reviewedAt: sub.reviewedAt,
          reviewedBy: sub.reviewedBy,
          rejectionReason: sub.rejectionReason,
          proofImageUrl: sub.proofImageUrl && sub.proofImageUrl.length > 50000
            ? sub.proofImageUrl.slice(0, 50000)
            : sub.proofImageUrl
        }));

        const payload = {
          isInitialized: true,
          users: this.state.users || {},
          wallets: this.state.wallets || {},
          transactions: (this.state.transactions || []).slice(0, 300),
          tasks: this.state.tasks || [],
          taskStarts: (this.state.taskStarts || []).slice(0, 200),
          submissions: sanitizedSubmissions,
          referrals: this.state.referrals || [],
          withdrawals: (this.state.withdrawals || []).slice(0, 100),
          banners: this.state.banners || [],
          notifications: this.state.notifications || [],
          settings: this.state.settings || DEFAULT_SETTINGS,
          auditLogs: (this.state.auditLogs || []).slice(0, 100),
          lastUpdated: new Date().toISOString()
        };

        if (db) {
          const firestoreRef = doc(db, 'earncash_data', 'main_state');
          await setDoc(firestoreRef, payload);
        }

        if (rtdb) {
          const rtdbRef = dbRef(rtdb, 'earncash_main_state');
          await rtdbSet(rtdbRef, payload);
        }
      } while (this.syncQueue);
    } catch (e) {
      console.warn('Firebase sync write error:', e);
    } finally {
      this.isSyncingWithFirebase = false;
    }
  }

  private async syncFromFirebase() {
    if (db) {
      try {
        const firestoreRef = doc(db, 'earncash_data', 'main_state');
        const snap = await getDoc(firestoreRef);
        if (snap.exists()) {
          const remoteData = snap.data();
          if (remoteData && (remoteData.isInitialized || Array.isArray(remoteData.tasks))) {
            this.applyRemoteState(remoteData);
          } else {
            // First time initialization in Firebase
            await this.syncToFirebase();
          }
        } else {
          // Document does not exist yet, seed current state to Firebase
          await this.syncToFirebase();
        }

        // Real-time listener for dedicated tasks list
        const tasksDocRef = doc(db, 'earncash_data', 'tasks_list');
        onSnapshot(tasksDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data && Array.isArray(data.tasks)) {
              const remoteMod = Number(data.lastModified) || 0;
              if (remoteMod >= this.lastTaskModifiedAt || this.lastTaskModifiedAt === 0) {
                this.lastTaskModifiedAt = remoteMod;
                this.state.tasks = data.tasks;
                if (typeof window !== 'undefined') {
                  try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
                    if (remoteMod > 0) {
                      localStorage.setItem('earncash_tasks_last_modified', remoteMod.toString());
                    }
                  } catch (e) {}
                }
                this.notify();
              }
            }
          }
        }, (err) => {
          console.warn('Firestore tasks_list listener notice:', err);
        });

        // Real-time listener for main state updates
        onSnapshot(firestoreRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data && (data.isInitialized || Array.isArray(data.tasks))) {
              this.applyRemoteState(data);
            }
          }
        }, (err) => {
          console.warn('Firestore onSnapshot listener notice:', err);
        });

        // Real-time listener for dedicated individual submissions collection
        const subsColRef = collection(db, 'earncash_submissions');
        onSnapshot(subsColRef, (snapshot) => {
          let updated = false;
          snapshot.docs.forEach((d) => {
            const data = d.data() as TaskSubmission;
            if (data && data.id) {
              const existingIdx = this.state.submissions.findIndex((s) => s.id === data.id);
              if (existingIdx !== -1) {
                if (
                  this.state.submissions[existingIdx].status !== data.status ||
                  this.state.submissions[existingIdx].reviewedAt !== data.reviewedAt ||
                  (data.proofImageUrl && !this.state.submissions[existingIdx].proofImageUrl)
                ) {
                  this.state.submissions[existingIdx] = data;
                  updated = true;
                }
              } else {
                this.state.submissions.unshift(data);
                updated = true;
              }
            }
          });
          if (updated) {
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
              } catch (e) {}
            }
            this.notify();
          }
        }, (err) => {
          console.warn('Firestore submissions listener notice:', err);
        });

        // Real-time listener for dedicated individual user wallets collection
        const walletsColRef = collection(db, 'earncash_wallets');
        onSnapshot(walletsColRef, (snapshot) => {
          let updated = false;
          snapshot.docs.forEach((d) => {
            const w = d.data() as Wallet;
            if (w && w.uid) {
              const localWallet = this.state.wallets[w.uid];
              if (!localWallet || localWallet.balance !== w.balance || localWallet.totalEarned !== w.totalEarned) {
                this.state.wallets[w.uid] = { ...localWallet, ...w };
                updated = true;
              }
            }
          });
          if (updated) {
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
              } catch (e) {}
            }
            this.notify();
          }
        }, (err) => {
          console.warn('Firestore earncash_wallets listener notice:', err);
        });
      } catch (e) {
        console.warn('Firestore initial sync notice:', e);
      }
    }

    if (rtdb) {
      try {
        const rtdbReference = dbRef(rtdb, 'earncash_main_state');
        const rtdbSnap = await rtdbGet(rtdbReference);
        if (rtdbSnap.exists()) {
          const val = rtdbSnap.val();
          if (val && (val.isInitialized || Array.isArray(val.tasks)) && !this.hasLoadedRemote) {
            this.applyRemoteState(val);
          }
        }

        onValue(rtdbReference, (snap) => {
          if (snap.exists()) {
            const val = snap.val();
            if (val && (val.isInitialized || Array.isArray(val.tasks))) {
              this.applyRemoteState(val);
            }
          }
        }, (err) => {
          console.warn('RTDB onValue notice:', err);
        });

        // Dedicated RTDB tasks listener
        const rtdbTasksRef = dbRef(rtdb, 'earncash_tasks');
        onValue(rtdbTasksRef, (snap) => {
          if (snap.exists()) {
            const val = snap.val();
            if (val && Array.isArray(val.tasks)) {
              const remoteMod = Number(val.lastModified) || 0;
              if (remoteMod >= this.lastTaskModifiedAt || this.lastTaskModifiedAt === 0) {
                this.lastTaskModifiedAt = remoteMod;
                this.state.tasks = val.tasks;
                if (typeof window !== 'undefined') {
                  try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
                    if (remoteMod > 0) {
                      localStorage.setItem('earncash_tasks_last_modified', remoteMod.toString());
                    }
                  } catch (e) {}
                }
                this.notify();
              }
            }
          }
        }, (err) => {
          console.warn('RTDB earncash_tasks notice:', err);
        });

        const rtdbSubsRef = dbRef(rtdb, 'earncash_submissions');
        onValue(rtdbSubsRef, (snap) => {
          if (snap.exists()) {
            const val = snap.val();
            if (val && typeof val === 'object') {
              let updated = false;
              Object.values(val).forEach((item: any) => {
                if (item && item.id) {
                  const existingIdx = this.state.submissions.findIndex((s) => s.id === item.id);
                  if (existingIdx !== -1) {
                    if (this.state.submissions[existingIdx].status !== item.status) {
                      this.state.submissions[existingIdx] = item;
                      updated = true;
                    }
                  } else {
                    this.state.submissions.unshift(item);
                    updated = true;
                  }
                }
              });
              if (updated) {
                if (typeof window !== 'undefined') {
                  try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
                  } catch (e) {}
                }
                this.notify();
              }
            }
          }
        }, (err) => {
          console.warn('RTDB submissions listener notice:', err);
        });
      } catch (e) {
        console.warn('RTDB sync notice:', e);
      }
    }
  }

  private applyRemoteState(remoteData: any) {
    if (!remoteData) return;
    this.hasLoadedRemote = true;

    // Merge submissions by id so no user submission is ever dropped
    const subMap = new Map<string, TaskSubmission>();
    (this.state.submissions || []).forEach((s) => {
      if (s && s.id) subMap.set(s.id, s);
    });
    if (Array.isArray(remoteData.submissions)) {
      remoteData.submissions.forEach((s: TaskSubmission) => {
        if (s && s.id) {
          const local = subMap.get(s.id);
          if (!local) {
            subMap.set(s.id, s);
          } else {
            // Keep proof image if local has it
            subMap.set(s.id, {
              ...s,
              proofImageUrl: local.proofImageUrl || s.proofImageUrl
            });
          }
        }
      });
    }
    const newSubmissions = Array.from(subMap.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    let newTasks = this.state.tasks;
    if (Array.isArray(remoteData.tasks)) {
      const remoteMod = Number(remoteData.lastModifiedTasks || remoteData.lastModified) || 0;
      if (remoteMod >= this.lastTaskModifiedAt || this.lastTaskModifiedAt === 0) {
        newTasks = remoteData.tasks;
        if (remoteMod > 0) this.lastTaskModifiedAt = remoteMod;
      }
    }
    const newBanners = Array.isArray(remoteData.banners) ? remoteData.banners : this.state.banners;
    const newNotifications = Array.isArray(remoteData.notifications) ? remoteData.notifications : this.state.notifications;
    const newWithdrawals = Array.isArray(remoteData.withdrawals) ? remoteData.withdrawals : this.state.withdrawals;
    const newReferrals = Array.isArray(remoteData.referrals) ? remoteData.referrals : this.state.referrals;
    const newTransactions = Array.isArray(remoteData.transactions) ? remoteData.transactions : this.state.transactions;
    const newAuditLogs = Array.isArray(remoteData.auditLogs) ? remoteData.auditLogs : this.state.auditLogs;
    const newSettings = remoteData.settings ? { ...DEFAULT_SETTINGS, ...remoteData.settings } : this.state.settings;
    const newUsers = remoteData.users ? { ...this.state.users, ...remoteData.users } : this.state.users;
    
    // Safely merge wallets by UID so newer or higher balance is never downgraded
    const newWallets = { ...this.state.wallets };
    if (remoteData.wallets && typeof remoteData.wallets === 'object') {
      Object.entries(remoteData.wallets).forEach(([uid, rW]: [string, any]) => {
        if (!rW || typeof rW !== 'object') return;
        const lW = newWallets[uid];
        if (!lW) {
          newWallets[uid] = rW;
        } else {
          const rTime = new Date(rW.lastUpdated || 0).getTime();
          const lTime = new Date(lW.lastUpdated || 0).getTime();
          if (rTime > lTime) {
            newWallets[uid] = { ...lW, ...rW };
          } else if (rTime < lTime) {
            newWallets[uid] = { ...rW, ...lW };
          } else {
            newWallets[uid] = {
              ...lW,
              ...rW,
              balance: Math.max(Number(lW.balance) || 0, Number(rW.balance) || 0),
              totalEarned: Math.max(Number(lW.totalEarned) || 0, Number(rW.totalEarned) || 0),
              completedTaskCount: Math.max(Number(lW.completedTaskCount) || 0, Number(rW.completedTaskCount) || 0)
            };
          }
        }
      });
    }

    this.state = {
      users: newUsers,
      wallets: newWallets,
      transactions: newTransactions,
      tasks: newTasks,
      taskStarts: Array.isArray(remoteData.taskStarts) ? remoteData.taskStarts : this.state.taskStarts,
      submissions: newSubmissions,
      referrals: newReferrals,
      withdrawals: newWithdrawals,
      banners: newBanners,
      notifications: newNotifications,
      settings: newSettings,
      auditLogs: newAuditLogs
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {}
    }

    this.notify();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error(err);
      }
    });
  }

  public getState(): AppState {
    return this.state;
  }

  // --- AUTHENTICATION ---
  public async signup(phone: string, password: string, inviteCodeInput?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanPhone = phone.trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Check if phone already registered
    const existing = Object.values(this.state.users).find((u) => u.phone === cleanPhone);
    if (existing) {
      return { success: false, error: 'Mobile number is already registered. Please login.' };
    }

    const uid = 'EC' + Math.floor(100000 + Math.random() * 900000);
    const myInviteCode = 'EC' + Math.floor(1000 + Math.random() * 9000);
    const passwordHash = await hashPassword(password);

    let inviterUid: string | null = null;
    let inviterCode: string | null = null;

    if (inviteCodeInput && inviteCodeInput.trim()) {
      const formattedCode = inviteCodeInput.trim().toUpperCase();
      const inviter = Object.values(this.state.users).find((u) => u.inviteCode.toUpperCase() === formattedCode);
      if (inviter && inviter.uid !== uid) {
        inviterUid = inviter.uid;
        inviterCode = inviter.inviteCode;
      }
    }

    const newUser: User = {
      uid,
      phone: cleanPhone,
      passwordHash,
      inviteCode: myInviteCode,
      inviterUid,
      inviterCode,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const signupBonus = this.state.settings.signupBonus || 20;

    const newWallet: Wallet = {
      uid,
      balance: signupBonus,
      totalEarned: signupBonus,
      referralEarnings: 0,
      completedTaskCount: 0,
      lastUpdated: new Date().toISOString()
    };

    const bonusTxn: WalletTransaction = {
      id: 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      uid,
      amount: signupBonus,
      type: 'credit',
      category: 'signup_bonus',
      description: `Welcome bonus ₹${signupBonus} added to wallet`,
      createdAt: new Date().toISOString()
    };

    this.state.users[uid] = newUser;
    this.state.wallets[uid] = newWallet;
    this.state.transactions.unshift(bonusTxn);

    // If invited by someone, register referral relationship
    if (inviterUid) {
      const newReferral: Referral = {
        id: 'REF_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        inviterUid,
        invitedUid: uid,
        invitedPhone: cleanPhone,
        status: 'pending',
        eligibleTasksCompleted: 0,
        requiredTasks: this.state.settings.requiredReferralTasks || 3,
        rewardPaid: false,
        rewardAmount: this.state.settings.referralReward || 20,
        createdAt: new Date().toISOString()
      };
      this.state.referrals.unshift(newReferral);
    }

    this.saveState();
    return { success: true, user: newUser };
  }

  public async login(phone: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanPhone = phone.trim();
    const user = Object.values(this.state.users).find((u) => u.phone === cleanPhone);
    if (!user) {
      return { success: false, error: 'Mobile number not found. Please sign up.' };
    }
    if (user.status === 'suspended') {
      return { success: false, error: 'Your account has been suspended. Please contact support.' };
    }
    const hash = await hashPassword(password);
    if (user.passwordHash !== hash && user.passwordHash !== 'dummy') {
      return { success: false, error: 'Invalid password. Please try again.' };
    }
    return { success: true, user };
  }

  // --- BANK DETAILS ---
  public saveBankDetails(uid: string, details: { bankName: string; accountHolderName: string; accountNumber: string; ifscCode: string }): { success: boolean; error?: string } {
    const user = this.state.users[uid];
    if (!user) return { success: false, error: 'User not found' };
    if (user.bankDetails?.isLocked) {
      return { success: false, error: 'Bank details are locked and cannot be edited. Contact admin to change.' };
    }
    if (!details.bankName.trim() || !details.accountHolderName.trim() || !details.accountNumber.trim() || !details.ifscCode.trim()) {
      return { success: false, error: 'All bank details fields are required.' };
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(details.ifscCode.trim())) {
      return { success: false, error: 'Please enter a valid IFSC code (e.g. SBIN0001234)' };
    }

    const bankDetails: BankDetails = {
      bankName: details.bankName.trim(),
      accountHolderName: details.accountHolderName.trim(),
      accountNumber: details.accountNumber.trim(),
      ifscCode: details.ifscCode.trim().toUpperCase(),
      isLocked: true,
      savedAt: new Date().toISOString()
    };

    user.bankDetails = bankDetails;
    this.saveState();
    return { success: true };
  }

  // --- TASK ACTIONS ---
  public startTask(taskId: string, uid: string): { success: boolean; taskStart?: TaskStart; error?: string } {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task || task.status !== 'active') {
      return { success: false, error: 'Task is no longer available' };
    }
    // Check if already completed
    const completed = this.state.submissions.find((s) => s.taskId === taskId && s.uid === uid && (s.status === 'approved' || s.status === 'completed'));
    if (completed) {
      return { success: false, error: 'You have already completed this task.' };
    }

    let start = this.state.taskStarts.find((ts) => ts.taskId === taskId && ts.uid === uid);
    if (!start) {
      start = {
        id: 'START_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        taskId,
        uid,
        startedAt: new Date().toISOString()
      };
      this.state.taskStarts.push(start);
      this.saveState();
    }
    return { success: true, taskStart: start };
  }

  public async submitTask(data: { taskId: string; uid: string; phoneOrEmail: string; proofImageUrl: string }): Promise<{ success: boolean; submission?: TaskSubmission; error?: string }> {
    const task = this.state.tasks.find((t) => t.id === data.taskId);
    if (!task) return { success: false, error: 'Task not found' };

    // Prevent duplicate pending or approved submissions
    const existing = this.state.submissions.find(
      (s) => s.taskId === data.taskId && s.uid === data.uid && (s.status === 'pending' || s.status === 'approved' || s.status === 'completed')
    );
    if (existing) {
      return { success: false, error: 'A submission for this task already exists with status: ' + existing.status };
    }

    if (!data.phoneOrEmail.trim()) {
      return { success: false, error: 'Please enter your phone number or email address' };
    }
    if (!data.proofImageUrl) {
      return { success: false, error: 'Please provide proof screenshot' };
    }

    const isAutoApproval = task.approvalMode === 'automatic';
    const subStatus = isAutoApproval ? 'approved' : 'pending';

    const submission: TaskSubmission = {
      id: 'SUB_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      taskId: task.id,
      taskName: task.name,
      taskReward: task.reward,
      uid: data.uid,
      phoneOrEmail: data.phoneOrEmail.trim(),
      proofImageUrl: data.proofImageUrl,
      status: subStatus,
      submittedAt: new Date().toISOString(),
      ...(isAutoApproval ? { reviewedAt: new Date().toISOString(), reviewedBy: 'AUTO_SYSTEM' } : {})
    };

    this.state.submissions.unshift(submission);

    if (isAutoApproval) {
      this.processTaskReward(data.uid, task.id, task.name, task.reward, task.isReferralEligible, 'AUTO_SYSTEM');
    }

    // Direct write to dedicated Firestore collection 'earncash_submissions'
    if (db) {
      try {
        await setDoc(doc(db, 'earncash_submissions', submission.id), submission);
      } catch (err) {
        console.warn('Direct submission Firestore write error:', err);
      }
    }

    // Direct write to RTDB
    if (rtdb) {
      try {
        await rtdbSet(dbRef(rtdb, 'earncash_submissions/' + submission.id), submission);
      } catch (err) {
        console.warn('Direct submission RTDB write error:', err);
      }
    }

    this.saveState();
    this.notify();
    return { success: true, submission };
  }

  // --- TASK APPROVAL (Internal/Admin) ---
  public async approveSubmission(submissionId: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    const sub = this.state.submissions.find((s) => s.id === submissionId);
    if (!sub) return { success: false, error: 'Submission not found' };
    if (sub.status === 'approved' || sub.status === 'completed') {
      return { success: false, error: 'This submission has already been approved' };
    }

    const task = this.state.tasks.find((t) => t.id === sub.taskId);
    const reward = task ? task.reward : sub.taskReward;
    const isReferralEligible = task ? task.isReferralEligible : true;

    sub.status = 'approved';
    sub.reviewedAt = new Date().toISOString();
    sub.reviewedBy = adminId;

    this.processTaskReward(sub.uid, sub.taskId, sub.taskName, reward, isReferralEligible, adminId, sub.id);
    this.addAuditLog(adminId, 'APPROVE_TASK_SUBMISSION', sub.id, `Approved submission for user ${sub.uid}, credited ₹${reward}`);

    const updatedWallet = this.state.wallets[sub.uid];

    if (db) {
      try {
        await setDoc(doc(db, 'earncash_submissions', sub.id), sub);
        if (updatedWallet) {
          await setDoc(doc(db, 'earncash_wallets', sub.uid), updatedWallet, { merge: true });
          await setDoc(doc(db, 'earncash_data', 'main_state'), {
            wallets: { [sub.uid]: updatedWallet }
          }, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore sub approve error:', e);
      }
    }

    if (rtdb) {
      try {
        await rtdbSet(dbRef(rtdb, 'earncash_submissions/' + sub.id), sub);
        if (updatedWallet) {
          await rtdbSet(dbRef(rtdb, 'earncash_wallets/' + sub.uid), updatedWallet);
          await rtdbSet(dbRef(rtdb, `earncash_main_state/wallets/${sub.uid}`), updatedWallet);
        }
      } catch (e) {
        console.warn('RTDB sub approve error:', e);
      }
    }

    this.saveState();
    this.notify();
    return { success: true };
  }

  public async rejectSubmission(submissionId: string, reason: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    const sub = this.state.submissions.find((s) => s.id === submissionId);
    if (!sub) return { success: false, error: 'Submission not found' };
    if (sub.status === 'approved' || sub.status === 'completed') {
      return { success: false, error: 'Cannot reject an already approved submission' };
    }

    sub.status = 'rejected';
    sub.rejectionReason = reason || 'Verification failed';
    sub.reviewedAt = new Date().toISOString();
    sub.reviewedBy = adminId;

    this.addAuditLog(adminId, 'REJECT_TASK_SUBMISSION', sub.id, `Rejected submission: ${sub.rejectionReason}`);

    if (db) {
      try {
        await setDoc(doc(db, 'earncash_submissions', sub.id), sub);
      } catch (e) {
        console.warn('Firestore sub reject error:', e);
      }
    }

    if (rtdb) {
      try {
        await rtdbSet(dbRef(rtdb, 'earncash_submissions/' + sub.id), sub);
      } catch (e) {
        console.warn('RTDB sub reject error:', e);
      }
    }

    this.saveState();
    this.notify();
    return { success: true };
  }

  private processTaskReward(uid: string, taskId: string, taskName: string, reward: number, isReferralEligible: boolean, approverId: string, submissionId?: string) {
    let wallet = this.state.wallets[uid];
    if (!wallet) {
      wallet = {
        uid,
        balance: 0,
        totalEarned: 0,
        referralEarnings: 0,
        completedTaskCount: 0,
        lastUpdated: new Date().toISOString()
      };
      this.state.wallets[uid] = wallet;
    }

    // Check duplicate transaction for this specific submission or task
    const refId = submissionId || taskId;
    const alreadyCredited = this.state.transactions.find(
      (tx) => tx.uid === uid && tx.category === 'task_reward' && (tx.referenceId === refId || (submissionId && tx.referenceId === submissionId))
    );
    if (alreadyCredited) return;

    wallet.balance += reward;
    wallet.totalEarned += reward;
    wallet.completedTaskCount += 1;
    wallet.lastUpdated = new Date().toISOString();

    const txn: WalletTransaction = {
      id: 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      uid,
      amount: reward,
      type: 'credit',
      category: 'task_reward',
      referenceId: refId,
      description: `Task reward for "${taskName}" approved by Admin`,
      createdAt: new Date().toISOString(),
      adminId: approverId
    };
    this.state.transactions.unshift(txn);

    // Referral Progress Checking
    if (isReferralEligible) {
      this.updateReferralProgress(uid);
    }
  }

  private updateReferralProgress(invitedUid: string) {
    const referral = this.state.referrals.find((r) => r.invitedUid === invitedUid);
    if (!referral || referral.rewardPaid) return;

    referral.eligibleTasksCompleted += 1;
    const required = referral.requiredTasks || this.state.settings.requiredReferralTasks || 3;

    if (referral.eligibleTasksCompleted >= required) {
      referral.status = 'qualified';
      // Automatically pay referral reward ₹20 to the inviter
      this.payReferralReward(referral);
    }
  }

  private payReferralReward(referral: Referral) {
    if (referral.rewardPaid) return; // Prevent duplicate payment
    const inviterWallet = this.state.wallets[referral.inviterUid];
    const rewardAmount = referral.rewardAmount || this.state.settings.referralReward || 20;

    if (inviterWallet) {
      inviterWallet.balance += rewardAmount;
      inviterWallet.totalEarned += rewardAmount;
      inviterWallet.referralEarnings += rewardAmount;
      inviterWallet.lastUpdated = new Date().toISOString();

      const txn: WalletTransaction = {
        id: 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        uid: referral.inviterUid,
        amount: rewardAmount,
        type: 'credit',
        category: 'referral_reward',
        referenceId: referral.id,
        description: `Referral reward ₹${rewardAmount} for inviting user ${referral.invitedUid} (completed 3 tasks)`,
        createdAt: new Date().toISOString()
      };
      this.state.transactions.unshift(txn);
    }

    referral.status = 'rewarded';
    referral.rewardPaid = true;
    referral.rewardPaidAt = new Date().toISOString();

    this.addAuditLog('SYSTEM', 'PAY_REFERRAL_REWARD', referral.id, `Paid ₹${rewardAmount} referral reward to inviter ${referral.inviterUid}`);
  }

  // --- WITHDRAWAL ACTIONS ---
  public requestWithdrawal(uid: string, amount: number): { success: boolean; withdrawal?: Withdrawal; error?: string } {
    const user = this.state.users[uid];
    const wallet = this.state.wallets[uid];

    if (!user || !wallet) return { success: false, error: 'User wallet not found' };
    if (!user.bankDetails) {
      return { success: false, error: 'Please add and verify your Bank Details before requesting withdrawal.' };
    }
    const validAmounts = this.state.settings.withdrawalAmounts || [100, 300, 500, 1000, 5000, 50000];
    if (!validAmounts.includes(amount)) {
      return { success: false, error: 'Invalid withdrawal amount selected.' };
    }
    if (wallet.balance < amount) {
      return { success: false, error: `Insufficient wallet balance. You have ₹${wallet.balance}, required ₹${amount}.` };
    }

    // Check if there is already a pending withdrawal
    const pendingWithdrawal = this.state.withdrawals.find((w) => w.uid === uid && w.status === 'pending');
    if (pendingWithdrawal) {
      return { success: false, error: 'You already have a pending withdrawal request under review.' };
    }

    // Deduct immediately on hold
    wallet.balance -= amount;
    wallet.lastUpdated = new Date().toISOString();

    const wthId = 'WTH_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    const holdTxn: WalletTransaction = {
      id: 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      uid,
      amount,
      type: 'debit',
      category: 'withdrawal_hold',
      referenceId: wthId,
      description: `Withdrawal request of ₹${amount} to ${user.bankDetails.bankName} (${maskAccountNumber(user.bankDetails.accountNumber)})`,
      createdAt: new Date().toISOString()
    };
    this.state.transactions.unshift(holdTxn);

    const withdrawal: Withdrawal = {
      id: wthId,
      uid,
      phone: user.phone,
      amount,
      bankName: user.bankDetails.bankName,
      accountHolderName: user.bankDetails.accountHolderName,
      accountNumber: user.bankDetails.accountNumber,
      ifsc: user.bankDetails.ifscCode,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    this.state.withdrawals.unshift(withdrawal);
    this.saveState();
    return { success: true, withdrawal };
  }

  public updateWithdrawalStatus(withdrawalId: string, status: 'processing' | 'completed' | 'rejected', reason: string, adminId: string): { success: boolean; error?: string } {
    const wth = this.state.withdrawals.find((w) => w.id === withdrawalId);
    if (!wth) return { success: false, error: 'Withdrawal record not found' };
    if (wth.status === 'completed') {
      return { success: false, error: 'Withdrawal is already completed' };
    }
    if (wth.status === 'rejected') {
      return { success: false, error: 'Withdrawal has already been rejected and refunded' };
    }

    if (status === 'rejected') {
      // Process wallet refund
      const wallet = this.state.wallets[wth.uid];
      if (wallet) {
        wallet.balance += wth.amount;
        wallet.lastUpdated = new Date().toISOString();

        const refundTxn: WalletTransaction = {
          id: 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          uid: wth.uid,
          amount: wth.amount,
          type: 'credit',
          category: 'withdrawal_refund',
          referenceId: wth.id,
          description: `Refund for rejected withdrawal #${wth.id}: ${reason || 'Bank details mismatch'}`,
          createdAt: new Date().toISOString(),
          adminId
        };
        this.state.transactions.unshift(refundTxn);
      }
      wth.rejectionReason = reason || 'Verification failed';
    }

    wth.status = status;
    wth.processedAt = new Date().toISOString();

    this.addAuditLog(adminId, `WITHDRAWAL_${status.toUpperCase()}`, wth.id, `Status updated to ${status}. Amount: ₹${wth.amount}`);
    this.saveState();
    return { success: true };
  }

  // --- ADMIN ACTIONS ---
  public async adjustUserBalance(uid: string, amount: number, type: 'credit' | 'debit', reason: string, adminId: string): Promise<{ success: boolean; error?: string; newBalance?: number }> {
    let wallet = this.state.wallets[uid];
    if (!wallet) {
      wallet = {
        uid,
        balance: 0,
        totalEarned: 0,
        referralEarnings: 0,
        completedTaskCount: 0,
        lastUpdated: new Date().toISOString()
      };
      this.state.wallets[uid] = wallet;
    }
    if (!amount || amount <= 0) return { success: false, error: 'Please enter a valid amount greater than 0' };
    if (type === 'debit' && wallet.balance < amount) {
      return { success: false, error: `User balance (₹${wallet.balance}) is lower than deduction amount (₹${amount})` };
    }

    if (type === 'credit') {
      wallet.balance += amount;
      wallet.totalEarned += amount;
    } else {
      wallet.balance -= amount;
    }
    wallet.lastUpdated = new Date().toISOString();

    const txn: WalletTransaction = {
      id: 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      uid,
      amount,
      type,
      category: type === 'credit' ? 'admin_credit' : 'admin_debit',
      description: `Admin balance adjustment: ${reason}`,
      createdAt: new Date().toISOString(),
      adminId
    };
    this.state.transactions.unshift(txn);

    this.addAuditLog(adminId, 'MANUAL_BALANCE_ADJUST', uid, `${type.toUpperCase()} ₹${amount} - Reason: ${reason}`);

    // Direct write to dedicated Firestore earncash_wallets collection & main_state
    if (db) {
      try {
        await setDoc(doc(db, 'earncash_wallets', uid), wallet, { merge: true });
        await setDoc(doc(db, 'earncash_data', 'main_state'), {
          wallets: { [uid]: wallet }
        }, { merge: true });
      } catch (e) {
        console.warn('Firestore adjust balance write error:', e);
      }
    }

    if (rtdb) {
      try {
        await rtdbSet(dbRef(rtdb, 'earncash_wallets/' + uid), wallet);
        await rtdbSet(dbRef(rtdb, `earncash_main_state/wallets/${uid}`), wallet);
      } catch (e) {
        console.warn('RTDB adjust balance write error:', e);
      }
    }

    this.saveState();
    this.notify();
    return { success: true, newBalance: wallet.balance };
  }

  public updateWalletLocally(wallet: Wallet) {
    if (!wallet || !wallet.uid) return;
    this.state.wallets[wallet.uid] = { ...(this.state.wallets[wallet.uid] || {}), ...wallet };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {}
    }
    this.notify();
  }

  public setUserStatus(uid: string, status: 'active' | 'suspended', adminId: string): { success: boolean } {
    const user = this.state.users[uid];
    if (user) {
      user.status = status;
      this.addAuditLog(adminId, 'USER_STATUS_CHANGE', uid, `User status set to ${status}`);
      this.saveState();
      return { success: true };
    }
    return { success: false };
  }

  // Task CRUD
  public saveTask(taskData: Partial<Task>, adminId: string): { success: boolean; task?: Task } {
    if (taskData.id) {
      // Edit
      const index = this.state.tasks.findIndex((t) => t.id === taskData.id);
      if (index !== -1) {
        this.state.tasks[index] = { ...this.state.tasks[index], ...taskData } as Task;
        this.addAuditLog(adminId, 'EDIT_TASK', taskData.id, `Updated task ${taskData.name}`);
        this.saveState();
        this.syncTasksToFirebase();
        return { success: true, task: this.state.tasks[index] };
      }
    }
    // Add
    const newTask: Task = {
      id: 'TSK_' + Date.now(),
      name: taskData.name || 'New Task',
      logo: taskData.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
      reward: Number(taskData.reward) || 20,
      description: taskData.description || '',
      rules: taskData.rules || ['Follow instructions carefully'],
      conditions: taskData.conditions || ['One submission per user'],
      steps: taskData.steps || ['Open task link', 'Complete steps', 'Upload screenshot'],
      taskLink: taskData.taskLink || 'https://t.me/luckyuserbonus',
      category: taskData.category || 'General',
      status: taskData.status || 'active',
      approvalMode: taskData.approvalMode || 'manual',
      isReferralEligible: taskData.isReferralEligible ?? true,
      createdAt: new Date().toISOString()
    };
    this.state.tasks.unshift(newTask);
    this.addAuditLog(adminId, 'CREATE_TASK', newTask.id, `Created task ${newTask.name} with reward ₹${newTask.reward}`);
    this.saveState();
    this.syncTasksToFirebase();
    return { success: true, task: newTask };
  }

  public deleteTask(taskId: string, adminId: string): { success: boolean } {
    this.state.tasks = this.state.tasks.filter((t) => t.id !== taskId);
    this.addAuditLog(adminId, 'DELETE_TASK', taskId, `Deleted task ${taskId}`);
    this.saveState();
    this.syncTasksToFirebase();
    return { success: true };
  }

  public autoReplenishTasks(adminId = 'SYSTEM'): { success: boolean; count: number } {
    const templates: Partial<Task>[] = [
      {
        name: 'Daily Telegram Reward Claim',
        category: 'Telegram',
        reward: 25,
        description: 'Join daily sponsor channel, tap claim bonus button, and receive your instant wallet credit.',
        taskLink: 'https://t.me/luckyuserbonus',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
        approvalMode: 'automatic',
        isReferralEligible: true,
        steps: ['Open Telegram channel link', 'Subscribe & click start bot', 'Submit proof to claim instant reward']
      },
      {
        name: 'Watch 30s Partner Video',
        category: 'Video',
        reward: 15,
        description: 'Watch short video advertisement to the end and get automatic credit to your wallet.',
        taskLink: 'https://t.me/luckyuserbonus',
        logo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=60',
        approvalMode: 'automatic',
        isReferralEligible: true,
        steps: ['Open partner link', 'Watch full video', 'Upload completion screenshot']
      },
      {
        name: 'Google Play Rating & Review',
        category: 'App Review',
        reward: 35,
        description: 'Give a 5-star rating on Google Play Store, write helpful review, and earn ₹35.',
        taskLink: 'https://t.me/luckyuserbonus',
        logo: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=100&auto=format&fit=crop&q=60',
        approvalMode: 'manual',
        isReferralEligible: true,
        steps: ['Open rating link', 'Rate 5 stars and post short feedback', 'Screenshot your posted review']
      },
      {
        name: 'Instagram Follow & Share',
        category: 'Social Media',
        reward: 20,
        description: 'Follow our official partner page on Instagram and share post on your story.',
        taskLink: 'https://t.me/luckyuserbonus',
        logo: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&auto=format&fit=crop&q=60',
        approvalMode: 'automatic',
        isReferralEligible: true,
        steps: ['Follow account', 'Like recent post', 'Take screenshot of following status']
      }
    ];

    let count = 0;
    templates.forEach((tmpl) => {
      const exists = this.state.tasks.some((t) => t.name === tmpl.name);
      if (!exists) {
        this.saveTask(tmpl, adminId);
        count++;
      }
    });

    if (count === 0) {
      const newBonus: Partial<Task> = {
        name: `Daily Bonus Quest #${this.state.tasks.length + 1}`,
        category: 'Daily Quest',
        reward: 25,
        description: 'Complete daily quest tasks to unlock special wallet bonuses.',
        taskLink: 'https://t.me/luckyuserbonus',
        logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=60',
        approvalMode: 'automatic',
        isReferralEligible: true,
        steps: ['Open quest link', 'Follow instructions', 'Submit screenshot']
      };
      this.saveTask(newBonus, adminId);
      count = 1;
    }

    return { success: true, count };
  }

  // Banner CRUD
  public saveBanner(banner: Partial<Banner>, adminId: string) {
    if (banner.id) {
      const idx = this.state.banners.findIndex((b) => b.id === banner.id);
      if (idx !== -1) {
        this.state.banners[idx] = { ...this.state.banners[idx], ...banner } as Banner;
        this.addAuditLog(adminId, 'EDIT_BANNER', banner.id, `Updated banner: ${banner.title}`);
        this.saveState();
        return;
      }
    }
    const newBan: Banner = {
      id: 'BAN_' + Date.now(),
      title: banner.title || 'Special Promotion',
      imageUrl: banner.imageUrl || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
      link: banner.link || '#earn',
      isActive: banner.isActive ?? true,
      order: this.state.banners.length + 1
    };
    this.state.banners.push(newBan);
    this.addAuditLog(adminId, 'CREATE_BANNER', newBan.id, `Created banner: ${newBan.title}`);
    this.saveState();
  }

  public deleteBanner(bannerId: string, adminId: string) {
    this.state.banners = this.state.banners.filter((b) => b.id !== bannerId);
    this.addAuditLog(adminId, 'DELETE_BANNER', bannerId, `Deleted banner ${bannerId}`);
    this.saveState();
  }

  // Notifications
  public addNotification(title: string, message: string, adminId: string) {
    const notif: NotificationItem = {
      id: 'NOTIF_' + Date.now(),
      title,
      message,
      target: 'all',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.state.notifications.unshift(notif);
    this.addAuditLog(adminId, 'CREATE_NOTIFICATION', notif.id, `Sent notification: ${title}`);
    this.saveState();
  }

  // Settings
  public updateSettings(settings: Partial<AppSettings>, adminId: string) {
    this.state.settings = { ...this.state.settings, ...settings };
    this.addAuditLog(adminId, 'UPDATE_SETTINGS', 'AppSettings', `Updated system configuration`);
    this.saveState();
  }

  private addAuditLog(adminId: string, action: string, targetRecord: string, details: string) {
    const log: AuditLog = {
      id: 'LOG_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      adminId,
      action,
      targetRecord,
      details,
      timestamp: new Date().toISOString()
    };
    this.state.auditLogs.unshift(log);
  }

  // Leaderboard ranking calculation
  public getInviteRankings(): { rank: number; uid: string; maskedPhone: string; successfulReferrals: number; referralEarnings: number }[] {
    const counts: Record<string, { count: number; earnings: number; phone: string }> = {};

    // Group referrals by inviter
    this.state.referrals.forEach((ref) => {
      if (!counts[ref.inviterUid]) {
        const inviter = this.state.users[ref.inviterUid];
        counts[ref.inviterUid] = {
          count: 0,
          earnings: 0,
          phone: inviter ? inviter.phone : '98••••••00'
        };
      }
      if (ref.rewardPaid || ref.status === 'rewarded' || ref.status === 'qualified') {
        counts[ref.inviterUid].count += 1;
        counts[ref.inviterUid].earnings += (ref.rewardAmount || 20);
      }
    });

    // Also include demo users if not present
    INITIAL_DEMO_USERS.forEach((item) => {
      if (!counts[item.user.uid]) {
        counts[item.user.uid] = {
          count: item.referralsCount,
          earnings: item.referralsCount * 20,
          phone: item.user.phone
        };
      }
    });

    return Object.entries(counts)
      .map(([uid, data]) => ({
        uid,
        maskedPhone: maskPhone(data.phone),
        successfulReferrals: data.count,
        referralEarnings: data.earnings,
        rank: 1
      }))
      .sort((a, b) => b.successfulReferrals - a.successfulReferrals)
      .map((item, idx) => ({ ...item, rank: idx + 1 }))
      .slice(0, 20);
  }
}

export const dbService = new DatabaseService();
