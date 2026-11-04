import React, { useState } from 'react';
import { formatCurrency } from '../../utils/financeCalculations';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  title?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  color?: string; // hex
  fillColor?: string;
  currency?: string;
  isPercentage?: boolean;
}

export const SmoothLineChart: React.FC<LineChartProps> = ({
  data,
  valuePrefix = '',
  valueSuffix = '',
  color = '#2563EB', // default blue
  fillColor = 'rgba(37, 99, 235, 0.08)',
  currency = '₹',
  isPercentage = false,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return <div className="text-sm font-bold text-slate-400 p-6 text-center">No trend data available</div>;
  }

  const height = 180;
  const width = 500;
  const paddingX = 35;
  const paddingY = 25;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 10);
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((d.value - minVal) / range) * (height - 2 * paddingY);
    return { x, y, ...d };
  });

  // Construct SVG path line
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Construct fill path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[420px] relative">
        {/* Tooltip */}
        {hoveredIdx !== null && (
          <div
            className="absolute top-1 z-10 bg-slate-900 border-2 border-slate-900 text-white text-xs rounded-xl px-3 py-1.5 pointer-events-none shadow-[2px_2px_0px_#0f172a] font-mono tabular-nums"
            style={{
              left: Math.min(Math.max(points[hoveredIdx].x - 40, 10), width - 100),
            }}
          >
            <span className="font-black text-amber-300 mr-1.5">{points[hoveredIdx].label}:</span>
            <span className="font-bold">
              {isPercentage
                ? `${points[hoveredIdx].value}%`
                : `${valuePrefix}${formatCurrency(points[hoveredIdx].value, currency)}${valueSuffix}`}
            </span>
          </div>
        )}

        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          <defs>
            <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal gridlines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#e2e8f0" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#e2e8f0" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#0f172a" strokeWidth="2" />

          {/* Area fill */}
          <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />

          {/* Line stroke */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive dots */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? 7 : 5}
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="2.5"
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              <text
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="11"
                className={`fill-slate-600 font-bold ${hoveredIdx === i ? 'fill-slate-950 font-black' : ''}`}
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
