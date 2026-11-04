import React from 'react';
import { CategorySpending, formatCurrency } from '../../utils/financeCalculations';

interface HorizontalBarChartProps {
  categories: CategorySpending[];
  currency?: string;
}

export const TopSpendingHorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  categories,
  currency = '₹',
}) => {
  if (categories.length === 0) {
    return <div className="text-sm font-bold text-slate-400 p-6 text-center">No spending recorded.</div>;
  }

  const maxAmount = Math.max(...categories.map((c) => c.amount), 1);

  return (
    <div className="space-y-3.5 w-full">
      {categories.slice(0, 6).map((item) => {
        const barWidth = Math.max(6, (item.amount / maxAmount) * 100);

        return (
          <div key={item.category} className="group">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-black text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full border border-slate-900" style={{ backgroundColor: item.color }} />
                <span>{item.category}</span>
              </span>
              <div className="flex items-center gap-2 font-mono tabular-nums text-slate-900 font-black">
                <span>{formatCurrency(item.amount, currency)}</span>
                <span className="text-slate-500 font-bold">({item.percentage}%)</span>
              </div>
            </div>

            {/* Progress track */}
            <div className="w-full h-3 bg-slate-100 rounded-full border border-slate-900 overflow-hidden shadow-[1px_1px_0px_#0f172a]">
              <div
                className="h-full rounded-full transition-all duration-500 group-hover:brightness-105"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
