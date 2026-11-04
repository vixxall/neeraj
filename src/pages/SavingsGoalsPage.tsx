import React from 'react';
import { Plus, PiggyBank, Calendar, DollarSign, Edit2, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { SavingsGoal, UserProfile } from '../types/finance';
import { formatCurrency } from '../utils/financeCalculations';

interface SavingsGoalsPageProps {
  goals: SavingsGoal[];
  profile: UserProfile;
  onOpenAddGoal: () => void;
  onEditGoal: (g: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
  onOpenAddFunds: (g: SavingsGoal) => void;
}

export const SavingsGoalsPage: React.FC<SavingsGoalsPageProps> = ({
  goals,
  profile,
  onOpenAddGoal,
  onEditGoal,
  onDeleteGoal,
  onOpenAddFunds,
}) => {
  const currency = profile.currency;

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Savings Goals</h2>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-200 text-slate-900 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]">
              {goals.length} milestones
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Build your personal wealth vault milestone by milestone
          </p>
        </div>
        <button
          onClick={onOpenAddGoal}
          className="cartoon-btn-green flex items-center gap-1.5 px-4 py-2 text-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="cartoon-card p-5 sm:p-6 bg-[#ECFDF5]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
              Total Savings Pipeline
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 font-mono tabular-nums">
                {formatCurrency(totalSaved, currency)}
              </span>
              <span className="text-slate-600 font-mono font-bold text-sm">
                / {formatCurrency(totalTarget, currency)} total goal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs font-mono tabular-nums">
            <div className="p-2.5 rounded-xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
              <span className="text-slate-500 block text-[10px] font-black uppercase font-sans">Remaining Needed</span>
              <span className="font-black text-base text-slate-900">
                {formatCurrency(totalRemaining, currency)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
              <span className="text-slate-500 block text-[10px] font-black uppercase font-sans">Milestone Progress</span>
              <span className="font-black text-base text-emerald-700">{overallProgress}%</span>
            </div>
          </div>
        </div>

        {/* Global Progress Track */}
        <div className="space-y-1.5">
          <div className="w-full bg-white rounded-full h-3.5 border-2 border-slate-900 overflow-hidden shadow-[1.5px_1.5px_0px_#0f172a]">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, overallProgress)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono font-bold text-emerald-900">
            <span>0% funded</span>
            <span>{overallProgress}% accumulated</span>
            <span>100% target</span>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="cartoon-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-slate-900 mx-auto mb-3 flex items-center justify-center text-slate-800 shadow-[2px_2px_0px_#0f172a]">
            <PiggyBank className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h3 className="text-base font-black text-slate-900">No savings goals created yet</h3>
          <p className="text-xs font-bold text-slate-500 mt-1 max-w-sm mx-auto">
            Set ambitious targets like an Emergency Reserve, Vacation, or Tech Workstation.
          </p>
          <button
            onClick={onOpenAddGoal}
            className="cartoon-btn-green mt-4 px-4 py-2 text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create First Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const progress =
              goal.targetAmount > 0
                ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
                : 0;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const isCompleted = progress >= 100;

            return (
              <div
                key={goal.id}
                className="cartoon-card cartoon-card-hover p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-base font-black text-slate-900 leading-tight">
                        {goal.name}
                      </h4>
                      {goal.category && (
                        <span className="text-[11px] font-bold text-slate-400">
                          {goal.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <button
                        onClick={() => onEditGoal(goal)}
                        title="Edit Goal"
                        className="p-1.5 hover:text-slate-900 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        title="Delete Goal"
                        className="p-1.5 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {goal.notes && (
                    <p className="text-xs font-bold text-slate-500 mb-3 line-clamp-2">{goal.notes}</p>
                  )}

                  {/* Financial figures */}
                  <div className="space-y-1.5 my-3 bg-amber-50/50 p-3 rounded-xl border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500 font-bold">Saved so far</span>
                      <span className="font-mono tabular-nums font-black text-slate-900 text-sm">
                        {formatCurrency(goal.currentAmount, currency)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500 font-bold">Target Amount</span>
                      <span className="font-mono tabular-nums font-bold text-slate-700">
                        {formatCurrency(goal.targetAmount, currency)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500 font-bold">Remaining</span>
                      <span className="font-mono tabular-nums font-bold text-slate-600">
                        {formatCurrency(remaining, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 border border-slate-900 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-400' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                      <span className="font-black text-blue-700">{progress}% complete</span>
                      <span className="text-slate-500 flex items-center gap-1 font-sans font-bold">
                        <Calendar className="w-3 h-3 stroke-[2.5]" />
                        <span>Due {goal.targetDate}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-between">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-950 border border-slate-900">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Target Achieved! 🎉</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 font-black">Keep going!</span>
                  )}

                  <button
                    onClick={() => onOpenAddFunds(goal)}
                    className="cartoon-btn-primary px-3 py-1.5 text-xs"
                  >
                    + Add Money
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
