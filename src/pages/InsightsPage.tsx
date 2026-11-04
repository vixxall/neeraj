import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { AlertItem, InsightItem, PageId, UserProfile } from '../types/finance';

interface InsightsPageProps {
  alerts: AlertItem[];
  insights: InsightItem[];
  profile: UserProfile;
  onNavigate: (page: PageId) => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({
  alerts,
  insights,
  profile,
  onNavigate,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Smart Alerts & Insights</h2>
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-200 text-slate-900 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]">
            Rule Engine
          </span>
        </div>
        <p className="text-xs font-bold text-slate-500 mt-1">
          Automated rule-based diagnostic engine monitoring your cash flow and threshold limits
        </p>
      </div>

      {/* Transparency Banner */}
      <div className="p-4 bg-sky-100 border-2 border-slate-900 rounded-2xl flex items-start gap-3.5 text-xs text-sky-950 shadow-[3px_3px_0px_#0f172a]">
        <div className="p-1.5 rounded-xl bg-white border-2 border-slate-900 text-sky-700 shadow-[1.5px_1.5px_0px_#0f172a] shrink-0 mt-0.5">
          <Info className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div>
          <span className="font-black text-sky-950">Notice & Transparency:</span> The recommendations below are{' '}
          <strong>data-based insights</strong> mathematically derived from your recorded expenses and
          configured budgets. They are intended for budgeting awareness and personal organization,
          not certified financial advisory services.
        </div>
      </div>

      {/* Section 1: Active Smart Alerts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-rose-200 border-2 border-slate-900 text-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]">
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-black text-slate-900">Active Smart Alerts</h3>
            <span className="text-xs font-mono font-black text-slate-500">({alerts.length})</span>
          </div>
          {alerts.length > 0 && (
            <span className="text-xs font-bold text-slate-500">Live monitoring</span>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="cartoon-card p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-200 border-2 border-slate-900 mx-auto mb-3 flex items-center justify-center text-slate-950 shadow-[2px_2px_0px_#0f172a]">
              <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h4 className="text-base font-black text-slate-900">All Systems Nominal 🎉</h4>
            <p className="text-xs font-bold text-slate-500 mt-1 max-w-sm mx-auto">
              No budget limits exceeded or risk indicators flagged for this accounting cycle.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => {
              const isDanger = alert.type === 'danger';
              const isWarning = alert.type === 'warning';
              const isSuccess = alert.type === 'success';

              return (
                <div
                  key={alert.id}
                  className={`cartoon-card cartoon-card-hover p-4.5 flex items-start gap-3.5 ${
                    isDanger
                      ? 'bg-rose-50/60'
                      : isWarning
                      ? 'bg-amber-50/60'
                      : isSuccess
                      ? 'bg-emerald-50/60'
                      : 'bg-sky-50/60'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl border-2 border-slate-900 shrink-0 mt-0.5 shadow-[1.5px_1.5px_0px_#0f172a] ${
                      isDanger
                        ? 'bg-rose-300 text-rose-950'
                        : isWarning
                        ? 'bg-amber-300 text-amber-950'
                        : isSuccess
                        ? 'bg-emerald-300 text-emerald-950'
                        : 'bg-sky-300 text-sky-950'
                    }`}
                  >
                    {isDanger && <AlertTriangle className="w-4 h-4 stroke-[2.5]" />}
                    {isWarning && <AlertTriangle className="w-4 h-4 stroke-[2.5]" />}
                    {isSuccess && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                    {!isDanger && !isWarning && !isSuccess && <Info className="w-4 h-4 stroke-[2.5]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-black text-slate-900 truncate">{alert.title}</h4>
                      <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">
                        {alert.timestamp}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-600 mt-1 leading-relaxed">{alert.message}</p>

                    {alert.category && (
                      <button
                        onClick={() => onNavigate('budgets')}
                        className="mt-2.5 text-xs font-black text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Adjust {alert.category} budget</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Data-based Insights */}
      <div className="space-y-4 pt-4 border-t-2 border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-300 border-2 border-slate-900 text-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]">
            <Lightbulb className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h3 className="text-base font-black text-slate-900">Data-Based Insights</h3>
          <span className="text-[11px] font-mono bg-amber-100 text-slate-900 border border-slate-900 px-2 py-0.5 rounded-full font-black">
            Automated Analysis
          </span>
        </div>

        {insights.length === 0 ? (
          <div className="cartoon-card p-8 text-center text-xs font-bold text-slate-500">
            More transactions needed to calculate patterns and predictive velocity.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="cartoon-card cartoon-card-hover p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-black text-slate-900 leading-snug">
                    {insight.title}
                  </h4>
                  <span
                    className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border border-slate-900 uppercase tracking-wider shrink-0 ${
                      insight.impact === 'positive'
                        ? 'bg-emerald-200 text-emerald-950'
                        : insight.impact === 'warning'
                        ? 'bg-amber-200 text-amber-950'
                        : 'bg-slate-200 text-slate-950'
                    }`}
                  >
                    {insight.impact}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-600 leading-relaxed">{insight.description}</p>

                {insight.recommendation && (
                  <div className="p-3 bg-amber-50/70 rounded-xl border-2 border-slate-900 text-xs text-slate-800 shadow-[1.5px_1.5px_0px_#0f172a]">
                    <span className="font-black text-slate-900">💡 Recommended Action: </span>
                    <span className="font-bold">{insight.recommendation}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
