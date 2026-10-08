import React, { createContext, useContext, useEffect, useState } from 'react';
import { dbService, AppState } from '../services/db';
import { User, Wallet } from '../types';
import { db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface AppContextType {
  state: AppState;
  currentUser: User | null;
  currentWallet: Wallet | null;
  isAdminLoggedIn: boolean;
  activePanel: 'user' | 'admin';
  setActivePanel: (panel: 'user' | 'admin') => void;
  activeUserTab: 'home' | 'earn' | 'invite' | 'withdraw' | 'history' | 'profile';
  setActiveUserTab: (tab: 'home' | 'earn' | 'invite' | 'withdraw' | 'history' | 'profile') => void;
  activeAdminTab: 'dashboard' | 'users' | 'tasks' | 'submissions' | 'referrals' | 'withdrawals' | 'banners' | 'notifications' | 'settings' | 'audit';
  setActiveAdminTab: (tab: any) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  adminLogin: () => void;
  adminLogout: () => void;
  initialInviteCode: string;
}

const AppContext = createContext<AppContextType | null>(null);

const CURRENT_USER_KEY = 'earncash_active_user_uid';
const ADMIN_AUTH_KEY = 'earncash_admin_session';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => dbService.getState());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    }
    return false;
  });

  const [activePanel, setActivePanel] = useState<'user' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('panel') === 'admin' || window.location.pathname.includes('admin')) {
        return 'admin';
      }
    }
    return 'user';
  });

  const [activeUserTab, setActiveUserTab] = useState<'home' | 'earn' | 'invite' | 'withdraw' | 'history' | 'profile'>('home');
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'users' | 'tasks' | 'submissions' | 'referrals' | 'withdrawals' | 'banners' | 'notifications' | 'settings' | 'audit'>('dashboard');
  
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [initialInviteCode, setInitialInviteCode] = useState<string>('');

  // Handle URL params for invite code e.g. ?ref=EC1234
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref') || params.get('invite');
      if (refCode) {
        setInitialInviteCode(refCode);
        if (!currentUser) {
          setAuthMode('signup');
          setShowAuthModal(true);
        }
      }
    }
  }, []);

  // Listen to state changes
  useEffect(() => {
    const unsubscribe = dbService.subscribe(() => {
      const latest = dbService.getState();
      setState({ ...latest });
    });
    return unsubscribe;
  }, []);

  // Sync current user session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUid = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUid && state.users[savedUid]) {
        setCurrentUser(state.users[savedUid]);
      }
    }
  }, [state.users]);

  // Real-time listener for current user's wallet document
  useEffect(() => {
    if (!currentUser?.uid || !db) return;
    try {
      const unsub = onSnapshot(doc(db, 'earncash_wallets', currentUser.uid), (snap) => {
        if (snap.exists()) {
          const w = snap.data() as Wallet;
          if (w && typeof w.balance === 'number') {
            dbService.updateWalletLocally(w);
          }
        }
      }, (err) => console.warn('User wallet listener notice:', err));
      return () => unsub();
    } catch (e) {
      console.warn('Wallet listener error:', e);
    }
  }, [currentUser?.uid]);

  const loginUser = (user: User) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, user.uid);
    }
    setShowAuthModal(false);
  };

  const logoutUser = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    setActiveUserTab('home');
  };

  const adminLogin = () => {
    setIsAdminLoggedIn(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    }
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    }
  };

  const currentWallet = currentUser ? state.wallets[currentUser.uid] || null : null;

  return (
    <AppContext.Provider
      value={{
        state,
        currentUser,
        currentWallet,
        isAdminLoggedIn,
        activePanel,
        setActivePanel,
        activeUserTab,
        setActiveUserTab,
        activeAdminTab,
        setActiveAdminTab,
        showAuthModal,
        setShowAuthModal,
        authMode,
        setAuthMode,
        selectedTaskId,
        setSelectedTaskId,
        loginUser,
        logoutUser,
        adminLogin,
        adminLogout,
        initialInviteCode
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
