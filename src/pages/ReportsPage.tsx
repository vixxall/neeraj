import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Sparkles,
} from 'lucide-react';
import { Budget, SavingsGoal, Transaction, UserProfile } from '../types/finance';
import {
  calculateBudgetStatuses,
  calculateKPIStats,
  formatCurrency,
  getCategorySpending,
  getCurrentMonthKey,
} from '../utils/financeCalculations';
import { exportFinancialReportCSV } from '../utils/csvExport';

interface ReportsPageProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  profile: UserProfile;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  transactions,
  budgets,
  goals,
  profile,
}) => {
  const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  const currency = profile.currency;

  // Filter transactions for report period
  const periodTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (reportType === 'monthly') {
        return t.date.startsWith(selectedMonth);
      } else {
        return t.date.startsWith(selectedYear);
      }
    });
  }, [transactions, reportType, selectedMonth, selectedYear]);

  // Aggregations
  const totalIncome = periodTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = periodTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSavings = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? Math.max(0, Math.round(((totalSavings / totalIncome) * 100) * 10) / 10) : 0;

  const categoryBreakdown = useMemo(() => {
    return getCategorySpending(
      periodTransactions,
      reportType === 'monthly' ? selectedMonth : undefined
    );
  }, [periodTransactions, reportType, selectedMonth]);

  const budgetStatuses = useMemo(() => {
    return calculateBudgetStatuses(
      budgets,
      periodTransactions,
      reportType === 'monthly' ? selectedMonth : undefined
    );
  }, [budgets, periodTransactions, reportType, selectedMonth]);

  const handleExportCSV = () => {
    const periodLabel = reportType === 'monthly' ? selectedMonth : `Year_${selectedYear}`;
    exportFinancialReportCSV(
      `${reportType === 'monthly' ? 'Monthly' : 'Yearly'} Financial Statement`,
      periodLabel,
      { totalIncome, totalExpense, totalSavings, savingsRate },
      categoryBreakdown,
      budgetStatuses.map((b) => ({
        category: b.budget.category,
        limit: b.budget.monthlyLimit,
        spent: b.spent,
        remaining: b.remaining,
      })),
      goals,
      currency
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="cartoon-card p-4 sm:p-5 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Financial Reports & Statements</h2>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-200 text-slate-900 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]">
                Formal
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500 mt-1">
              Generate structured financial statements, audit reports, and balance summaries
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Report Type Toggle */}
            <div className="flex items-center p-1 bg-amber-100/70 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a]">
              <button
                onClick={() => setReportType('monthly')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                  reportType === 'monthly'
                    ? 'bg-amber-300 text-slate-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Report
              </button>
              <button
                onClick={() => setReportType('yearly')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                  reportType === 'yearly'
                    ? 'bg-amber-300 text-slate-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Yearly Report
              </button>
            </div>

            {/* Period Selector */}
            {reportType === 'monthly' ? (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="cartoon-input px-3 py-1.5 text-xs font-bold text-slate-900 font-mono"
              />
            ) : (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="cartoon-input px-3 py-1.5 text-xs font-bold text-slate-900"
              >
                <option value="2026">2026 Financial Year</option>
                <option value="2025">2025 Financial Year</option>
              </select>
            )}

            {/* Export Actions */}
            <button
              onClick={handleExportCSV}
              className="cartoon-btn-secondary flex items-center gap-1.5 px-3.5 py-1.5 text-xs"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="cartoon-btn-primary flex items-center gap-1.5 px-3.5 py-1.5 text-xs"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="cartoon-card p-6 sm:p-8 space-y-8 bg-white">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-slate-900 uppercase font-black px-2.5 py-0.5 rounded-full bg-amber-200 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]">
              Official Statement
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
              {reportType === 'monthly' ? `Monthly Financial Statement` : `Annual Financial Statement`}
            </h1>
            <p className="text-xs font-bold text-slate-500 mt-1">
              Account Holder: <span className="font-black text-slate-900">{profile.name}</span> ({profile.email})
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 font-mono font-bold">
            <div className="p-2.5 rounded-xl bg-amber-50 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
              <div>
                Period:{' '}
                <span className="font-black text-slate-900">
                  {reportType === 'monthly' ? selectedMonth : `FY ${selectedYear}`}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-normal">
                Generated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Executive KPI Summary Cards */}
        <div>
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
            01. Executive Financial Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#ECFDF5] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#0f172a]">
              <span className="text-xs text-emerald-950 font-black uppercase tracking-wide block">Gross Inflow</span>
              <span className="text-xl font-black text-slate-900 font-mono tabular-nums mt-1 block">
                {formatCurrency(totalIncome, currency)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#FFF1F2] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#0f172a]">
              <span className="text-xs text-rose-950 font-black uppercase tracking-wide block">Gross Outflow</span>
              <span className="text-xl font-black text-slate-900 font-mono tabular-nums mt-1 block">
                {formatCurrency(totalExpense, currency)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#FEFCE8] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#0f172a]">
              <span className="text-xs text-amber-950 font-black uppercase tracking-wide block">Net Savings</span>
              <span
                className={`text-xl font-black font-mono tabular-nums mt-1 block ${
                  totalSavings >= 0 ? 'text-slate-900' : 'text-rose-600'
                }`}
              >
                {formatCurrency(totalSavings, currency)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#EFF6FF] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#0f172a]">
              <span className="text-xs text-blue-950 font-black uppercase tracking-wide block">Savings Rate</span>
              <span className="text-xl font-black text-blue-700 font-mono tabular-nums mt-1 block">
                {savingsRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div>
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
            02. Category-Wise Expense Distribution
          </h3>
          <div className="overflow-x-auto border-2 border-slate-900 rounded-xl shadow-[2.5px_2.5px_0px_#0f172a]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFDF7] text-slate-800 uppercase tracking-wider text-[11px] font-black border-b-2 border-slate-900">
                <tr>
                  <th className="py-3 px-4">Expense Category</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-right">Proportion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {categoryBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-400 font-sans font-bold">
                      No expense records in this reporting period.
                    </td>
                  </tr>
                ) : (
                  categoryBreakdown.map((item) => (
                    <tr key={item.category} className="hover:bg-amber-50/30">
                      <td className="py-3 px-4 font-sans font-bold text-slate-900">
                        {item.category}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        {formatCurrency(item.amount, currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-600">
                        {item.percentage}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Budget Audit */}
        <div>
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
            03. Budget Utilization & Audit Status
          </h3>
          <div className="overflow-x-auto border-2 border-slate-900 rounded-xl shadow-[2.5px_2.5px_0px_#0f172a]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFDF7] text-slate-800 uppercase tracking-wider text-[11px] font-black border-b-2 border-slate-900">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Budget Limit</th>
                  <th className="py-3 px-4 text-right">Actual Spent</th>
                  <th className="py-3 px-4 text-right">Remaining</th>
                  <th className="py-3 px-4 text-right">Usage</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {budgetStatuses.map((bs) => (
                  <tr key={bs.budget.id} className="hover:bg-amber-50/30">
                    <td className="py-3 px-4 font-sans font-bold text-slate-900">
                      {bs.budget.category}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-bold">
                      {formatCurrency(bs.budget.monthlyLimit, currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      {formatCurrency(bs.spent, currency)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-black ${
                        bs.remaining >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(bs.remaining, currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-700">
                      {bs.percentageUsed}%
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      {bs.status === 'exceeded' ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-200 text-rose-950 border border-slate-900">
                          Exceeded
                        </span>
                      ) : bs.status === 'warning' ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-slate-900">
                          Warning
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 border border-slate-900">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Savings Goals Status */}
        <div>
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
            04. Active Savings Goals
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {goals.map((g) => {
              const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
              return (
                <div key={g.id} className="p-3.5 bg-amber-50/50 border-2 border-slate-900 rounded-xl space-y-1.5 shadow-[1.5px_1.5px_0px_#0f172a]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900">{g.name}</span>
                    <span className="font-mono text-blue-700 font-black">{pct}%</span>
                  </div>
                  <div className="text-[11px] font-mono tabular-nums text-slate-600 font-bold">
                    {formatCurrency(g.currentAmount, currency)} / {formatCurrency(g.targetAmount, currency)}
                  </div>
                  <div className="w-full bg-white rounded-full h-2 border border-slate-900 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 font-bold gap-2">
          <span>Personal Finance Tracker · Certified Ledger Records</span>
          <span>Data-based financial report for personal accounting</span>
        </div>
      </div>
    </div>
  );
};
