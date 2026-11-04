import React, { useState, useEffect } from 'react';
import { Budget, ExpenseCategory } from '../../types/finance';
import { Modal } from '../common/Modal';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id' | 'createdAt'> & { id?: string }) => void;
  initialBudget?: Budget | null;
  existingCategories?: ExpenseCategory[];
  currency?: string;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Rent',
  'Travel',
  'Entertainment',
  'Shopping',
  'Bills',
  'Healthcare',
  'Education',
  'Other',
];

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBudget,
  currency = '₹',
}) => {
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [limit, setLimit] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialBudget) {
      setCategory(initialBudget.category);
      setLimit(initialBudget.monthlyLimit.toString());
    } else {
      setCategory('Food');
      setLimit('');
    }
    setError('');
  }, [initialBudget, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limit);
    if (!limit || isNaN(numLimit) || numLimit <= 0) {
      setError('Please enter a valid monthly budget amount greater than 0');
      return;
    }

    onSave({
      ...(initialBudget?.id ? { id: initialBudget.id } : {}),
      category,
      monthlyLimit: numLimit,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialBudget ? 'Edit Monthly Budget' : 'Set Category Budget'}
      subtitle="Define spending threshold to receive automated alerts"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-black text-slate-900 mb-1">Expense Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            disabled={!!initialBudget}
            className="cartoon-input w-full px-3 py-2 text-sm font-bold disabled:bg-slate-100 disabled:text-slate-500"
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-900 mb-1">
            Monthly Limit ({currency}) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 font-black text-sm">
              {currency}
            </span>
            <input
              type="number"
              min="1"
              step="any"
              placeholder="e.g. 8000"
              value={limit}
              onChange={(e) => {
                setLimit(e.target.value);
                if (error) setError('');
              }}
              className="cartoon-input w-full pl-8 pr-3 py-2 text-sm font-bold font-mono tabular-nums"
            />
          </div>
          {error && <p className="text-xs text-rose-600 font-bold mt-1">{error}</p>}
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
            {initialBudget ? 'Update Budget' : 'Save Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
