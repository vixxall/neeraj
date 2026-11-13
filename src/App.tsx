/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AlertItem,
  Budget,
  PageId,
  SavingsGoal,
  Transaction,
  TransactionType,
  UserProfile,
} from './types/finance';
import { storage } from './utils/storage';
import { api } from './utils/api';
import {
  calculateKPIStats,
  generateFinancialInsights,
  generateSmartAlerts,
} from './utils/financeCalculations';
import { exportTransactionsToCSV } from './utils/csvExport';
import { ToastProvider, useToast } from './components/common/Toast';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { TransactionModal } from './components/transactions/TransactionModal';
import { TransactionDetailsModal } from './components/transactions/TransactionDetailsModal';
import { BudgetModal } from './components/budgets/BudgetModal';
import { SavingsGoalModal } from './components/goals/SavingsGoalModal';
import { AddFundsModal } from './components/goals/AddFundsModal';

// Pages
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { SavingsGoalsPage } from './pages/SavingsGoalsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';

function PersonalFinanceApp() {
  const { showToast } = useToast();

  // Authentication State
  const [auth, setAuth] = useState(() => storage.getAuth());

  // Application Data State
  const [profile, setProfile] = useState<UserProfile>(() => storage.getProfile());
  const [transactions, setTransactions] = useState<Transaction[]>(() => storage.getTransactions());
  const [budgets, setBudgets] = useState<Budget[]>(() => storage.getBudgets());
  const [goals, setGoals] = useState<SavingsGoal[]>(() => storage.getGoals());

  // Navigation & Search State
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalDefaultType, setTxModalDefaultType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [addFundsGoal, setAddFundsGoal] = useState<SavingsGoal | null>(null);

  // Deletion Confirmation States
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  // Synchronize state changes to LocalStorage
  const updateTransactions = useCallback((newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    storage.saveTransactions(newTransactions);
  }, []);

  const updateBudgets = useCallback((newBudgets: Budget[]) => {
    setBudgets(newBudgets);
    storage.saveBudgets(newBudgets);
  }, []);

  const updateGoals = useCallback((newGoals: SavingsGoal[]) => {
    setGoals(newGoals);
    storage.saveGoals(newGoals);
  }, []);

  const applyServerData = useCallback((remote: {
    profile: UserProfile;
    transactions: Transaction[];
    budgets: Budget[];
    goals: SavingsGoal[];
  }) => {
    setProfile(remote.profile);
    storage.saveProfile(remote.profile);
    updateTransactions(remote.transactions);
    updateBudgets(remote.budgets);
    updateGoals(remote.goals);
  }, [updateTransactions, updateBudgets, updateGoals]);

  const reportApiError = useCallback((action: string, error: unknown) => {
    const detail = error instanceof Error ? error.message : 'Unexpected server error';
    console.error(`Unable to ${action}`, error);
    showToast(`Unable to ${action}: ${detail}`, 'error');
  }, [showToast]);

  const updateProfile = useCallback(async (newProfile: UserProfile): Promise<boolean> => {
    try {
      const savedProfile = await api.saveProfile(newProfile);
      setProfile(savedProfile);
      storage.saveProfile(savedProfile);
      showToast('Profile and preferences updated', 'success');
      return true;
    } catch (error) {
      reportApiError('save profile', error);
      return false;
    }
  }, [reportApiError, showToast]);

  // Derived KPIs, Alerts & Insights
  const kpis = useMemo(() => calculateKPIStats(transactions), [transactions]);
  const alerts = useMemo(
    () => generateSmartAlerts(budgets, transactions, goals, kpis),
    [budgets, transactions, goals, kpis]
  );
  const insights = useMemo(
    () => generateFinancialInsights(transactions, budgets, goals, kpis),
    [transactions, budgets, goals, kpis]
  );

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    if (!api.token()) {
      const signedOut = { isAuthenticated: false, userEmail: '', userName: '' };
      setAuth(signedOut);
      storage.saveAuth(signedOut);
      return;
    }

    let active = true;
    void api.dashboard()
      .then(remote => {
        if (active) applyServerData(remote);
      })
      .catch(error => {
        if (!active) return;
        api.clearToken();
        const signedOut = { isAuthenticated: false, userEmail: '', userName: '' };
        setAuth(signedOut);
        storage.saveAuth(signedOut);
        reportApiError('restore your session', error);
      });

    return () => {
      active = false;
    };
  }, [auth.isAuthenticated, applyServerData, reportApiError]);

  // Auth Handlers
  const handleLogin = async (email: string, name: string, password: string, register: boolean) => {
    try {
      const result = await api.login(email, password, name, register);
      const remote = await api.dashboard();
      const newAuth = { isAuthenticated: true, userEmail: result.user.email, userName: result.user.name };
      setAuth(newAuth);
      storage.saveAuth(newAuth);
      applyServerData({
        ...remote,
        profile: { ...remote.profile, email: result.user.email, name: result.user.name },
      });
      setCurrentPage('dashboard');
      showToast(`Welcome, ${result.user.name}! Logged in to Dashboard.`, 'success');
    } catch (error) {
      api.clearToken();
      throw error;
    }
  };

  const handleLogout = () => {
    void api.logout().catch(() => api.clearToken());
    const newAuth = { isAuthenticated: false, userEmail: '', userName: '' };
    setAuth(newAuth);
    storage.saveAuth(newAuth);
    setCurrentPage('welcome');
    showToast('Logged out of session', 'info');
  };

  // Transaction Handlers
  const handleSaveTransaction = async (
    txData: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }
  ): Promise<boolean> => {
    try {
      if (txData.id) {
        const saved = await api.update<Transaction>('transactions', txData.id, txData);
        updateTransactions(transactions.map(t => t.id === saved.id ? saved : t));
        showToast('Transaction updated successfully.', 'success');
      } else {
        const saved = await api.create<Transaction>('transactions', txData);
        updateTransactions([saved, ...transactions]);
        showToast(`${saved.type === 'income' ? 'Income' : 'Expense'} recorded successfully.`, 'success');
      }
      setEditingTransaction(null);
      return true;
    } catch (error) {
      reportApiError('save transaction', error);
      return false;
    }
  };

  const handleConfirmDeleteTransaction = async (): Promise<boolean> => {
    if (!deletingTxId) return false;
    try {
      await api.remove('transactions', deletingTxId);
      updateTransactions(transactions.filter(t => t.id !== deletingTxId));
      setDeletingTxId(null);
      showToast('Transaction deleted.', 'info');
      return true;
    } catch (error) {
      reportApiError('delete transaction', error);
      return false;
    }
  };

  // Budget Handlers
  const handleSaveBudget = async (
    budgetData: Omit<Budget, 'id' | 'createdAt'> & { id?: string }
  ): Promise<boolean> => {
    try {
      if (budgetData.id) {
        const saved = await api.update<Budget>('budgets', budgetData.id, budgetData);
        updateBudgets(budgets.map(b => b.id === saved.id ? saved : b));
        showToast('Budget limit updated successfully.', 'success');
      } else {
        const existing = budgets.find(b => b.category === budgetData.category);
        if (existing) {
          const saved = await api.update<Budget>('budgets', existing.id, budgetData);
          updateBudgets(budgets.map(b => b.id === saved.id ? saved : b));
          showToast(`Updated existing ${budgetData.category} budget limit.`, 'success');
        } else {
          const saved = await api.create<Budget>('budgets', budgetData);
          updateBudgets([...budgets, saved]);
          showToast('Budget created successfully.', 'success');
        }
      }
      setEditingBudget(null);
      return true;
    } catch (error) {
      reportApiError('save budget', error);
      return false;
    }
  };

  const handleConfirmDeleteBudget = async (): Promise<boolean> => {
    if (!deletingBudgetId) return false;
    try {
      await api.remove('budgets', deletingBudgetId);
      updateBudgets(budgets.filter(b => b.id !== deletingBudgetId));
      setDeletingBudgetId(null);
      showToast('Budget removed.', 'info');
      return true;
    } catch (error) {
      reportApiError('delete budget', error);
      return false;
    }
  };

  const handleQuickAdjustBudget = async (budgetId: string, delta: number) => {
    const budget = budgets.find(item => item.id === budgetId);
    if (!budget) return;
    try {
      const saved = await api.update<Budget>('budgets', budgetId, {
        ...budget,
        monthlyLimit: Math.max(100, budget.monthlyLimit + delta),
      });
      updateBudgets(budgets.map(item => item.id === saved.id ? saved : item));
      showToast(`Budget limit updated (${delta >= 0 ? '+' : ''}${profile.currency}${delta.toLocaleString('en-IN')})`, 'success');
    } catch (error) {
      reportApiError('adjust budget', error);
    }
  };

  // Savings Goal Handlers
  const handleSaveGoal = async (
    goalData: Omit<SavingsGoal, 'id' | 'createdAt'> & { id?: string }
  ): Promise<boolean> => {
    try {
      if (goalData.id) {
        const saved = await api.update<SavingsGoal>('goals', goalData.id, goalData);
        updateGoals(goals.map(g => g.id === saved.id ? saved : g));
        showToast('Savings goal updated.', 'success');
      } else {
        const saved = await api.create<SavingsGoal>('goals', goalData);
        updateGoals([...goals, saved]);
        showToast('Savings goal created successfully.', 'success');
      }
      setEditingGoal(null);
      return true;
    } catch (error) {
      reportApiError('save savings goal', error);
      return false;
    }
  };

  const handleAddFundsToGoal = async (goalId: string, addedAmount: number): Promise<boolean> => {
    try {
      const saved = await api.addFunds(goalId, addedAmount);
      updateGoals(goals.map(g => g.id === saved.id ? saved : g));
      showToast(`Added ${profile.currency}${addedAmount.toLocaleString('en-IN')} to goal!`, 'success');
      return true;
    } catch (error) {
      reportApiError('add funds to savings goal', error);
      return false;
    }
  };

  const handleConfirmDeleteGoal = async (): Promise<boolean> => {
    if (!deletingGoalId) return false;
    try {
      await api.remove('goals', deletingGoalId);
      updateGoals(goals.filter(g => g.id !== deletingGoalId));
      setDeletingGoalId(null);
      showToast('Savings goal deleted.', 'info');
      return true;
    } catch (error) {
      reportApiError('delete savings goal', error);
      return false;
    }
  };

  // Data Lifecycle Actions
  const handleLoadDemoData = async (): Promise<boolean> => {
    try {
      const remote = await api.loadDemoData();
      applyServerData(remote);
      showToast('Demo dataset loaded.', 'success');
      return true;
    } catch (error) {
      reportApiError('load demo data', error);
      return false;
    }
  };

  const handleClearData = async (): Promise<boolean> => {
    try {
      await api.clearData();
      updateTransactions([]);
      updateBudgets([]);
      updateGoals([]);
      showToast('All transaction, budget, and goal records cleared.', 'info');
      return true;
    } catch (error) {
      reportApiError('clear data', error);
      return false;
    }
  };

  const handleResetApp = async (): Promise<boolean> => {
    try {
      const remote = await api.loadDemoData();
      applyServerData(remote);
      setCurrentPage('dashboard');
      showToast('Demo data restored.', 'success');
      return true;
    } catch (error) {
      reportApiError('restore demo data', error);
      return false;
    }
  };

  const handleExportJSON = () => {
    const jsonStr = storage.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('JSON backup file downloaded.', 'success');
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions);
    showToast('Transactions exported to CSV.', 'success');
  };

  // If unauthenticated or navigating to welcome/login screen, show Auth / Welcome screen
  if (!auth.isAuthenticated || currentPage === 'welcome') {
    return (
      <AuthPage
        onLogin={handleLogin}
        defaultProfile={profile}
        onNavigate={setCurrentPage}
        isAuthenticated={auth.isAuthenticated}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col lg:flex-row text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        profile={profile}
        alertCount={alerts.length}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentPage={currentPage}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNavigate={setCurrentPage}
          alerts={alerts}
          profile={profile}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage
              transactions={transactions}
              budgets={budgets}
              goals={goals}
              profile={profile}
              onNavigate={setCurrentPage}
              onOpenAddIncome={() => {
                setEditingTransaction(null);
                setTxModalDefaultType('income');
                setIsTxModalOpen(true);
              }}
              onOpenAddExpense={() => {
                setEditingTransaction(null);
                setTxModalDefaultType('expense');
                setIsTxModalOpen(true);
              }}
              onOpenAddBudget={() => {
                setEditingBudget(null);
                setIsBudgetModalOpen(true);
              }}
              onOpenAddGoal={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              onEditTransaction={(t) => {
                setEditingTransaction(t);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={(id) => setDeletingTxId(id)}
              onViewDetails={(t) => setDetailTransaction(t)}
              onEditBudget={(b) => {
                setEditingBudget(b);
                setIsBudgetModalOpen(true);
              }}
              onQuickAdjustBudget={(budgetId, delta) => { void handleQuickAdjustBudget(budgetId, delta); }}
              onEditGoal={(g) => {
                setEditingGoal(g);
                setIsGoalModalOpen(true);
              }}
              onOpenAddFunds={(g) => setAddFundsGoal(g)}
              onQuickAddFunds={(goalId, amount) => handleAddFundsToGoal(goalId, amount)}
            />
          )}

          {currentPage === 'transactions' && (
            <TransactionsPage
              transactions={transactions}
              profile={profile}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenAddTransaction={() => {
                setEditingTransaction(null);
                setTxModalDefaultType('expense');
                setIsTxModalOpen(true);
              }}
              onEditTransaction={(t) => {
                setEditingTransaction(t);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={(id) => setDeletingTxId(id)}
              onViewDetails={(t) => setDetailTransaction(t)}
            />
          )}

          {currentPage === 'budgets' && (
            <BudgetsPage
              budgets={budgets}
              transactions={transactions}
              profile={profile}
              onOpenAddBudget={() => {
                setEditingBudget(null);
                setIsBudgetModalOpen(true);
              }}
              onEditBudget={(b) => {
                setEditingBudget(b);
                setIsBudgetModalOpen(true);
              }}
              onDeleteBudget={(id) => setDeletingBudgetId(id)}
            />
          )}

          {currentPage === 'goals' && (
            <SavingsGoalsPage
              goals={goals}
              profile={profile}
              onOpenAddGoal={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              onEditGoal={(g) => {
                setEditingGoal(g);
                setIsGoalModalOpen(true);
              }}
              onDeleteGoal={(id) => setDeletingGoalId(id)}
              onOpenAddFunds={(g) => setAddFundsGoal(g)}
            />
          )}

          {currentPage === 'analytics' && (
            <AnalyticsPage transactions={transactions} profile={profile} />
          )}

          {currentPage === 'reports' && (
            <ReportsPage
              transactions={transactions}
              budgets={budgets}
              goals={goals}
              profile={profile}
            />
          )}

          {currentPage === 'insights' && (
            <InsightsPage
              alerts={alerts}
              insights={insights}
              profile={profile}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              profile={profile}
              onSaveProfile={updateProfile}
              onExportJSON={handleExportJSON}
              onExportCSV={handleExportCSV}
              onLoadDemoData={handleLoadDemoData}
              onClearData={handleClearData}
              onResetApp={handleResetApp}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      {/* 1. Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialTransaction={editingTransaction}
        defaultType={txModalDefaultType}
        currency={profile.currency}
      />

      {/* 2. Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={!!detailTransaction}
        onClose={() => setDetailTransaction(null)}
        transaction={detailTransaction}
        currency={profile.currency}
        onEdit={(t) => {
          setDetailTransaction(null);
          setEditingTransaction(t);
          setIsTxModalOpen(true);
        }}
        onDelete={(id) => {
          setDetailTransaction(null);
          setDeletingTxId(id);
        }}
      />

      {/* 3. Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setEditingBudget(null);
        }}
        onSave={handleSaveBudget}
        initialBudget={editingBudget}
        currency={profile.currency}
      />

      {/* 4. Savings Goal Modal */}
      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        initialGoal={editingGoal}
        currency={profile.currency}
      />

      {/* 5. Add Funds Modal */}
      <AddFundsModal
        isOpen={!!addFundsGoal}
        onClose={() => setAddFundsGoal(null)}
        goal={addFundsGoal}
        onAddFunds={handleAddFundsToGoal}
        currency={profile.currency}
      />

      {/* 6. Delete Transaction Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingTxId}
        onClose={() => setDeletingTxId(null)}
        onConfirm={handleConfirmDeleteTransaction}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this financial record? This will immediately recalculate your savings, monthly totals, and budget meters."
        confirmText="Delete"
        isDestructive={true}
      />

      {/* 7. Delete Budget Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingBudgetId}
        onClose={() => setDeletingBudgetId(null)}
        onConfirm={handleConfirmDeleteBudget}
        title="Delete Budget Limit"
        message="Are you sure you want to delete this category budget limit? Tracking and threshold warnings for this department will be disabled."
        confirmText="Delete Budget"
        isDestructive={true}
      />

      {/* 8. Delete Goal Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingGoalId}
        onClose={() => setDeletingGoalId(null)}
        onConfirm={handleConfirmDeleteGoal}
        title="Delete Savings Goal"
        message="Are you sure you want to delete this goal milestone? Recorded progress for this aspiration will be removed."
        confirmText="Delete Goal"
        isDestructive={true}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <PersonalFinanceApp />
    </ToastProvider>
  );
}
