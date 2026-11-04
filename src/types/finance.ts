export type TransactionType = 'income' | 'expense';

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Business'
  | 'Investment'
  | 'Other Income';

export type ExpenseCategory =
  | 'Rent'
  | 'Food'
  | 'Travel'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Healthcare'
  | 'Education'
  | 'Other';

export type Category = IncomeCategory | ExpenseCategory;

export type PaymentMethod =
  | 'UPI'
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Other';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: Category;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  month?: string; // Optional YYYY-MM; if omitted applies generally
  createdAt: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category?: string;
  notes?: string;
  createdAt: number;
}

export interface UserProfile {
  name: string;
  email: string;
  currency: string; // e.g. '₹', '$', '€', '£'
  monthlyIncomeTarget?: number;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  notifications: {
    budgetAlerts: boolean;
    savingsAlerts: boolean;
    monthlySummary: boolean;
  };
}

export interface AlertItem {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  message: string;
  category?: string;
  timestamp: string;
  actionUrl?: string;
}

export interface InsightItem {
  id: string;
  title: string;
  description: string;
  impact: 'positive' | 'warning' | 'neutral';
  recommendation?: string;
}

export type PageId =
  | 'welcome'
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'goals'
  | 'analytics'
  | 'reports'
  | 'insights'
  | 'settings';
