import React, { useState } from 'react';
import { CategorySpending, formatCurrency } from '../../utils/financeCalculations';

interface DonutChartProps {
  data: CategorySpending[];
  currency?: string;
  size?: number;
  compact?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  currency = '₹',
  size = 140,
  compact = false,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((acc, item) => acc + item.amount, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
        <p className="text-xs font-bold text-slate-500">No expense records yet.</p>
        <span className="text-[11px] text-slate-400 mt-0.5 font-bold">Recorded expenses show here</span>
      </div>
    );
  }

  const chartSize = compact ? Math.min(size, 140) : size;
  const radius = chartSize * 0.38;
  const strokeWidth = chartSize * 0.16;
  const center = chartSize / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const hoveredItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  // For compact view, limit visible items to top 4, group rest into "Other"
  const visibleItems = compact && data.length > 5 ? data.slice(0, 4) : data;
  const remainingCount = data.length - visibleItems.length;
  const remainingAmount = data.slice(4).reduce((sum, item) => sum + item.amount, 0);
  const remainingPercent = total > 0 ? Math.round((remainingAmount / total) * 100) : 0;

  return (
    <div className={`w-full flex ${compact ? 'flex-col items-center' : 'flex-col sm:flex-row items-center justify-between gap-5'}`}>
      {/* SVG Donut */}
      <div
        className="relative shrink-0 flex items-center justify-center my-1"
        style={{ width: chartSize, height: chartSize }}
      >
        <svg
          width={chartSize}
          height={chartSize}
          viewBox={`0 0 ${chartSize} ${chartSize}`}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {data.map((item, idx) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += item.percentage;

            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={item.category}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider truncate max-w-[85px]">
            {hoveredItem ? hoveredItem.category : 'Total'}
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-900 font-mono tabular-nums tracking-tight">
            {formatCurrency(hoveredItem ? hoveredItem.amount : total, currency)}
          </span>
          {hoveredItem && (
            <span className="text-[10px] font-black text-slate-700 font-mono tabular-nums">
              {hoveredItem.percentage}%
            </span>
          )}
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className={`w-full ${compact ? 'mt-2 space-y-1' : 'flex-1 space-y-1.5'}`}>
        {visibleItems.map((item) => {
          const idx = data.findIndex((d) => d.category === item.category);
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={item.category}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer text-xs ${
                isHovered ? 'bg-amber-100/70 border border-slate-900 font-bold' : 'hover:bg-amber-50/50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-slate-900 shadow-[0.5px_0.5px_0px_#0f172a]"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-800 truncate text-[11px] font-black">
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums text-[11px]">
                <span className="text-slate-900 font-bold">
                  {formatCurrency(item.amount, currency)}
                </span>
                <span className="text-slate-500 w-8 text-right font-black">
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}

        {/* Compact summary of remaining categories */}
        {compact && remainingCount > 0 && (
          <div className="flex items-center justify-between px-2.5 py-1 text-[11px] text-slate-500 font-mono font-bold">
            <span className="text-slate-400">+{remainingCount} other categories</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-800 font-bold">{formatCurrency(remainingAmount, currency)}</span>
              <span className="text-slate-500 w-8 text-right font-black">{remainingPercent}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
