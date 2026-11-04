import React from 'react';
import { Plus, AlertTriangle, CheckCircle2, Edit2, Trash2, PieChart, Sparkles } from 'lucide-react';
import { Budget, Transaction, UserProfile } from '../types/finance';
import { calculateBudgetStatuses, formatCurrency, CATEGORY_COLORS } from '../utils/financeCalculations';

interface BudgetsPageProps {
  budgets: Budget[];
  transactions: Transaction[];
  profile: UserProfile;
  onOpenAddBudget: () => void;
  onEditBudget: (b: Budget) => void;
  onDeleteBudget: (id: string) => void;
}

export const BudgetsPage: React.FC<BudgetsPageProps> = ({
  budgets,
  transactions,
  profile,
  onOpenAddBudget,
  onEditBudget,
  onDeleteBudget,
}) => {
  const budgetStatuses = calculateBudgetStatuses(budgets, transactions);
  const currency = profile.currency;

  const totalAllocated = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const totalSpent = budgetStatuses.reduce((acc, bs) => acc + bs.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Category Budgets</h2>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-200 text-slate-900 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]">
              {budgets.length} configured
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Set monthly guardrails and track category spending limits
          </p>
        </div>
        <button
          onClick={onOpenAddBudget}
          className="cartoon-btn-primary flex items-center gap-1.5 px-4 py-2 text-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Budget Limit</span>
        </button>
      </div>

      {/* Aggregate Budget Summary Card */}
      <div className="cartoon-card p-5 sm:p-6 bg-[#FEFCE8]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-black text-amber-950 uppercase tracking-wide">
              Total Monthly Spending Cap
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 font-mono tabular-nums">
                {formatCurrency(totalSpent, currency)}
              </span>
              <span className="text-slate-600 font-mono font-bold text-sm">
                / {formatCurrency(totalAllocated, currency)} cap
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs font-mono tabular-nums">
            <div className="p-2.5 rounded-xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
              <span className="text-slate-500 block text-[10px] font-black uppercase font-sans">Remaining Buffer</span>
              <span
                className={`font-black text-base ${
                  totalRemaining >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {formatCurrency(totalRemaining, currency)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
              <span className="text-slate-500 block text-[10px] font-black uppercase font-sans">Utilization</span>
              <span className="font-black text-base text-slate-900">{overallPct}%</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-white rounded-full h-3.5 border-2 border-slate-900 overflow-hidden shadow-[1.5px_1.5px_0px_#0f172a]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPct >= 100
                  ? 'bg-rose-500'
                  : overallPct >= 80
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, overallPct)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono font-bold text-amber-900">
            <span>0% spent</span>
            <span>{overallPct}% consumed</span>
            <span>100% threshold</span>
          </div>
        </div>
      </div>

      {/* Budgets Grid */}
      {budgetStatuses.length === 0 ? (
        <div className="cartoon-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-slate-900 mx-auto mb-3 flex items-center justify-center text-slate-800 shadow-[2px_2px_0px_#0f172a]">
            <PieChart className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h3 className="text-base font-black text-slate-900">No category budgets created yet</h3>
          <p className="text-xs font-bold text-slate-500 mt-1 max-w-sm mx-auto">
            Create monthly budget caps for Food, Rent, Travel, or Entertainment to stay financially disciplined.
          </p>
          <button
            onClick={onOpenAddBudget}
            className="cartoon-btn-primary mt-4 px-4 py-2 text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create First Budget</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgetStatuses.map((bs) => {
            const isExceeded = bs.status === 'exceeded';
            const isWarning = bs.status === 'warning';
            const categoryColor = CATEGORY_COLORS[bs.budget.category] || '#3B82F6';

            return (
              <div
                key={bs.budget.id}
                className="cartoon-card cartoon-card-hover p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full border border-slate-900 shrink-0 shadow-[1px_1px_0px_#0f172a]"
                          style={{ backgroundColor: categoryColor }}
                        />
                        <h4 className="text-base font-black text-slate-900">{bs.budget.category}</h4>
                      </div>
                      <div className="mt-1.5">
                        {isExceeded && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-200 text-rose-950 border border-slate-900">
                            <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
                            <span>Exceeded Limit</span>
                          </span>
                        )}
                        {isWarning && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-slate-900">
                            <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
                            <span>Approaching Limit</span>
                          </span>
                        )}
                        {!isExceeded && !isWarning && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 border border-slate-900">
                            <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                            <span>Healthy</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500">
                      <button
                        onClick={() => onEditBudget(bs.budget)}
                        title="Edit Budget"
                        className="p-1.5 hover:text-slate-900 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <button
                        onClick={() => onDeleteBudget(bs.budget.id)}
                        title="Delete Budget"
                        className="p-1.5 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Financial figures */}
                  <div className="space-y-1.5 mb-3 bg-amber-50/50 p-3 rounded-xl border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500 font-bold">Spent / Limit</span>
                      <span className="font-mono tabular-nums font-black text-slate-900">
                        {formatCurrency(bs.spent, currency)} /{' '}
                        {formatCurrency(bs.budget.monthlyLimit, currency)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500 font-bold">Remaining Buffer</span>
                      <span
                        className={`font-mono tabular-nums font-black ${
                          bs.remaining >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {bs.remaining >= 0
                          ? formatCurrency(bs.remaining, currency)
                          : `-${formatCurrency(Math.abs(bs.remaining), currency)}`}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 border border-slate-900 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isExceeded
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, bs.percentageUsed)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-500 font-bold">
                      <span>{bs.percentageUsed}% used</span>
                      <span>100% cap</span>
                    </div>
                  </div>
                </div>

                {/* Exceeded alert notice */}
                {isExceeded && (
                  <div className="mt-3.5 pt-2.5 border-t-2 border-rose-200 text-[11px] text-rose-700 font-black flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Over limit by {formatCurrency(Math.abs(bs.remaining), currency)}!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
