import React, { useState, useEffect } from 'react';
import { SavingsGoal } from '../../types/finance';
import { Modal } from '../common/Modal';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<SavingsGoal, 'id' | 'createdAt'> & { id?: string }) => void;
  initialGoal?: SavingsGoal | null;
  currency?: string;
}

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGoal,
  currency = '₹',
}) => {
  const [name, setName] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [currentAmount, setCurrentAmount] = useState<string>('0');
  const [targetDate, setTargetDate] = useState<string>('');
  const [category, setCategory] = useState<string>('General');
  const [notes, setNotes] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialGoal) {
      setName(initialGoal.name);
      setTargetAmount(initialGoal.targetAmount.toString());
      setCurrentAmount(initialGoal.currentAmount.toString());
      setTargetDate(initialGoal.targetDate);
      setCategory(initialGoal.category || 'General');
      setNotes(initialGoal.notes || '');
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      // Default target date: 6 months ahead
      const future = new Date();
      future.setMonth(future.getMonth() + 6);
      setTargetDate(future.toISOString().split('T')[0]);
      setCategory('General');
      setNotes('');
    }
    setErrors({});
  }, [initialGoal, isOpen]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Goal name is required';
    }

    const targetNum = parseFloat(targetAmount);
    if (!targetAmount || isNaN(targetNum) || targetNum <= 0) {
      errs.targetAmount = 'Target amount must be greater than zero';
    }

    const currentNum = parseFloat(currentAmount);
    if (isNaN(currentNum) || currentNum < 0) {
      errs.currentAmount = 'Current saved amount cannot be negative';
    }

    if (!targetDate) {
      errs.targetDate = 'Target date is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...(initialGoal?.id ? { id: initialGoal.id } : {}),
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate,
      category,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
      subtitle="Track your progress towards high-value aspirations"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-black text-slate-900 mb-1">
            Goal Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. New Laptop, Emergency Fund, Vacation"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            className={`cartoon-input w-full px-3 py-2 text-sm font-bold ${
              errors.name ? 'border-rose-500' : ''
            }`}
          />
          {errors.name && <p className="text-xs text-rose-600 font-bold mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-black text-slate-900 mb-1">
              Target Amount ({currency}) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 font-black text-sm">
                {currency}
              </span>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="75000"
                value={targetAmount}
                onChange={(e) => {
                  setTargetAmount(e.target.value);
                  if (errors.targetAmount) setErrors((prev) => ({ ...prev, targetAmount: '' }));
                }}
                className={`cartoon-input w-full pl-8 pr-3 py-2 text-sm font-bold font-mono tabular-nums ${
                  errors.targetAmount ? 'border-rose-500' : ''
                }`}
              />
            </div>
            {errors.targetAmount && <p className="text-xs text-rose-600 font-bold mt-1">{errors.targetAmount}</p>}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 mb-1">
              Currently Saved ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 font-black text-sm">
                {currency}
              </span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => {
                  setCurrentAmount(e.target.value);
                  if (errors.currentAmount) setErrors((prev) => ({ ...prev, currentAmount: '' }));
                }}
                className="cartoon-input w-full pl-8 pr-3 py-2 text-sm font-bold font-mono tabular-nums"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-black text-slate-900 mb-1">
              Target Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => {
                setTargetDate(e.target.value);
                if (errors.targetDate) setErrors((prev) => ({ ...prev, targetDate: '' }));
              }}
              className={`cartoon-input w-full px-3 py-2 text-sm font-bold ${
                errors.targetDate ? 'border-rose-500' : ''
              }`}
            />
            {errors.targetDate && <p className="text-xs text-rose-600 font-bold mt-1">{errors.targetDate}</p>}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 mb-1">Category / Tag</label>
            <input
              type="text"
              placeholder="e.g. Electronics, Safety Net, Travel"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="cartoon-input w-full px-3 py-2 text-sm font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-900 mb-1">
            Notes <span className="text-slate-400 font-bold">(Optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Plan or purpose details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="cartoon-input w-full px-3 py-2 text-sm font-bold resize-none"
          />
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
            className="cartoon-btn-primary px-5 py-2 text-xs"
          >
            {initialGoal ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
