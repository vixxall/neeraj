import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  PiggyBank,
  TrendingUp,
  FileSpreadsheet,
  BellRing,
  Settings,
  LogOut,
  LogIn,
  Wallet,
  X,
} from 'lucide-react';
import { PageId, UserProfile } from '../../types/finance';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  profile: UserProfile;
  alertCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  profile,
  alertCount,
  isOpenMobile,
  onCloseMobile,
  onLogout,
}) => {
  const navItems: { id: PageId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
    { id: 'transactions', label: 'Transactions', icon: <ReceiptText className="w-4 h-4 shrink-0" /> },
    { id: 'budgets', label: 'Budgets', icon: <PieChart className="w-4 h-4 shrink-0" /> },
    { id: 'goals', label: 'Savings Goals', icon: <PiggyBank className="w-4 h-4 shrink-0" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4 shrink-0" /> },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet className="w-4 h-4 shrink-0" /> },
    {
      id: 'insights',
      label: 'Insights & Alerts',
      icon: <BellRing className="w-4 h-4 shrink-0" />,
      badge: alertCount > 0 ? alertCount : undefined,
    },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4 shrink-0" /> },
    { id: 'welcome', label: 'Login / Welcome', icon: <LogIn className="w-4 h-4 shrink-0" /> },
  ];

  const handleNavClick = (id: PageId) => {
    onNavigate(id);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-white text-slate-900 w-64 border-r-2 border-slate-900 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b-2 border-slate-900 bg-[#FFFDF7]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-300 border-2 border-slate-900 flex items-center justify-center text-slate-900 shadow-[2.5px_2.5px_0px_#0f172a] transition-transform hover:rotate-6">
            <Wallet className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">
              FinanceTracker
            </h1>
            <span className="text-[11px] font-bold text-amber-700 font-mono tracking-wide mt-1 block">
              Pocket Wealth 🪙
            </span>
          </div>
        </div>
        {isOpenMobile && (
          <button
            onClick={onCloseMobile}
            className="text-slate-700 hover:text-slate-950 p-1.5 rounded-lg border-2 border-slate-900 bg-slate-100 hover:bg-slate-200 lg:hidden shadow-[1.5px_1.5px_0px_#0f172a]"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Nav items list */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-1 text-[11px] font-black text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-300 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] translate-x-0.5'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/90 border-2 border-transparent hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-[1px_1px_0px_#0f172a] ${
                    isActive ? 'bg-white text-slate-950' : 'bg-rose-400 text-slate-950'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User profile & Logout */}
      <div className="p-3 border-t-2 border-slate-900 bg-[#FFFDF7]">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#0f172a]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-cyan-300 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 border-2 border-slate-900 shadow-[1px_1px_0px_#0f172a]">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 truncate">{profile.name}</div>
              <div className="text-[10px] font-medium text-slate-500 truncate">{profile.email}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-1.5 text-slate-700 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border-2 border-slate-900 rounded-lg transition-transform hover:scale-105 active:scale-95 ml-1 shrink-0 shadow-[1.5px_1.5px_0px_#0f172a] cursor-pointer"
            aria-label="Logout"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile drawer with backdrop */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex z-10 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
