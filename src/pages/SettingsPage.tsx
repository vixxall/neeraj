import React, { useState } from 'react';
import {
  User,
  Settings as SettingsIcon,
  Bell,
  Database,
  Download,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Sparkles,
  Save,
} from 'lucide-react';
import { UserProfile } from '../types/finance';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface SettingsPageProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => Promise<boolean>;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onLoadDemoData: () => Promise<boolean>;
  onClearData: () => Promise<boolean>;
  onResetApp: () => Promise<boolean>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  profile,
  onSaveProfile,
  onExportJSON,
  onExportCSV,
  onLoadDemoData,
  onClearData,
  onResetApp,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);

  // Confirmation dialog states
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await onSaveProfile(formData)) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Application Settings</h2>
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-200 text-slate-900 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]">
            Preferences
          </span>
        </div>
        <p className="text-xs font-bold text-slate-500 mt-1">
          Manage your account profile, currency preferences, notification thresholds, and data lifecycle
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="cartoon-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-slate-100">
            <div className="p-1.5 rounded-xl bg-blue-200 border-2 border-slate-900 text-slate-900 shadow-[1px_1px_0px_#0f172a]">
              <User className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-sm font-black text-slate-900">User Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="cartoon-input w-full px-3 py-2 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="cartoon-input w-full px-3 py-2 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">Preferred Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="cartoon-input w-full px-3 py-2 text-xs font-bold text-slate-900"
              >
                <option value="₹">₹ - Indian Rupee (INR)</option>
                <option value="$">$ - US Dollar (USD)</option>
                <option value="€">€ - Euro (EUR)</option>
                <option value="£">£ - British Pound (GBP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                Monthly Income Target
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xs">
                  {formData.currency}
                </span>
                <input
                  type="number"
                  value={formData.monthlyIncomeTarget || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthlyIncomeTarget: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="cartoon-input w-full pl-8 pr-3 py-2 text-xs font-bold text-slate-900 font-mono tabular-nums"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="cartoon-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-slate-100">
            <div className="p-1.5 rounded-xl bg-amber-200 border-2 border-slate-900 text-slate-900 shadow-[1px_1px_0px_#0f172a]">
              <SettingsIcon className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Display Preferences</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">Date Format</label>
              <select
                value={formData.dateFormat}
                onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value as any })}
                className="cartoon-input w-full px-3 py-2 text-xs font-bold text-slate-900"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 25/09/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/25/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-25)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">Theme Palette</label>
              <div className="p-2 text-xs font-black bg-amber-100/70 text-slate-900 rounded-xl border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]">
                🎨 Clean Cartoon UI (Playful & Simple)
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="cartoon-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-slate-100">
            <div className="p-1.5 rounded-xl bg-emerald-200 border-2 border-slate-900 text-slate-900 shadow-[1px_1px_0px_#0f172a]">
              <Bell className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Notification Alerts</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer select-none p-2.5 rounded-xl hover:bg-amber-50/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.notifications.budgetAlerts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      budgetAlerts: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 w-4 h-4 rounded border-2 border-slate-900 text-blue-600 focus:ring-0"
              />
              <div>
                <span className="text-xs font-black text-slate-900 block">
                  Budget Threshold Alerts
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Notify when department expenditure reaches 80% and 100% of defined limits
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none p-2.5 rounded-xl hover:bg-amber-50/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.notifications.savingsAlerts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      savingsAlerts: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 w-4 h-4 rounded border-2 border-slate-900 text-blue-600 focus:ring-0"
              />
              <div>
                <span className="text-xs font-black text-slate-900 block">
                  Savings Goal Milestones
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Alert when goals reach 75% or 100% target completion
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none p-2.5 rounded-xl hover:bg-amber-50/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.notifications.monthlySummary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      monthlySummary: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 w-4 h-4 rounded border-2 border-slate-900 text-blue-600 focus:ring-0"
              />
              <div>
                <span className="text-xs font-black text-slate-900 block">
                  Monthly Summary Diagnostics
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Generate periodic comparative analytics and spending velocity insights
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3">
          {isSaved && (
            <span className="text-xs font-black text-emerald-700 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-slate-900 shadow-[1px_1px_0px_#0f172a]">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Settings saved successfully!</span>
            </span>
          )}
          <button
            type="submit"
            className="cartoon-btn-primary flex items-center gap-1.5 px-5 py-2.5 text-xs"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Data Management Section */}
      <div className="cartoon-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-slate-100">
          <div className="p-1.5 rounded-xl bg-purple-200 border-2 border-slate-900 text-slate-900 shadow-[1px_1px_0px_#0f172a]">
            <Database className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h3 className="text-sm font-black text-slate-900">Data Management</h3>
        </div>

        <p className="text-xs font-bold text-slate-500">
          Financial records are stored in the application database and cached in this browser. You can back up,
          restore demo data, or clear your records anytime.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {/* Export JSON */}
          <button
            type="button"
            onClick={onExportJSON}
            className="cartoon-card-sm p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <Download className="w-5 h-5 text-slate-700 mb-2 stroke-[2.5]" />
            <div className="text-xs font-black text-slate-900">Export All Data</div>
            <div className="text-[10px] font-bold text-slate-500 mt-0.5">Download JSON backup</div>
          </button>

          {/* Load Demo Data */}
          <button
            type="button"
            onClick={onLoadDemoData}
            className="cartoon-card-sm p-3.5 bg-blue-50/70 hover:bg-blue-100/70 transition-colors text-left cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 text-blue-700 mb-2 stroke-[2.5]" />
            <div className="text-xs font-black text-blue-950">Load Demo Data</div>
            <div className="text-[10px] font-bold text-blue-700 mt-0.5">Restore 23 records</div>
          </button>

          {/* Clear Transactions */}
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="cartoon-card-sm p-3.5 hover:bg-amber-50/70 transition-colors text-left cursor-pointer"
          >
            <Trash2 className="w-5 h-5 text-amber-700 mb-2 stroke-[2.5]" />
            <div className="text-xs font-black text-slate-900">Clear Records</div>
            <div className="text-[10px] font-bold text-slate-500 mt-0.5">Wipe transactions, budgets & goals</div>
          </button>

          {/* Reset App */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="cartoon-card-sm p-3.5 bg-rose-50/80 hover:bg-rose-100/80 transition-colors text-left cursor-pointer"
          >
            <Trash2 className="w-5 h-5 text-rose-700 mb-2 stroke-[2.5]" />
            <div className="text-xs font-black text-rose-950">Restore Demo Records</div>
            <div className="text-[10px] font-bold text-rose-700 mt-0.5">Replace current records with sample data</div>
          </button>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={onClearData}
        title="Clear All Financial Records?"
        message="This will delete all transactions, category budgets, and savings goals for your account. You can restore sample records anytime using 'Load Demo Data'."
        confirmText="Clear Data"
        isDestructive={true}
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={onResetApp}
        title="Restore Demo Records?"
        message="This replaces your current transactions, budgets, and savings goals with the sample dataset. Your account profile and preferences will remain unchanged."
        confirmText="Restore Demo Data"
        isDestructive={true}
      />
    </div>
  );
};
