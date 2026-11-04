import { AlertItem, Budget, ExpenseCategory, InsightItem, SavingsGoal, Transaction } from '../types/finance';

export function formatCurrency(amount: number, currency: string = '₹'): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format with Indian numbering system for ₹ or standard commas
  const formatted = absAmount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });

  return `${isNegative ? '-' : ''}${currency}${formatted}`;
}

export function getCurrentMonthKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getPreviousMonthKey(d: Date = new Date()): string {
  const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  return getCurrentMonthKey(prev);
}

export interface KPIStats {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  savingsRate: number;
  // Month-over-month comparisons (current month vs previous month)
  currentMonthIncome: number;
  previousMonthIncome: number;
  incomeMoMChangePercent: number;
  currentMonthExpense: number;
  previousMonthExpense: number;
  expenseMoMChangePercent: number;
  currentMonthSavings: number;
  previousMonthSavings: number;
  currentMonthSavingsRate: number;
}

export function calculateKPIStats(transactions: Transaction[]): KPIStats {
  const currentMonth = getCurrentMonthKey();
  const prevMonth = getPreviousMonthKey();

  let totalIncome = 0;
  let totalExpense = 0;
  let currentMonthIncome = 0;
  let previousMonthIncome = 0;
  let currentMonthExpense = 0;
  let previousMonthExpense = 0;

  for (const t of transactions) {
    const monthKey = t.date.slice(0, 7);
    if (t.type === 'income') {
      totalIncome += t.amount;
      if (monthKey === currentMonth) currentMonthIncome += t.amount;
      if (monthKey === prevMonth) previousMonthIncome += t.amount;
    } else {
      totalExpense += t.amount;
      if (monthKey === currentMonth) currentMonthExpense += t.amount;
      if (monthKey === prevMonth) previousMonthExpense += t.amount;
    }
  }

  const totalSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, (totalSavings / totalIncome) * 100) : 0;

  const currentMonthSavings = currentMonthIncome - currentMonthExpense;
  const previousMonthSavings = previousMonthIncome - previousMonthExpense;
  const currentMonthSavingsRate = currentMonthIncome > 0 ? (currentMonthSavings / currentMonthIncome) * 100 : 0;

  // Percentage change MoM: ((current - prev) / prev) * 100
  const incomeMoMChangePercent =
    previousMonthIncome > 0
      ? ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100
      : currentMonthIncome > 0
      ? 100
      : 0;

  const expenseMoMChangePercent =
    previousMonthExpense > 0
      ? ((currentMonthExpense - previousMonthExpense) / previousMonthExpense) * 100
      : currentMonthExpense > 0
      ? 100
      : 0;

  return {
    totalIncome,
    totalExpense,
    totalSavings,
    savingsRate: Math.round(savingsRate * 10) / 10,
    currentMonthIncome,
    previousMonthIncome,
    incomeMoMChangePercent: Math.round(incomeMoMChangePercent * 10) / 10,
    currentMonthExpense,
    previousMonthExpense,
    expenseMoMChangePercent: Math.round(expenseMoMChangePercent * 10) / 10,
    currentMonthSavings,
    previousMonthSavings,
    currentMonthSavingsRate: Math.round(currentMonthSavingsRate * 10) / 10,
  };
}

export interface CategorySpending {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  color: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Rent: '#3B82F6',         // Blue
  Food: '#10B981',         // Emerald Green
  Travel: '#F59E0B',       // Amber
  Entertainment: '#8B5CF6',// Violet
  Shopping: '#EC4899',     // Pink
  Bills: '#06B6D4',        // Cyan
  Healthcare: '#EF4444',   // Red
  Education: '#6366F1',    // Indigo
  Other: '#64748B',        // Slate
  Salary: '#10B981',
  Freelance: '#3B82F6',
  Business: '#8B5CF6',
  Investment: '#F59E0B',
  'Other Income': '#06B6D4',
};

export function getCategorySpending(
  transactions: Transaction[],
  monthFilter?: string
): CategorySpending[] {
  const expenseMap = new Map<ExpenseCategory, number>();
  let totalCategoryExpense = 0;

  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    if (monthFilter && !t.date.startsWith(monthFilter)) continue;

    const cat = t.category as ExpenseCategory;
    const existing = expenseMap.get(cat) || 0;
    expenseMap.set(cat, existing + t.amount);
    totalCategoryExpense += t.amount;
  }

  // If no transactions, provide default project reference distribution for illustration
  if (totalCategoryExpense === 0 && !monthFilter) {
    return [
      { category: 'Rent', amount: 15000, percentage: 32, color: CATEGORY_COLORS.Rent },
      { category: 'Food', amount: 9800, percentage: 21, color: CATEGORY_COLORS.Food },
      { category: 'Travel', amount: 6500, percentage: 14, color: CATEGORY_COLORS.Travel },
      { category: 'Entertainment', amount: 5100, percentage: 11, color: CATEGORY_COLORS.Entertainment },
      { category: 'Shopping', amount: 6000, percentage: 13, color: CATEGORY_COLORS.Shopping },
      { category: 'Other', amount: 4200, percentage: 9, color: CATEGORY_COLORS.Other },
    ];
  }

  const result: CategorySpending[] = [];
  expenseMap.forEach((amount, category) => {
    const percentage = totalCategoryExpense > 0 ? (amount / totalCategoryExpense) * 100 : 0;
    result.push({
      category,
      amount,
      percentage: Math.round(percentage * 10) / 10,
      color: CATEGORY_COLORS[category] || '#64748B',
    });
  });

  return result.sort((a, b) => b.amount - a.amount);
}

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: 'normal' | 'warning' | 'exceeded';
}

export function calculateBudgetStatuses(
  budgets: Budget[],
  transactions: Transaction[],
  monthKey: string = getCurrentMonthKey()
): BudgetStatus[] {
  const spendingMap = new Map<ExpenseCategory, number>();

  for (const t of transactions) {
    if (t.type === 'expense' && t.date.startsWith(monthKey)) {
      const cat = t.category as ExpenseCategory;
      spendingMap.set(cat, (spendingMap.get(cat) || 0) + t.amount);
    }
  }

  return budgets.map((budget) => {
    const spent = spendingMap.get(budget.category) || 0;
    const remaining = budget.monthlyLimit - spent;
    const percentageUsed = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;

    let status: 'normal' | 'warning' | 'exceeded' = 'normal';
    if (percentageUsed >= 100) {
      status = 'exceeded';
    } else if (percentageUsed >= 80) {
      status = 'warning';
    }

    return {
      budget,
      spent,
      remaining,
      percentageUsed: Math.round(percentageUsed * 10) / 10,
      status,
    };
  });
}

export interface MonthlyTrendData {
  monthKey: string;
  monthLabel: string;
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
}

export function getMonthlyTrends(
  transactions: Transaction[],
  monthsCount: number = 6
): MonthlyTrendData[] {
  const result: MonthlyTrendData[] = [];
  const now = new Date();

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });

    let income = 0;
    let expense = 0;

    for (const t of transactions) {
      if (t.date.startsWith(monthKey)) {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
      }
    }

    const savings = income - expense;
    const savingsRate = income > 0 ? Math.max(0, Math.round((savings / income) * 100)) : 0;

    result.push({
      monthKey,
      monthLabel,
      income,
      expense,
      savings,
      savingsRate,
    });
  }

  return result;
}

export function getTrendsForTimeRange(
  transactions: Transaction[],
  timeRange: '1M' | '6M' | '12M'
): MonthlyTrendData[] {
  if (timeRange === '1M') {
    // Generate 4 weekly intervals for current month or latest transaction month
    const now = new Date();
    let currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const hasCurrentTx = transactions.some((t) => t.date.startsWith(currentMonthKey));
    if (!hasCurrentTx && transactions.length > 0) {
      const sortedMonths = [...transactions]
        .map((t) => t.date.slice(0, 7))
        .filter(Boolean)
        .sort()
        .reverse();
      if (sortedMonths[0]) {
        currentMonthKey = sortedMonths[0];
      }
    }

    const weeks = [
      { key: 'W1', label: 'Week 1 (1-7)', startDay: 1, endDay: 7 },
      { key: 'W2', label: 'Week 2 (8-14)', startDay: 8, endDay: 14 },
      { key: 'W3', label: 'Week 3 (15-21)', startDay: 15, endDay: 21 },
      { key: 'W4', label: 'Week 4 (22+)', startDay: 22, endDay: 31 },
    ];

    return weeks.map((w) => {
      let income = 0;
      let expense = 0;

      for (const t of transactions) {
        if (t.date.startsWith(currentMonthKey)) {
          const day = parseInt(t.date.slice(8, 10), 10);
          if (day >= w.startDay && day <= w.endDay) {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;
          }
        }
      }

      const savings = income - expense;
      const savingsRate = income > 0 ? Math.max(0, Math.round((savings / income) * 100)) : 0;

      return {
        monthKey: `${currentMonthKey}-${w.key}`,
        monthLabel: w.label,
        income,
        expense,
        savings,
        savingsRate,
      };
    });
  }

  const monthsCount = timeRange === '6M' ? 6 : 12;
  return getMonthlyTrends(transactions, monthsCount);
}

export function generateSmartAlerts(
  budgets: Budget[],
  transactions: Transaction[],
  goals: SavingsGoal[],
  kpis: KPIStats
): AlertItem[] {
  const alerts: AlertItem[] = [];
  const budgetStatuses = calculateBudgetStatuses(budgets, transactions);

  // 1. Budget warnings and overruns
  for (const bs of budgetStatuses) {
    if (bs.status === 'exceeded') {
      const overBy = Math.abs(bs.remaining);
      alerts.push({
        id: `alert-budget-exceeded-${bs.budget.id}`,
        type: 'danger',
        title: `Budget Exceeded: ${bs.budget.category}`,
        message: `You have exceeded your ${bs.budget.category} budget by ${formatCurrency(overBy)} (${bs.percentageUsed}% used).`,
        category: bs.budget.category,
        timestamp: 'Active this month',
      });
    } else if (bs.status === 'warning') {
      alerts.push({
        id: `alert-budget-warn-${bs.budget.id}`,
        type: 'warning',
        title: `Budget Warning: ${bs.budget.category}`,
        message: `${bs.budget.category} spending has reached ${bs.percentageUsed}% of your monthly limit (${formatCurrency(bs.remaining)} remaining).`,
        category: bs.budget.category,
        timestamp: 'Active this month',
      });
    }
  }

  // 2. Month-over-month expense increase alert
  if (kpis.expenseMoMChangePercent > 10 && kpis.previousMonthExpense > 0) {
    alerts.push({
      id: 'alert-mom-expense-high',
      type: 'warning',
      title: 'Higher Monthly Spending',
      message: `Your expenses are ${kpis.expenseMoMChangePercent}% higher than last month (${formatCurrency(kpis.currentMonthExpense)} vs ${formatCurrency(kpis.previousMonthExpense)}).`,
      timestamp: 'Month-over-Month',
    });
  }

  // 3. Positive savings rate alert
  if (kpis.currentMonthSavingsRate >= 20) {
    alerts.push({
      id: 'alert-high-savings-rate',
      type: 'success',
      title: 'Strong Savings Discipline',
      message: `You have saved ${kpis.currentMonthSavingsRate}% of your income this month (${formatCurrency(kpis.currentMonthSavings)}). Great habit!`,
      timestamp: 'Current Month',
    });
  }

  // 4. Savings Goal alerts
  for (const g of goals) {
    const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
    if (progress >= 100) {
      alerts.push({
        id: `alert-goal-done-${g.id}`,
        type: 'success',
        title: `Goal Achieved: ${g.name}`,
        message: `Congratulations! You reached 100% of your target for "${g.name}" (${formatCurrency(g.currentAmount)}).`,
        timestamp: 'Goal Completed',
      });
    } else if (progress >= 75) {
      alerts.push({
        id: `alert-goal-near-${g.id}`,
        type: 'info',
        title: `Goal Milestone: ${g.name}`,
        message: `Your savings goal "${g.name}" is ${Math.round(progress)}% complete. Only ${formatCurrency(g.targetAmount - g.currentAmount)} left!`,
        timestamp: 'Milestone',
      });
    }
  }

  return alerts;
}

export function generateFinancialInsights(
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[],
  kpis: KPIStats
): InsightItem[] {
  const insights: InsightItem[] = [];
  const currentMonthExpenses = getCategorySpending(transactions, getCurrentMonthKey());
  const prevMonthExpenses = getCategorySpending(transactions, getPreviousMonthKey());

  // 1. Highest spending category insight
  if (currentMonthExpenses.length > 0) {
    const top = currentMonthExpenses[0];
    insights.push({
      id: 'ins-top-spending',
      title: `${top.category} is your highest spending category`,
      description: `${top.category} accounts for ${formatCurrency(top.amount)} (${top.percentage}% of all your monthly expenses).`,
      impact: top.percentage > 35 ? 'warning' : 'neutral',
      recommendation:
        top.percentage > 35
          ? `Review recurring items in ${top.category} to identify optimization opportunities.`
          : 'Spending is reasonably diversified across categories.',
    });
  }

  // 2. Budget run-rate projection
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  if (dayOfMonth > 5 && kpis.currentMonthExpense > 0) {
    const projectedMonthlyExpense = (kpis.currentMonthExpense / dayOfMonth) * daysInMonth;
    const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);

    if (totalBudgetLimit > 0 && projectedMonthlyExpense > totalBudgetLimit) {
      insights.push({
        id: 'ins-budget-runrate',
        title: 'Projected Monthly Expenses May Exceed Budget',
        description: `If your current spending pace (${formatCurrency(Math.round(kpis.currentMonthExpense / dayOfMonth))}/day) continues, your monthly total will reach ~${formatCurrency(Math.round(projectedMonthlyExpense))}, exceeding your overall budget of ${formatCurrency(totalBudgetLimit)}.`,
        impact: 'warning',
        recommendation: 'Consider curtailing discretionary shopping and dining for the rest of this month.',
      });
    }
  }

  // 3. Category comparison: Entertainment / Discretionary
  const curEnt = currentMonthExpenses.find((c) => c.category === 'Entertainment')?.amount || 0;
  const prevEnt = prevMonthExpenses.find((c) => c.category === 'Entertainment')?.amount || 0;
  if (curEnt > prevEnt && prevEnt > 0) {
    const diff = curEnt - prevEnt;
    insights.push({
      id: 'ins-ent-spending',
      title: 'Discretionary Entertainment Spend Increased',
      description: `You spent ${formatCurrency(curEnt)} on entertainment this month compared to ${formatCurrency(prevEnt)} last month (+${formatCurrency(diff)}).`,
      impact: 'warning',
      recommendation: 'Keep an eye on weekend outings and subscription services.',
    });
  }

  // 4. Savings rate trend
  if (kpis.currentMonthSavingsRate > kpis.previousMonthIncome && kpis.currentMonthSavingsRate > 0) {
    insights.push({
      id: 'ins-savings-growth',
      title: 'Savings Rate Trend is Positive',
      description: `Your monthly savings rate stands at ${kpis.currentMonthSavingsRate}%, which reflects healthy cash retention after covering living expenses.`,
      impact: 'positive',
      recommendation: 'Automate transfer of surplus cash into dedicated savings goals or index funds.',
    });
  }

  // 5. Goal progress highlight
  const activeGoal = goals.find((g) => g.currentAmount < g.targetAmount && (g.currentAmount / g.targetAmount) >= 0.6);
  if (activeGoal) {
    const pct = Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100);
    insights.push({
      id: 'ins-goal-pace',
      title: `Close to Reaching "${activeGoal.name}"`,
      description: `You have reached ${pct}% of your target (${formatCurrency(activeGoal.currentAmount)} of ${formatCurrency(activeGoal.targetAmount)}). Target date is ${activeGoal.targetDate}.`,
      impact: 'positive',
      recommendation: `Allocating an extra ${formatCurrency(Math.round((activeGoal.targetAmount - activeGoal.currentAmount) / 2))} next month will complete this milestone early.`,
    });
  }

  // 6. Payment method preference
  const upiCount = transactions.filter((t) => t.paymentMethod === 'UPI').length;
  if (upiCount > 5) {
    insights.push({
      id: 'ins-payment-upi',
      title: 'UPI is Your Preferred Payment Channel',
      description: `${upiCount} transactions were paid via UPI this period, enabling instant real-time ledger tracking without credit card revolving debt.`,
      impact: 'neutral',
      recommendation: 'Continue using zero-interest payment methods for small daily expenses.',
    });
  }

  return insights;
}
