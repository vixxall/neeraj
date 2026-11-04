import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight,
  Receipt,
  PieChart as PieIcon,
  PiggyBank,
  CheckCircle2,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  Budget,
  PageId,
  SavingsGoal,
  Transaction,
  UserProfile,
} from '../types/finance';
import {
  CATEGORY_COLORS,
  calculateBudgetStatuses,
  calculateKPIStats,
  formatCurrency,
  getCategorySpending,
  getTrendsForTimeRange,
} from '../utils/financeCalculations';
import { DonutChart } from '../components/charts/DonutChart';
import { IncomeExpenseBarChart } from '../components/charts/BarChart';

interface DashboardPageProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  profile: UserProfile;
  onNavigate: (page: PageId) => void;
  onOpenAddIncome: () => void;
  onOpenAddExpense: () => void;
  onOpenAddBudget: () => void;
  onOpenAddGoal: () => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onViewDetails: (t: Transaction) => void;
  onEditBudget?: (b: Budget) => void;
  onQuickAdjustBudget?: (budgetId: string, delta: number) => void;
  onEditGoal?: (g: SavingsGoal) => void;
  onOpenAddFunds?: (g: SavingsGoal) => void;
  onQuickAddFunds?: (goalId: string, amount: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  transactions,
  budgets,
  goals,
  profile,
  onNavigate,
  onOpenAddIncome,
  onOpenAddExpense,
  onOpenAddBudget,
  onOpenAddGoal,
  onEditTransaction,
  onDeleteTransaction,
  onViewDetails,
  onEditBudget,
  onQuickAdjustBudget,
  onEditGoal,
  onOpenAddFunds,
  onQuickAddFunds,
}) => {
  const [timeRange, setTimeRange] = useState<'1M' | '6M' | '12M'>('6M');

  // Compute live mathematical KPIs
  const kpis = calculateKPIStats(transactions);
  const categorySpending = getCategorySpending(transactions);
  const budgetStatuses = calculateBudgetStatuses(budgets, transactions);
  const monthlyTrends = getTrendsForTimeRange(transactions, timeRange);

  // Top 5 recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const currency = profile.currency;

  return (
    <div className="space-y-6">
      {/* 4 Financial KPI Cartoon Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-[#ECFDF5] border-2 border-slate-900 rounded-2xl p-4.5 shadow-[3.5px_3.5px_0px_#0f172a] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">Total Income</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-300 border-2 border-slate-900 flex items-center justify-center text-slate-950 font-black shadow-[1.5px_1.5px_0px_#0f172a]">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums tracking-tight">
            {formatCurrency(kpis.totalIncome, currency)}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs font-bold text-slate-600">
            <span className="inline-flex items-center font-black px-1.5 py-0.5 rounded-md bg-emerald-200 text-emerald-900 border border-emerald-400 font-mono">
              {kpis.incomeMoMChangePercent >= 0 ? '+' : ''}{kpis.incomeMoMChangePercent}%
            </span>
            <span>vs last month</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-[#FFF1F2] border-2 border-slate-900 rounded-2xl p-4.5 shadow-[3.5px_3.5px_0px_#0f172a] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-rose-950 uppercase tracking-wide">Total Expenses</span>
            <span className="w-8 h-8 rounded-xl bg-rose-300 border-2 border-slate-900 flex items-center justify-center text-slate-950 font-black shadow-[1.5px_1.5px_0px_#0f172a]">
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums tracking-tight">
            {formatCurrency(kpis.totalExpense, currency)}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs font-bold text-slate-600">
            <span className="inline-flex items-center font-black px-1.5 py-0.5 rounded-md bg-rose-200 text-rose-900 border border-rose-400 font-mono">
              {kpis.expenseMoMChangePercent >= 0 ? '+' : ''}{kpis.expenseMoMChangePercent}%
            </span>
            <span>vs last month</span>
          </div>
        </div>

        {/* Total Savings */}
        <div className="bg-[#FEFCE8] border-2 border-slate-900 rounded-2xl p-4.5 shadow-[3.5px_3.5px_0px_#0f172a] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-amber-950 uppercase tracking-wide">Total Savings</span>
            <span className="w-8 h-8 rounded-xl bg-amber-300 border-2 border-slate-900 flex items-center justify-center text-slate-950 font-black shadow-[1.5px_1.5px_0px_#0f172a]">
              <PiggyBank className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div
            className={`text-2xl font-black font-mono tabular-nums tracking-tight ${
              kpis.totalSavings >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            {formatCurrency(kpis.totalSavings, currency)}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs font-bold text-amber-900">
            <span>Net cash balance</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums font-black">
              {transactions.length} records
            </span>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-[#EFF6FF] border-2 border-slate-900 rounded-2xl p-4.5 shadow-[3.5px_3.5px_0px_#0f172a] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-blue-950 uppercase tracking-wide">Savings Rate</span>
            <span className="w-8 h-8 rounded-xl bg-blue-300 border-2 border-slate-900 flex items-center justify-center text-slate-950 font-black shadow-[1.5px_1.5px_0px_#0f172a]">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums tracking-tight">
            {kpis.savingsRate}%
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs font-bold">
            <div className="w-full bg-white rounded-full h-2.5 border-2 border-slate-900 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, kpis.savingsRate))}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-black text-blue-950 shrink-0">Goal 20%</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="cartoon-card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-black text-slate-900 uppercase tracking-wider hidden md:inline">
          ⚡ Quick Actions:
        </span>
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <button
            onClick={onOpenAddIncome}
            className="cartoon-btn-green flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Income</span>
          </button>
          <button
            onClick={onOpenAddExpense}
            className="cartoon-btn-coral flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={onOpenAddBudget}
            className="cartoon-btn-yellow flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs"
          >
            <PieIcon className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Set Budget</span>
          </button>
          <button
            onClick={onOpenAddGoal}
            className="cartoon-btn-primary flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs"
          >
            <PiggyBank className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Savings Goal</span>
          </button>
        </div>
      </div>

      {/* Main Charts Row: Income vs Expense Bar Chart & Expense Overview Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Monthly Chart (2 cols) */}
        <div className="lg:col-span-2 cartoon-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">Income vs Expense vs Savings</h3>
              <p className="text-xs font-bold text-slate-500 mt-0.5">
                Monthly cash inflow, outflow, and net retained capital
              </p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-black text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <IncomeExpenseBarChart
            data={monthlyTrends}
            currency={currency}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>

        {/* Expense Overview Donut Chart (1 col) - Small sleek widget */}
        <div className="cartoon-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                <h3 className="text-sm font-black text-slate-900">Expense Overview</h3>
              </div>
              <span className="text-[11px] font-mono font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border-2 border-slate-900 shadow-[1px_1px_0px_#0f172a]">
                {formatCurrency(kpis.totalExpense, currency)}
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 mb-2">
              Category distribution of all expenses
            </p>
          </div>

          <DonutChart data={categorySpending} currency={currency} size={130} compact={true} />

          <button
            onClick={() => onNavigate('analytics')}
            className="mt-3 pt-2 border-t-2 border-slate-100 w-full text-center text-xs font-black text-blue-700 hover:text-blue-900 flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span>View Full Breakdown</span>
            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Budgets & Savings Goals Quick Status - Small Interactive Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Budgets Status - Small Interactive Widget */}
        <div className="cartoon-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-blue-100 border-2 border-slate-900 text-blue-900 shadow-[1px_1px_0px_#0f172a]">
                <PieIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-slate-900">Monthly Budget Limits</h3>
                  <span className="text-[11px] text-slate-500 font-mono font-bold">({budgets.length})</span>
                </div>
                <p className="text-[11px] font-bold text-slate-400">Target spending caps & alerts</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAddBudget}
                className="cartoon-btn-primary flex items-center gap-1 px-2.5 py-1 text-xs"
                title="Create a new budget limit"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>Set</span>
              </button>
              <button
                onClick={() => onNavigate('budgets')}
                className="p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                title="Manage all budgets"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {budgetStatuses.length === 0 ? (
            <div className="text-center py-6 px-4 bg-amber-50/50 rounded-xl border-2 border-dashed border-slate-300">
              <p className="text-xs font-bold text-slate-500 mb-2">No monthly budgets configured yet.</p>
              <button
                onClick={onOpenAddBudget}
                className="cartoon-btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>Create First Budget</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {budgetStatuses.slice(0, 3).map((bs) => (
                <div
                  key={bs.budget.id}
                  className="p-3 bg-white hover:bg-amber-50/40 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-slate-900"
                        style={{ backgroundColor: CATEGORY_COLORS[bs.budget.category] || '#3B82F6' }}
                      />
                      <span className="font-black text-slate-900 truncate">{bs.budget.category}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums text-xs">
                      <span className="text-slate-900 font-bold">
                        {formatCurrency(bs.spent, currency)} / {formatCurrency(bs.budget.monthlyLimit, currency)}
                      </span>
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.2 rounded-full border border-slate-900 ${
                          bs.status === 'exceeded'
                            ? 'bg-rose-200 text-rose-900'
                            : bs.status === 'warning'
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-emerald-200 text-emerald-900'
                        }`}
                      >
                        {bs.percentageUsed}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-900 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        bs.status === 'exceeded'
                          ? 'bg-rose-500'
                          : bs.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, bs.percentageUsed)}%` }}
                    />
                  </div>

                  {/* Interactive Action Row */}
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span
                      className={`font-mono font-bold ${
                        bs.status === 'exceeded'
                          ? 'text-rose-600'
                          : bs.status === 'warning'
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {bs.status === 'exceeded'
                        ? `Exceeded by ${formatCurrency(Math.abs(bs.remaining), currency)}`
                        : `${formatCurrency(bs.remaining, currency)} remaining`}
                    </span>

                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      {onQuickAdjustBudget && (
                        <button
                          onClick={() => onQuickAdjustBudget(bs.budget.id, 1000)}
                          className="cartoon-btn-yellow px-2 py-0.5 text-[10px]"
                          title="Increase budget limit by ₹1,000"
                        >
                          +1k limit
                        </button>
                      )}
                      {onEditBudget && (
                        <button
                          onClick={() => onEditBudget(bs.budget)}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded transition-colors"
                          title="Edit Budget Limit"
                        >
                          <Edit2 className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Savings Goals Status - Small Interactive Widget */}
        <div className="cartoon-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-100 border-2 border-slate-900 text-emerald-900 shadow-[1px_1px_0px_#0f172a]">
                <PiggyBank className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-slate-900">Savings Goals</h3>
                  <span className="text-[11px] text-slate-500 font-mono font-bold">({goals.length})</span>
                </div>
                <p className="text-[11px] font-bold text-slate-400">Target funds & quick deposits</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAddGoal}
                className="cartoon-btn-green flex items-center gap-1 px-2.5 py-1 text-xs"
                title="Create a new savings goal"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>New</span>
              </button>
              <button
                onClick={() => onNavigate('goals')}
                className="p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                title="View all goals"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-6 px-4 bg-emerald-50/50 rounded-xl border-2 border-dashed border-slate-300">
              <p className="text-xs font-bold text-slate-500 mb-2">No savings goals established yet.</p>
              <button
                onClick={onOpenAddGoal}
                className="cartoon-btn-green inline-flex items-center gap-1 px-3 py-1.5 text-xs"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>Create First Goal</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {goals.slice(0, 3).map((goal) => {
                const progress =
                  goal.targetAmount > 0
                    ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
                    : 0;
                const isCompleted = progress >= 100;
                return (
                  <div
                    key={goal.id}
                    className="p-3 bg-white hover:bg-emerald-50/40 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-black text-slate-900 truncate">{goal.name}</span>
                        {isCompleted ? (
                          <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-emerald-200 text-emerald-900 border border-slate-900">
                            Reached 🎉
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500">Due {goal.targetDate}</span>
                        )}
                      </div>
                      <span className="font-mono tabular-nums font-black text-blue-700 text-xs">
                        {progress}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-900 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>

                    {/* Amounts and Interactive Quick Actions */}
                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="font-mono font-bold text-slate-600 tabular-nums">
                        {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}
                      </span>

                      {/* Interactive Buttons */}
                      <div className="flex items-center gap-1">
                        {onQuickAddFunds && !isCompleted && (
                          <button
                            onClick={() => onQuickAddFunds(goal.id, 500)}
                            className="cartoon-btn-green px-2 py-0.5 text-[10px]"
                            title="Quick add ₹500"
                          >
                            +500
                          </button>
                        )}
                        {onOpenAddFunds && (
                          <button
                            onClick={() => onOpenAddFunds(goal)}
                            className="cartoon-btn-primary px-2.5 py-0.5 text-[10px]"
                            title="Add deposit amount"
                          >
                            + Add Money
                          </button>
                        )}
                        {onEditGoal && (
                          <button
                            onClick={() => onEditGoal(goal)}
                            className="p-1 text-slate-500 hover:text-blue-600 rounded transition-colors"
                            title="Edit Goal"
                          >
                            <Edit2 className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="cartoon-card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-slate-900 bg-[#FFFDF7]">
          <div>
            <h3 className="text-sm font-black text-slate-900">Recent Transactions</h3>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Latest financial records added to your tracker
            </p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-black text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Ledger</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-slate-400">
            No transactions yet. Start by recording your first income or expense.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-50/80 border-b-2 border-slate-900 text-slate-800 font-black uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-4 text-slate-600 font-mono tabular-nums whitespace-nowrap font-bold">
                      {tx.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>
                        <span className="truncate block max-w-xs">{tx.description}</span>
                        {tx.notes && (
                          <span className="text-[10px] text-slate-400 truncate block font-normal">
                            {tx.notes}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap font-bold">
                      <span>{tx.category}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-black px-2 py-0.5 rounded-full border border-slate-900 text-[10px] ${
                          tx.type === 'income' ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
                        }`}
                      >
                        {tx.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono tabular-nums font-black whitespace-nowrap text-sm ${
                        tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount, currency)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 text-slate-500">
                        <button
                          onClick={() => onViewDetails(tx)}
                          title="View Details"
                          className="p-1 hover:text-blue-600 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <button
                          onClick={() => onEditTransaction(tx)}
                          title="Edit"
                          className="p-1 hover:text-slate-900 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          title="Delete"
                          className="p-1 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
