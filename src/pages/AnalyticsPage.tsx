import React, { useState, useMemo } from 'react';
import {
  Category,
  Transaction,
  UserProfile,
} from '../types/finance';
import {
  formatCurrency,
  getCategorySpending,
  getTrendsForTimeRange,
} from '../utils/financeCalculations';
import { DonutChart } from '../components/charts/DonutChart';
import { IncomeExpenseBarChart } from '../components/charts/BarChart';
import { SmoothLineChart } from '../components/charts/LineChart';
import { TopSpendingHorizontalBarChart } from '../components/charts/HorizontalBarChart';
import { BarChart3, TrendingUp, PieChart as PieIcon } from 'lucide-react';

interface AnalyticsPageProps {
  transactions: Transaction[];
  profile: UserProfile;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ transactions, profile }) => {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [timeRange, setTimeRange] = useState<'1M' | '6M' | '12M'>('12M');

  const currency = profile.currency;

  // Filtered transactions for analytical views
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedYear !== 'all' && !t.date.startsWith(selectedYear)) return false;
      if (selectedMonth !== 'all') {
        const monthPart = t.date.slice(5, 7);
        if (monthPart !== selectedMonth) return false;
      }
      if (selectedType !== 'all' && t.type !== selectedType) return false;
      return true;
    });
  }, [transactions, selectedYear, selectedMonth, selectedType]);

  // Derived aggregates
  const categorySpending = useMemo(() => {
    const monthKey = selectedMonth !== 'all' ? `${selectedYear}-${selectedMonth}` : undefined;
    return getCategorySpending(filteredTransactions, monthKey);
  }, [filteredTransactions, selectedMonth, selectedYear]);

  const monthlyTrends = useMemo(() => {
    return getTrendsForTimeRange(transactions, timeRange);
  }, [transactions, timeRange]);

  // Data for Line Charts
  const expenseTrendPoints = monthlyTrends.map((m) => ({
    label: m.monthLabel,
    value: m.expense,
  }));

  const savingsRateTrendPoints = monthlyTrends.map((m) => ({
    label: m.monthLabel,
    value: m.savingsRate,
  }));

  return (
    <div className="space-y-6">
      {/* Top Header & Analytics Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Analytics & Trends</h2>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-200 text-slate-900 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]">
              Interactive
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Statistical breakdown of income, expenses, and savings curves
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="cartoon-input px-3 py-1.5 text-xs font-bold text-slate-900"
          >
            <option value="all">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>

          {/* Month selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="cartoon-input px-3 py-1.5 text-xs font-bold text-slate-900"
          >
            <option value="all">All Months</option>
            <option value="09">September</option>
            <option value="08">August</option>
            <option value="07">July</option>
            <option value="06">June</option>
            <option value="05">May</option>
            <option value="04">April</option>
            <option value="03">March</option>
            <option value="02">February</option>
            <option value="01">January</option>
          </select>

          {/* Type selector */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="cartoon-input px-3 py-1.5 text-xs font-bold text-slate-900"
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>
        </div>
      </div>

      {/* Row 1: Donut Chart & Top Spending Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Donut */}
        <div className="cartoon-card p-5">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-600 stroke-[2.5]" />
              <h3 className="text-sm font-black text-slate-900">Expense by Category</h3>
            </div>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Proportional distribution of expenditure across categories
            </p>
          </div>
          <DonutChart data={categorySpending} currency={currency} size={210} />
        </div>

        {/* Top Spending Categories Horizontal Bars */}
        <div className="cartoon-card p-5">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600 stroke-[2.5]" />
              <h3 className="text-sm font-black text-slate-900">Top Spending Categories</h3>
            </div>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Ranked descending order of absolute capital outlay
            </p>
          </div>
          <TopSpendingHorizontalBarChart categories={categorySpending} currency={currency} />
        </div>
      </div>

      {/* Row 2: Income vs Expense Multi-Bar Chart */}
      <div className="cartoon-card p-5">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            <h3 className="text-sm font-black text-slate-900">Income vs Expense vs Savings Overview</h3>
          </div>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            Macro performance across historical monthly accounting cycles
          </p>
        </div>
        <IncomeExpenseBarChart
          data={monthlyTrends}
          currency={currency}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      </div>

      {/* Row 3: Monthly Expenses Line Trend & Savings Rate Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cartoon-card p-5">
          <div className="mb-3">
            <h3 className="text-sm font-black text-slate-900">Monthly Expense Trajectory</h3>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Cost momentum curve over recent periods
            </p>
          </div>
          <SmoothLineChart
            data={expenseTrendPoints}
            color="#EF4444"
            fillColor="rgba(239, 68, 68, 0.12)"
            currency={currency}
          />
        </div>

        <div className="cartoon-card p-5">
          <div className="mb-3">
            <h3 className="text-sm font-black text-slate-900">Savings Rate (%) Trajectory</h3>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Percentage of monthly gross income retained as capital reserves
            </p>
          </div>
          <SmoothLineChart
            data={savingsRateTrendPoints}
            color="#10B981"
            fillColor="rgba(16, 185, 129, 0.12)"
            isPercentage={true}
          />
        </div>
      </div>

      {/* Monthly Summary Ledger Table */}
      <div className="cartoon-card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b-2 border-slate-900 bg-[#FFFDF7]">
          <h3 className="text-sm font-black text-slate-900">Monthly Financial Summary Ledger</h3>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            Processed aggregation table of historical ledger periods
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-amber-50/80 border-b-2 border-slate-900 text-slate-800 font-black uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Accounting Cycle</th>
                <th className="py-3 px-4 text-right">Income</th>
                <th className="py-3 px-4 text-right">Expenses</th>
                <th className="py-3 px-4 text-right">Net Savings</th>
                <th className="py-3 px-4 text-right">Savings Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {monthlyTrends.map((row) => (
                <tr key={row.monthKey} className="hover:bg-amber-50/30 transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-slate-900">
                    {row.monthLabel}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-700 font-black">
                    +{formatCurrency(row.income, currency)}
                  </td>
                  <td className="py-3 px-4 text-right text-rose-700 font-black">
                    -{formatCurrency(row.expense, currency)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-black ${
                      row.savings >= 0 ? 'text-blue-700' : 'text-rose-700'
                    }`}
                  >
                    {formatCurrency(row.savings, currency)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-900 font-black">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-900">
                      {row.savingsRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
