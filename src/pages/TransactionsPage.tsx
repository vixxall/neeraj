import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Sparkles,
} from 'lucide-react';
import {
  Category,
  PaymentMethod,
  Transaction,
  TransactionType,
  UserProfile,
} from '../types/finance';
import { formatCurrency, CATEGORY_COLORS } from '../utils/financeCalculations';
import { exportTransactionsToCSV } from '../utils/csvExport';

interface TransactionsPageProps {
  transactions: Transaction[];
  profile: UserProfile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddTransaction: () => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onViewDetails: (t: Transaction) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  profile,
  searchQuery,
  onSearchChange,
  onOpenAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onViewDetails,
}) => {
  // Filter States
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Sort State
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Extract unique categories & payment methods from actual transactions
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  }, [transactions]);

  const uniquePaymentMethods = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.paymentMethod));
    return Array.from(set).sort();
  }, [transactions]);

  // Filter & Sort Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesCat = t.category.toLowerCase().includes(q);
        const matchesAmt = t.amount.toString().includes(q);
        const matchesNotes = t.notes?.toLowerCase().includes(q) || false;
        if (!matchesDesc && !matchesCat && !matchesAmt && !matchesNotes) {
          return false;
        }
      }

      // Type Filter
      if (typeFilter !== 'all' && t.type !== typeFilter) {
        return false;
      }

      // Category Filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) {
        return false;
      }

      // Payment Filter
      if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) {
        return false;
      }

      // Date Range
      if (startDate && t.date < startDate) {
        return false;
      }
      if (endDate && t.date > endDate) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });
  }, [
    transactions,
    searchQuery,
    typeFilter,
    categoryFilter,
    paymentFilter,
    startDate,
    endDate,
    sortField,
    sortOrder,
  ]);

  // Pagination slice
  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExport = () => {
    exportTransactionsToCSV(filteredTransactions, `transactions_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleResetFilters = () => {
    onSearchChange('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setPaymentFilter('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    paymentFilter !== 'all' ||
    startDate ||
    endDate;

  const currency = profile.currency;

  return (
    <div className="space-y-6">
      {/* Top action header: Summary + Add + Export */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Transaction Ledger</h2>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-200 text-slate-900 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]">
              {filteredTransactions.length} entries
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Real-time filtered income, expense, and transfer records
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="cartoon-btn-secondary flex items-center gap-1.5 px-3.5 py-2 text-xs"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddTransaction}
            className="cartoon-btn-primary flex items-center gap-1.5 px-4 py-2 text-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Record Entry</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="cartoon-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
            <input
              type="text"
              placeholder="Search description, amount..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
              className="cartoon-input w-full pl-9 pr-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* Type Segmented Buttons */}
          <div className="flex items-center p-1 bg-amber-100/70 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a]">
            <button
              onClick={() => {
                setTypeFilter('all');
                setCurrentPage(1);
              }}
              className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${
                typeFilter === 'all'
                  ? 'bg-amber-300 text-slate-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setTypeFilter('income');
                setCurrentPage(1);
              }}
              className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${
                typeFilter === 'income'
                  ? 'bg-emerald-300 text-slate-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]'
                  : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => {
                setTypeFilter('expense');
                setCurrentPage(1);
              }}
              className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${
                typeFilter === 'expense'
                  ? 'bg-rose-300 text-slate-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]'
                  : 'text-slate-600 hover:text-rose-800'
              }`}
            >
              Expense
            </button>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="cartoon-input w-full px-3 py-2 text-xs font-bold text-slate-900"
            >
              <option value="all">All Categories ({uniqueCategories.length})</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Dropdown */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="cartoon-input w-full px-3 py-2 text-xs font-bold text-slate-900"
            >
              <option value="all">All Payment Methods</option>
              {uniquePaymentMethods.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range & Reset Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap font-bold text-slate-700">
            <span className="text-slate-500 font-black">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="cartoon-input px-2.5 py-1 text-slate-800 text-xs font-mono font-bold"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="cartoon-input px-2.5 py-1 text-slate-800 text-xs font-mono font-bold"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="cartoon-btn-secondary flex items-center gap-1.5 px-3 py-1 text-xs text-rose-600 hover:text-rose-700 ml-auto"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="cartoon-card p-0 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-14 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-slate-900 mx-auto mb-3 flex items-center justify-center text-slate-800 shadow-[2px_2px_0px_#0f172a]">
              <Receipt className="w-8 h-8 stroke-[2.5]" />
            </div>
            <p className="text-base font-black text-slate-900">No matching transactions found</p>
            <p className="text-xs font-bold text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, or record a new transaction to grow your personal ledger.
            </p>
            <button
              onClick={onOpenAddTransaction}
              className="cartoon-btn-primary mt-4 px-4 py-2 text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Transaction</span>
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFFDF7] border-b-2 border-slate-900 text-slate-800 font-black uppercase tracking-wider text-[11px]">
                  <tr>
                    <th
                      onClick={() => toggleSort('date')}
                      className="py-3.5 px-4 cursor-pointer hover:bg-amber-100/50 select-none whitespace-nowrap transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Date</span>
                        <ArrowUpDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Method</th>
                    <th
                      onClick={() => toggleSort('amount')}
                      className="py-3.5 px-4 text-right cursor-pointer hover:bg-amber-100/50 select-none whitespace-nowrap transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Amount</span>
                        <ArrowUpDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-4 text-slate-700 font-mono font-bold tabular-nums whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div>
                          <span className="block max-w-xs sm:max-w-md truncate">
                            {tx.description}
                          </span>
                          {tx.notes && (
                            <span className="text-[10px] text-slate-400 block truncate max-w-xs font-normal">
                              {tx.notes}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-800 whitespace-nowrap font-bold">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full border border-slate-900 shrink-0"
                            style={{ backgroundColor: CATEGORY_COLORS[tx.category] || '#3B82F6' }}
                          />
                          <span>{tx.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-black px-2 py-0.5 rounded-full border border-slate-900 text-[10px] ${
                            tx.type === 'income'
                              ? 'bg-emerald-200 text-emerald-950'
                              : 'bg-rose-200 text-rose-950'
                          }`}
                        >
                          {tx.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono tabular-nums font-black whitespace-nowrap text-sm ${
                          tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount, currency)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 text-slate-500">
                          <button
                            onClick={() => onViewDetails(tx)}
                            title="View details"
                            className="p-1.5 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Edit entry"
                            className="p-1.5 hover:text-slate-900 rounded-lg hover:bg-amber-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            title="Delete entry"
                            className="p-1.5 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t-2 border-slate-900 bg-[#FFFDF7] text-xs text-slate-600 font-bold">
                <div>
                  Page <span className="font-black text-slate-900">{currentPage}</span> of{' '}
                  <span className="font-black text-slate-900">{totalPages}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="cartoon-btn-secondary p-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="cartoon-btn-secondary p-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
