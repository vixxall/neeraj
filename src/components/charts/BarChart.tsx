import React, { useState } from 'react';
import { MonthlyTrendData, formatCurrency } from '../../utils/financeCalculations';

interface BarChartProps {
  data: MonthlyTrendData[];
  currency?: string;
  timeRange: '1M' | '6M' | '12M';
  onTimeRangeChange: (range: '1M' | '6M' | '12M') => void;
}

export const IncomeExpenseBarChart: React.FC<BarChartProps> = ({
  data,
  currency = '₹',
  timeRange,
  onTimeRangeChange,
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyTrendData | null>(null);

  // Calculate dynamic max value for scaling
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense, d.savings)),
    10000
  );
  // Add 15% headroom for aesthetic spacing
  const chartMax = Math.ceil(maxVal * 1.15);

  const chartHeight = 220;

  return (
    <div className="w-full flex flex-col">
      {/* Header controls & legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-black">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-slate-900">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
            <span className="text-emerald-950">Income</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 border border-slate-900">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 border border-slate-900" />
            <span className="text-rose-950">Expenses</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 border border-slate-900">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 border border-slate-900" />
            <span className="text-blue-950">Savings</span>
          </div>
        </div>

        {/* Time range selector tabs */}
        <div className="flex items-center gap-1 bg-amber-100/70 p-1 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a]">
          <button
            onClick={() => onTimeRangeChange('1M')}
            className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
              timeRange === '1M'
                ? 'bg-amber-300 text-slate-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 1 Month
          </button>
          <button
            onClick={() => onTimeRangeChange('6M')}
            className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
              timeRange === '6M'
                ? 'bg-amber-300 text-slate-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => onTimeRangeChange('12M')}
            className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
              timeRange === '12M'
                ? 'bg-amber-300 text-slate-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 12 Months
          </button>
        </div>
      </div>

      {/* SVG Bar Chart with Axes and Gridlines */}
      <div className="relative w-full">
        {/* Active hover tooltip overlay */}
        {hoveredMonth && (
          <div className="absolute top-0 right-4 z-10 bg-slate-900 text-white text-xs rounded-xl py-2 px-3.5 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] pointer-events-none flex items-center gap-3 font-mono tabular-nums">
            <span className="font-black text-amber-300">{hoveredMonth.monthLabel}:</span>
            <span className="text-emerald-400 font-bold">+{formatCurrency(hoveredMonth.income, currency)}</span>
            <span className="text-rose-400 font-bold">-{formatCurrency(hoveredMonth.expense, currency)}</span>
            <span className="text-sky-300 font-bold">={formatCurrency(hoveredMonth.savings, currency)}</span>
          </div>
        )}

        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-[500px]">
            {/* Gridlines */}
            <div className="relative h-[220px] w-full border-b-2 border-slate-900 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-dashed border-slate-200 w-full" />
              <div className="border-b border-dashed border-slate-200 w-full" />
              <div className="border-b border-dashed border-slate-200 w-full" />
              <div className="border-b border-dashed border-slate-200 w-full" />
            </div>

            {/* Bars container */}
            <div className="absolute inset-0 flex items-end justify-between px-4 pb-0">
              {data.map((item) => {
                const incomeH = Math.max(6, (item.income / chartMax) * chartHeight);
                const expenseH = Math.max(6, (item.expense / chartMax) * chartHeight);
                const savingsH = Math.max(
                  0,
                  (Math.max(0, item.savings) / chartMax) * chartHeight
                );

                const isHovered = hoveredMonth?.monthKey === item.monthKey;
                const barWidthClass = data.length <= 4 ? 'w-5 sm:w-6' : 'w-3 sm:w-4';

                return (
                  <div
                    key={item.monthKey}
                    onMouseEnter={() => setHoveredMonth(item)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full px-1 cursor-pointer group"
                  >
                    <div className="flex items-end gap-1.5 w-full max-w-[70px] justify-center">
                      {/* Income Bar */}
                      <div
                        style={{ height: `${incomeH}px` }}
                        className={`${barWidthClass} rounded-t-lg transition-all bg-emerald-400 border-2 border-slate-900 shadow-[1.5px_0px_0px_#0f172a] ${
                          isHovered ? 'brightness-110 scale-y-105 origin-bottom' : 'opacity-95'
                        }`}
                        title={`Income: ${formatCurrency(item.income, currency)}`}
                      />

                      {/* Expense Bar */}
                      <div
                        style={{ height: `${expenseH}px` }}
                        className={`${barWidthClass} rounded-t-lg transition-all bg-rose-400 border-2 border-slate-900 shadow-[1.5px_0px_0px_#0f172a] ${
                          isHovered ? 'brightness-110 scale-y-105 origin-bottom' : 'opacity-95'
                        }`}
                        title={`Expense: ${formatCurrency(item.expense, currency)}`}
                      />

                      {/* Savings Bar */}
                      <div
                        style={{ height: `${savingsH}px` }}
                        className={`${barWidthClass} rounded-t-lg transition-all bg-blue-400 border-2 border-slate-900 shadow-[1.5px_0px_0px_#0f172a] ${
                          isHovered ? 'brightness-110 scale-y-105 origin-bottom' : 'opacity-95'
                        }`}
                        title={`Savings: ${formatCurrency(item.savings, currency)}`}
                      />
                    </div>

                    {/* Month Label */}
                    <span
                      className={`mt-2 text-xs truncate font-bold transition-colors ${
                        isHovered ? 'text-blue-700 font-black' : 'text-slate-600'
                      }`}
                    >
                      {item.monthLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
