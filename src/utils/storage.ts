import { Transaction, Budget, SavingsGoal, UserProfile } from '../types/finance';
import { INITIAL_BUDGETS, INITIAL_GOALS, INITIAL_PROFILE, INITIAL_TRANSACTIONS } from '../data/initialData';

const KEYS = {
  TRANSACTIONS: 'pft_transactions_v1',
  BUDGETS: 'pft_budgets_v1',
  GOALS: 'pft_goals_v1',
  PROFILE: 'pft_profile_v1',
  AUTH: 'pft_auth_session_v1',
};

export const storage = {
  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(KEYS.TRANSACTIONS);
      if (!data) {
        localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
        return INITIAL_TRANSACTIONS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load transactions', e);
      return INITIAL_TRANSACTIONS;
    }
  },

  saveTransactions(transactions: Transaction[]) {
    try {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  },

  getBudgets(): Budget[] {
    try {
      const data = localStorage.getItem(KEYS.BUDGETS);
      if (!data) {
        localStorage.setItem(KEYS.BUDGETS, JSON.stringify(INITIAL_BUDGETS));
        return INITIAL_BUDGETS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load budgets', e);
      return INITIAL_BUDGETS;
    }
  },

  saveBudgets(budgets: Budget[]) {
    try {
      localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets', e);
    }
  },

  getGoals(): SavingsGoal[] {
    try {
      const data = localStorage.getItem(KEYS.GOALS);
      if (!data) {
        localStorage.setItem(KEYS.GOALS, JSON.stringify(INITIAL_GOALS));
        return INITIAL_GOALS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load goals', e);
      return INITIAL_GOALS;
    }
  },

  saveGoals(goals: SavingsGoal[]) {
    try {
      localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save goals', e);
    }
  },

  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(KEYS.PROFILE);
      if (!data) {
        localStorage.setItem(KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
        return INITIAL_PROFILE;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load profile', e);
      return INITIAL_PROFILE;
    }
  },

  saveProfile(profile: UserProfile) {
    try {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  getAuth(): { isAuthenticated: boolean; userEmail: string; userName: string } {
    try {
      const data = localStorage.getItem(KEYS.AUTH);
      if (!data) {
        // Show Welcome / Login page by default for authentic initial user journey
        const defaultAuth = {
          isAuthenticated: false,
          userEmail: INITIAL_PROFILE.email,
          userName: INITIAL_PROFILE.name,
        };
        localStorage.setItem(KEYS.AUTH, JSON.stringify(defaultAuth));
        return defaultAuth;
      }
      return JSON.parse(data);
    } catch (e) {
      return { isAuthenticated: false, userEmail: INITIAL_PROFILE.email, userName: INITIAL_PROFILE.name };
    }
  },

  saveAuth(auth: { isAuthenticated: boolean; userEmail: string; userName: string }) {
    try {
      localStorage.setItem(KEYS.AUTH, JSON.stringify(auth));
    } catch (e) {
      console.error('Failed to save auth state', e);
    }
  },

  loadDemoData(): {
    transactions: Transaction[];
    budgets: Budget[];
    goals: SavingsGoal[];
    profile: UserProfile;
  } {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(KEYS.BUDGETS, JSON.stringify(INITIAL_BUDGETS));
    localStorage.setItem(KEYS.GOALS, JSON.stringify(INITIAL_GOALS));
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
    return {
      transactions: INITIAL_TRANSACTIONS,
      budgets: INITIAL_BUDGETS,
      goals: INITIAL_GOALS,
      profile: INITIAL_PROFILE,
    };
  },

  clearAllData(): {
    transactions: Transaction[];
    budgets: Budget[];
    goals: SavingsGoal[];
  } {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(KEYS.BUDGETS, JSON.stringify([]));
    localStorage.setItem(KEYS.GOALS, JSON.stringify([]));
    return {
      transactions: [],
      budgets: [],
      goals: [],
    };
  },

  exportAllDataJSON(): string {
    const fullState = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: storage.getProfile(),
      transactions: storage.getTransactions(),
      budgets: storage.getBudgets(),
      goals: storage.getGoals(),
    };
    return JSON.stringify(fullState, null, 2);
  },
};
