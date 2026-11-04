import React from 'react';
import { Transaction } from '../../types/finance';
import { Modal } from '../common/Modal';
import { formatCurrency, CATEGORY_COLORS } from '../../utils/financeCalculations';
import { Edit2, Trash2, Calendar, Tag, CreditCard, FileText } from 'lucide-react';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  currency?: string;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transaction,
  currency = '₹',
  onEdit,
  onDelete,
}) => {
  if (!transaction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Details"
      subtitle={`ID: ${transaction.id}`}
      maxWidth="sm"
    >
      <div className="space-y-4 text-xs">
        {/* Large Amount banner */}
        <div
          className={`p-4 rounded-2xl border-2 border-slate-900 flex flex-col items-center justify-center text-center shadow-[3px_3px_0px_#0f172a] ${
            transaction.type === 'income'
              ? 'bg-[#ECFDF5] text-slate-900'
              : 'bg-[#FFF1F2] text-slate-900'
          }`}
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
            {transaction.type === 'income' ? 'Income Deposit' : 'Expense Outflow'}
          </span>
          <span
            className={`text-2xl font-black font-mono tabular-nums mt-1 ${
              transaction.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(transaction.amount, currency)}
          </span>
        </div>

        {/* Details List */}
        <div className="space-y-2.5 divide-y-2 divide-slate-100">
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500 font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />
              <span>Date</span>
            </span>
            <span className="font-mono tabular-nums font-black text-slate-900">
              {transaction.date}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-slate-500 font-bold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />
              <span>Category</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full border border-slate-900 shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[transaction.category] || '#3B82F6' }}
              />
              <span className="font-black text-slate-900">{transaction.category}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-slate-500 font-bold flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />
              <span>Payment Channel</span>
            </span>
            <span className="font-mono font-bold text-slate-800 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300">
              {transaction.paymentMethod}
            </span>
          </div>

          <div className="pt-2">
            <span className="text-slate-500 font-bold block mb-1">Description</span>
            <div className="p-3 bg-amber-50/70 border-2 border-slate-900 rounded-xl text-slate-900 font-black shadow-[1.5px_1.5px_0px_#0f172a]">
              {transaction.description}
            </div>
          </div>

          {transaction.notes && (
            <div className="pt-2">
              <span className="text-slate-500 font-bold flex items-center gap-1 mb-1">
                <FileText className="w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />
                <span>Notes & Remarks</span>
              </span>
              <div className="p-3 bg-slate-50 border-2 border-slate-900 rounded-xl text-slate-700 font-medium leading-relaxed shadow-[1.5px_1.5px_0px_#0f172a]">
                {transaction.notes}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-2 pt-4 border-t-2 border-slate-100">
          <button
            onClick={() => {
              onDelete(transaction.id);
              onClose();
            }}
            className="cartoon-btn-coral flex items-center gap-1.5 px-3 py-1.5 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(transaction);
              }}
              className="cartoon-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="cartoon-btn-primary px-4 py-1.5 text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
