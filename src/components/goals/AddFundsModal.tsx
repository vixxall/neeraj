import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { SavingsGoal } from '../../types/finance';
import { Modal } from '../common/Modal';
import { formatCurrency } from '../../utils/financeCalculations';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  onAddFunds: (goalId: string, addedAmount: number) => Promise<boolean>;
  currency?: string;
}

export const AddFundsModal: React.FC<AddFundsModalProps> = ({
  isOpen,
  onClose,
  goal,
  onAddFunds,
  currency = '₹',
}) => {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  if (!goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setIsSaving(true);
    try {
      if (!await onAddFunds(goal.id, num)) return;
      if (goal.currentAmount + num >= goal.targetAmount) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (error) {
          console.error('Unable to render goal completion animation', error);
        }
      }
      setAmount('');
      setError('');
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Money: ${goal.name}`}
      subtitle={`Remaining to reach target: ${formatCurrency(remaining, currency)}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-black text-slate-900 mb-1.5">
            Deposit Amount ({currency}) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 font-black text-sm">
              {currency}
            </span>
            <input
              type="number"
              min="1"
              step="any"
              placeholder={remaining > 0 ? remaining.toString() : '5000'}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError('');
              }}
              className="cartoon-input w-full pl-8 pr-3 py-2 text-sm font-bold font-mono tabular-nums"
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-rose-600 font-bold mt-1">{error}</p>}
        </div>

        {/* Quick fill chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 font-bold mr-1">Quick add:</span>
          {[1000, 2500, 5000, 10000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset.toString())}
              className="cartoon-btn-yellow px-2.5 py-1 text-xs font-mono font-bold"
            >
              +{formatCurrency(preset, currency)}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="cartoon-btn-secondary px-4 py-2 text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="cartoon-btn-green px-5 py-2 text-xs disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : '+ Add to Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
