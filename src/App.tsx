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

  const updateProfile = useCallback((newProfile: UserProfile) => {
    setProfile(newProfile);
    storage.saveProfile(newProfile);
    void api.saveProfile(newProfile).catch(() => undefined);
    showToast('Profile and preferences updated', 'success');
  }, [showToast]);

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

  // Auth Handlers
  const handleLogin = async (email: string, name: string, password: string, register: boolean) => {
    const result = await api.login(email, password, name, register);
    const remote = await api.dashboard();
    const newAuth = { isAuthenticated: true, userEmail: email, userName: name };
    setAuth(newAuth);
    storage.saveAuth(newAuth);
    const updatedProfile = { ...remote.profile, email: result.user.email, name: result.user.name };
    setProfile(updatedProfile);
    storage.saveProfile(updatedProfile);
    setTransactions(remote.transactions);
    setBudgets(remote.budgets);
    setGoals(remote.goals);
    setCurrentPage('dashboard');
    showToast(`Welcome, ${name}! Logged in to Dashboard.`, 'success');
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
  ) => {
    if (txData.id) {
      // Edit existing
      const updated = transactions.map((t) =>
        t.id === txData.id ? { ...t, ...txData } : t
      );
      updateTransactions(updated);
      void api.update<Transaction>('transactions', txData.id, txData).catch(() => undefined);
      showToast('Transaction updated successfully.', 'success');
    } else {
      // Create new
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}`,
        createdAt: Date.now(),
      };
      updateTransactions([newTx, ...transactions]);
      void api.create<Transaction>('transactions', txData).catch(() => undefined);
      showToast(
        `${newTx.type === 'income' ? 'Income' : 'Expense'} recorded successfully.`,
        'success'
      );
    }
    setEditingTransaction(null);
  };

  const handleConfirmDeleteTransaction = () => {
    if (!deletingTxId) return;
    const updated = transactions.filter((t) => t.id !== deletingTxId);
    updateTransactions(updated);
    void api.remove('transactions', deletingTxId).catch(() => undefined);
    setDeletingTxId(null);
    showToast('Transaction deleted.', 'info');
  };

  // Budget Handlers
  const handleSaveBudget = async (
    budgetData: Omit<Budget, 'id' | 'createdAt'> & { id?: string }
  ) => {
    if (budgetData.id) {
      const updated = budgets.map((b) =>
        b.id === budgetData.id ? { ...b, ...budgetData } : b
      );
      updateBudgets(updated);
      void api.update<Budget>('budgets', budgetData.id, budgetData).catch(() => undefined);
      showToast('Budget limit updated successfully.', 'success');
    } else {
      // Check if category already has a budget
      const existing = budgets.find((b) => b.category === budgetData.category);
      if (existing) {
        const updated = budgets.map((b) =>
          b.category === budgetData.category
            ? { ...b, monthlyLimit: budgetData.monthlyLimit }
            : b
        );
        updateBudgets(updated);
        void api.create<Budget>('budgets', budgetData).catch(() => undefined);
        showToast(`Updated existing ${budgetData.category} budget limit.`, 'success');
      } else {
        const newBudget: Budget = {
          ...budgetData,
          id: `bg-${Date.now()}`,
          createdAt: Date.now(),
        };
        updateBudgets([...budgets, newBudget]);
        void api.create<Budget>('budgets', budgetData).catch(() => undefined);
        showToast('Budget created successfully.', 'success');
      }
    }
    setEditingBudget(null);
  };

  const handleConfirmDeleteBudget = () => {
    if (!deletingBudgetId) return;
    const updated = budgets.filter((b) => b.id !== deletingBudgetId);
    updateBudgets(updated);
    void api.remove('budgets', deletingBudgetId).catch(() => undefined);
    setDeletingBudgetId(null);
    showToast('Budget removed.', 'info');
  };

  // Savings Goal Handlers
  const handleSaveGoal = async (
    goalData: Omit<SavingsGoal, 'id' | 'createdAt'> & { id?: string }
  ) => {
    if (goalData.id) {
      const updated = goals.map((g) =>
        g.id === goalData.id ? { ...g, ...goalData } : g
      );
      updateGoals(updated);
      void api.update<SavingsGoal>('goals', goalData.id, goalData).catch(() => undefined);
      showToast('Savings goal updated.', 'success');
    } else {
      const newGoal: SavingsGoal = {
        ...goalData,
        id: `goal-${Date.now()}`,
        createdAt: Date.now(),
      };
      updateGoals([...goals, newGoal]);
      void api.create<SavingsGoal>('goals', goalData).catch(() => undefined);
      showToast('Savings goal created successfully.', 'success');
    }
    setEditingGoal(null);
  };

  const handleAddFundsToGoal = (goalId: string, addedAmount: number) => {
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        const newAmt = g.currentAmount + addedAmount;
        return { ...g, currentAmount: newAmt };
      }
      return g;
    });
    updateGoals(updated);
    void api.addFunds(goalId, addedAmount).catch(() => undefined);
    showToast(`Added ${profile.currency}${addedAmount.toLocaleString('en-IN')} to goal!`, 'success');
  };

  const handleConfirmDeleteGoal = () => {
    if (!deletingGoalId) return;
    const updated = goals.filter((g) => g.id !== deletingGoalId);
    updateGoals(updated);
    void api.remove('goals', deletingGoalId).catch(() => undefined);
    setDeletingGoalId(null);
    showToast('Savings goal deleted.', 'info');
  };

  // Data Lifecycle Actions
  const handleLoadDemoData = () => {
    const loaded = storage.loadDemoData();
    setTransactions(loaded.transactions);
    setBudgets(loaded.budgets);
    setGoals(loaded.goals);
    setProfile(loaded.profile);
    showToast('Demo dataset loaded with 23 realistic transactions.', 'success');
  };

  const handleClearData = () => {
    const cleared = storage.clearAllData();
    setTransactions(cleared.transactions);
    setBudgets(cleared.budgets);
    setGoals(cleared.goals);
    showToast('All transaction, budget, and goal records cleared.', 'info');
  };

  const handleResetApp = () => {
    localStorage.clear();
    const loaded = storage.loadDemoData();
    setTransactions(loaded.transactions);
    setBudgets(loaded.budgets);
    setGoals(loaded.goals);
    setProfile(loaded.profile);
    setCurrentPage('dashboard');
    showToast('Application reset to factory state.', 'info');
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
              onQuickAdjustBudget={(budgetId, delta) => {
                const updated = budgets.map((b) =>
                  b.id === budgetId ? { ...b, monthlyLimit: Math.max(100, b.monthlyLimit + delta) } : b
                );
                updateBudgets(updated);
                showToast(`Budget limit updated (+${profile.currency}${delta.toLocaleString('en-IN')})`, 'success');
              }}
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
