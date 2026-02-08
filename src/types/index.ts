export type ApiError = {
  message: string;
  details?: unknown;
};

export type UserSession = {
  id: string;
  email: string;
  username: string;
  currency: string;
  language: "EN" | "ID";
  darkMode: boolean;
};

export type TransactionDTO = {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SavingsGoalDTO = {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  progress: number;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DashboardSummary = {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  monthlyIncome: number;
  monthlyExpense: number;
  recentTransactions: TransactionDTO[];
  expenseByCategory: Array<{ category: string; value: number }>;
  monthlyTrend: Array<{ month: string; expense: number; income: number }>;
};
