import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  Search,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
} from 'lucide-react';
import { AlertItem, PageId, UserProfile } from '../../types/finance';

interface HeaderProps {
  currentPage: PageId;
  onOpenMobileMenu: () => void;
  onNavigate: (page: PageId) => void;
  alerts: AlertItem[];
  profile: UserProfile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview & financial health summary' },
  transactions: { title: 'Transactions Ledger', subtitle: 'Search, filter, and manage your income & expenses' },
  budgets: { title: 'Monthly Budgets', subtitle: 'Set thresholds and track department spending' },
  goals: { title: 'Savings Goals', subtitle: 'Monitor targeted savings and milestone progress' },
  analytics: { title: 'Financial Analytics', subtitle: 'Deep dive into spending distributions & cash trends' },
  reports: { title: 'Financial Reports', subtitle: 'Monthly and annual aggregated balance sheets' },
  insights: { title: 'Insights & Smart Alerts', subtitle: 'Rule-based financial diagnostics and warnings' },
  settings: { title: 'Application Settings', subtitle: 'Preferences, currency, profile, and local data' },
  welcome: { title: 'Welcome / Sign In', subtitle: 'Authentication & account portal' },
};

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onOpenMobileMenu,
  onNavigate,
  alerts,
  profile,
  searchQuery,
  onSearchChange,
}) => {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotificationMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const pageInfo = PAGE_TITLES[currentPage] || { title: 'Personal Finance Tracker', subtitle: '' };

  return (
    <header className="sticky top-0 z-20 bg-white border-b-2 border-slate-900 px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 -ml-1 text-slate-900 bg-amber-100 hover:bg-amber-200 border-2 border-slate-900 rounded-xl transition-colors shadow-[2px_2px_0px_#0f172a]"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5 font-bold">
              <span>Personal Finance</span>
              <ChevronRight className="w-3 h-3 text-slate-400 stroke-[2.5]" />
              <span className="text-slate-900 font-black">{pageInfo.title}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight hidden sm:block">
              {pageInfo.title}
            </h2>
          </div>
        </div>

        {/* Right Zone: Date, Search, Alerts, Add Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Current Date Display */}
          <div className="hidden xl:flex items-center text-xs font-black text-slate-800 bg-amber-100 px-3 py-1.5 rounded-xl border-2 border-slate-900 font-mono shadow-[2px_2px_0px_#0f172a]">
            📅 {todayFormatted}
          </div>

          {/* Quick Search */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentPage !== 'transactions') {
                  onNavigate('transactions');
                }
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-bold bg-white border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] focus:outline-none focus:ring-0 focus:shadow-[3px_3px_0px_#3b82f6] transition-all"
            />
          </div>

          {/* Active Alert in Notification Bar */}
          {alerts.length > 0 && (
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 border-slate-900 bg-amber-300 hover:bg-amber-400 text-slate-950 shadow-[2px_2px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              title="Click to view alert in notification bar"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-slate-950 shrink-0 stroke-[2.5]" />
              <span className="hidden md:inline font-black truncate max-w-[160px]">
                {alerts[0].title}
              </span>
              <span className="font-mono text-[10px] font-black bg-white text-slate-950 px-1.5 py-0.2 rounded-full border border-slate-900">
                {alerts.length}
              </span>
            </button>
          )}

          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="relative p-2 text-slate-900 bg-white hover:bg-amber-50 border-2 border-slate-900 rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-[2px_2px_0px_#0f172a] cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4 stroke-[2.5]" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-slate-900 shadow-[1px_1px_0px_#0f172a]">
                  {alerts.length}
                </span>
              )}
            </button>

            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 cartoon-card p-0 z-50 overflow-hidden text-left animate-in fade-in duration-150">
                <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-slate-900 bg-[#FFFDF7]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">Notifications & Alerts</span>
                    <span className="text-[10px] font-black bg-rose-400 text-slate-950 px-2 py-0.5 rounded-full border-2 border-slate-900 font-mono shadow-[1px_1px_0px_#0f172a]">
                      {alerts.length} Active
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('insights');
                      setShowNotificationMenu(false);
                    }}
                    className="text-xs text-blue-700 hover:text-blue-900 font-black cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y-2 divide-slate-100 p-1">
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center text-xs font-bold text-slate-400">
                      🎉 No active alerts. All budget and financial metrics are healthy!
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => {
                          if (alert.category) {
                            onNavigate('budgets');
                          } else {
                            onNavigate('insights');
                          }
                          setShowNotificationMenu(false);
                        }}
                        className="p-3 hover:bg-amber-50/60 rounded-xl transition-colors cursor-pointer flex items-start gap-2.5 text-xs group"
                      >
                        {alert.type === 'danger' && (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 stroke-[2.5]" />
                        )}
                        {alert.type === 'warning' && (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 stroke-[2.5]" />
                        )}
                        {alert.type === 'success' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                        )}
                        {alert.type === 'info' && (
                          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 stroke-[2.5]" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-extrabold text-slate-900 leading-tight truncate group-hover:text-blue-700">
                              {alert.title}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0 font-bold">
                              {alert.timestamp}
                            </span>
                          </div>
                          <p className="text-slate-600 font-medium text-[11px] mt-0.5 line-clamp-2">
                            {alert.message}
                          </p>
                          {alert.category && (
                            <span className="inline-block mt-1 text-[10px] font-black text-blue-600">
                              Go to {alert.category} budget →
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
