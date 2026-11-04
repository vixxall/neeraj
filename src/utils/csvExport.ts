import { Transaction, Budget, SavingsGoal, UserProfile } from '../types/finance';
import { formatCurrency } from './financeCalculations';

export function exportTransactionsToCSV(transactions: Transaction[], filename: string = 'transactions_export.csv') {
  const headers = ['Date', 'Category', 'Description', 'Type', 'Amount', 'Payment Method', 'Notes'];

  const rows = transactions.map((t) => [
    `"${t.date}"`,
    `"${t.category}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${t.type.toUpperCase()}"`,
    t.amount,
    `"${t.paymentMethod}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function exportFinancialReportCSV(
  reportTitle: string,
  period: string,
  summary: {
    totalIncome: number;
    totalExpense: number;
    totalSavings: number;
    savingsRate: number;
  },
  categoryBreakdown: { category: string; amount: number; percentage: number }[],
  budgets: { category: string; limit: number; spent: number; remaining: number }[],
  goals: SavingsGoal[],
  currency: string = '₹'
) {
  const lines: string[] = [];

  lines.push(`"PERSONAL FINANCE REPORT"`);
  lines.push(`"Report Type","${reportTitle}"`);
  lines.push(`"Period","${period}"`);
  lines.push(`"Generated At","${new Date().toLocaleString()}"`);
  lines.push('');

  lines.push('"EXECUTIVE KPI SUMMARY"');
  lines.push('"Metric","Value"');
  lines.push(`"Total Income","${summary.totalIncome}"`);
  lines.push(`"Total Expenses","${summary.totalExpense}"`);
  lines.push(`"Total Savings","${summary.totalSavings}"`);
  lines.push(`"Savings Rate","${summary.savingsRate}%"`);
  lines.push('');

  lines.push('"CATEGORY-WISE EXPENSES"');
  lines.push('"Category","Amount","Share (%)"');
  categoryBreakdown.forEach((c) => {
    lines.push(`"${c.category}","${c.amount}","${c.percentage}%"`);
  });
  lines.push('');

  lines.push('"MONTHLY BUDGET UTILIZATION"');
  lines.push('"Category","Monthly Limit","Spent","Remaining","% Used"');
  budgets.forEach((b) => {
    const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
    lines.push(`"${b.category}","${b.limit}","${b.spent}","${b.remaining}","${pct}%"`);
  });
  lines.push('');

  lines.push('"SAVINGS GOALS PROGRESS"');
  lines.push('"Goal Name","Target Amount","Current Saved","Remaining","Progress (%)","Target Date"');
  goals.forEach((g) => {
    const rem = Math.max(0, g.targetAmount - g.currentAmount);
    const progress = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
    lines.push(`"${g.name}","${g.targetAmount}","${g.currentAmount}","${rem}","${progress}%","${g.targetDate}"`);
  });

  const content = lines.join('\n');
  const safeFilename = `${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${period}.csv`;
  downloadBlob(content, safeFilename, 'text/csv;charset=utf-8;');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
