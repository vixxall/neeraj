import React, { useState, useEffect } from 'react';
import { Category, ExpenseCategory, IncomeCategory, PaymentMethod, Transaction, TransactionType } from '../../types/finance';
import { Modal } from '../common/Modal';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => Promise<boolean>;
  initialTransaction?: Transaction | null;
  defaultType?: TransactionType;
  currency?: string;
}

const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Other Income',
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Rent',
  'Food',
  'Travel',
  'Entertainment',
  'Shopping',
  'Bills',
  'Healthcare',
  'Education',
  'Other',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'Cash',
  'Other',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTransaction,
  defaultType = 'expense',
  currency = '₹',
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<Category>('Food');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setDate(initialTransaction.date);
      setCategory(initialTransaction.category);
      setDescription(initialTransaction.description);
      setAmount(initialTransaction.amount.toString());
      setPaymentMethod(initialTransaction.paymentMethod);
      setNotes(initialTransaction.notes || '');
    } else {
      setType(defaultType);
      setDate(new Date().toISOString().split('T')[0]);
      setCategory(defaultType === 'income' ? 'Salary' : 'Food');
      setDescription('');
      setAmount('');
      setPaymentMethod('UPI');
      setNotes('');
    }
    setErrors({});
  }, [initialTransaction, defaultType, isOpen]);

  // When type toggles, reset category to first valid option
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'income' ? 'Salary' : 'Food');
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: '' }));
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!date) {
      errs.date = 'Date is required';
    }

    if (!description.trim()) {
      errs.description = 'Description is required';
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      errs.amount = 'Valid amount is required';
    } else if (numAmount <= 0) {
      errs.amount = 'Amount must be greater than zero';
    }

    if (!category) {
      errs.category = 'Category is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const saved = await onSave({
      ...(initialTransaction?.id ? { id: initialTransaction.id } : {}),
      date,
      type,
      category,
      description: description.trim(),
      amount: parseFloat(amount),
      paymentMethod,
      notes: notes.trim() || undefined,
      });
      if (saved) onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const activeCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTransaction ? 'Edit Transaction' : 'Record Transaction'}
      subtitle={initialTransaction ? 'Update financial entry details' : 'Record an income or expense'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle Segmented Control */}
        <div>
          <label className="block text-xs font-black text-slate-900 mb-1.5">Transaction Type</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-amber-50 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-300 text-slate-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]'
                  : 'text-slate-600 hover:text-slate-900 font-bold'
              }`}
            >
              + Income
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-300 text-slate-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]'
                  : 'text-slate-600 hover:text-slate-900 font-bold'
              }`}
            >
              - Expense
            </button>
          </div>
        </div>

        {/* Amount & Date in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-black text-slate-900 mb-1">
              Amount ({currency}) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 font-black text-sm">
                {currency}
              </span>
              <input
                type="number"
                step="any"
                min="1"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
                }}
                className={`cartoon-input w-full pl-8 pr-3 py-2 text-sm font-bold font-mono tabular-nums ${
                  errors.amount ? 'border-rose-500' : ''
                }`}
              />
            </div>
            {errors.amount && <p className="text-xs text-rose-600 font-bold mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 mb-1">
              Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
              }}
              className={`cartoon-input w-full px-3 py-2 text-sm font-bold ${
                errors.date ? 'border-rose-500' : ''
              }`}
            />
            {errors.date && <p className="text-xs text-rose-600 font-bold mt-1">{errors.date}</p>}
          </div>
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-black text-slate-900 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="cartoon-input w-full px-3 py-2 text-sm font-bold"
            >
              {activeCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="cartoon-input w-full px-3 py-2 text-sm font-bold"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-black text-slate-900 mb-1">
            Description <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Grocery Supermarket, Freelance project"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            className={`cartoon-input w-full px-3 py-2 text-sm font-bold ${
              errors.description ? 'border-rose-500' : ''
            }`}
          />
          {errors.description && <p className="text-xs text-rose-600 font-bold mt-1">{errors.description}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-black text-slate-900 mb-1">
            Notes <span className="text-slate-400 font-bold">(Optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Additional context or remarks..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="cartoon-input w-full px-3 py-2 text-sm font-bold resize-none"
          />
        </div>

        {/* Actions */}
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
            className="cartoon-btn-primary px-5 py-2 text-xs disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : initialTransaction ? 'Save Changes' : 'Record Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
