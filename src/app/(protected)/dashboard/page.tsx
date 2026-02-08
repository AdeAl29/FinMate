"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ExpensePieChart } from "@/components/charts/expense-pie-chart";
import { MonthlyLineChart } from "@/components/charts/monthly-line-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { GoalsSection } from "@/components/goals/goals-section";
import { PageContainer } from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/hooks/use-i18n";
import { apiGet, apiSend } from "@/lib/client-api";
import { formatCurrency } from "@/lib/utils";
import { DashboardSummary, SavingsGoalDTO } from "@/types";

type DashboardPayload = DashboardSummary;
type GoalsPayload = {
  goals: SavingsGoalDTO[];
};

type GoalInput = {
  title: string;
  targetAmount: string;
  savedAmount: string;
  targetDate: string;
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [goals, setGoals] = useState<SavingsGoalDTO[]>([]);
  const [fetching, setFetching] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [dashboardPayload, goalsPayload] = await Promise.all([
        apiGet<DashboardPayload>("/api/dashboard"),
        apiGet<GoalsPayload>("/api/goals"),
      ]);

      setDashboard(dashboardPayload);
      setGoals(goalsPayload.goals);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load dashboard");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      void refreshData();
    }
  }, [loading, refreshData, user]);

  async function createGoal(payload: GoalInput) {
    try {
      await apiSend("/api/goals", "POST", payload);
      toast.success("Savings goal created");
      await refreshData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create goal");
    }
  }

  async function updateGoal(id: string, payload: GoalInput) {
    try {
      await apiSend(`/api/goals/${id}`, "PATCH", payload);
      toast.success("Savings goal updated");
      await refreshData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update goal");
    }
  }

  async function deleteGoal(id: string) {
    try {
      await apiSend(`/api/goals/${id}`, "DELETE");
      toast.success("Savings goal deleted");
      await refreshData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete goal");
    }
  }

  if (loading || fetching || !dashboard || !user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <PageContainer className="space-y-4">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          {t("hello")}, {user.username}
        </p>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {t("dashboard_title")}
        </h1>
      </div>

      <SummaryCards
        currency={user.currency}
        totalBalance={dashboard.totalBalance}
        totalIncome={dashboard.totalIncome}
        totalExpense={dashboard.totalExpense}
      />

      <Card>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("monthly_financial_summary")}
        </h3>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-slate-100 p-2 text-center dark:bg-slate-800">
            <p className="text-[11px] text-slate-500 dark:text-slate-300">{t("income")}</p>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(dashboard.monthlyIncome, user.currency)}
            </p>
          </div>
          <div className="rounded-xl bg-slate-100 p-2 text-center dark:bg-slate-800">
            <p className="text-[11px] text-slate-500 dark:text-slate-300">{t("expense")}</p>
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              {formatCurrency(dashboard.monthlyExpense, user.currency)}
            </p>
          </div>
          <div className="rounded-xl bg-slate-100 p-2 text-center dark:bg-slate-800">
            <p className="text-[11px] text-slate-500 dark:text-slate-300">{t("net")}</p>
            <p className="text-sm font-semibold text-sky-600 dark:text-sky-400">
              {formatCurrency(dashboard.monthlyIncome - dashboard.monthlyExpense, user.currency)}
            </p>
          </div>
        </div>
      </Card>

      <ExpensePieChart data={dashboard.expenseByCategory} />
      <MonthlyLineChart data={dashboard.monthlyTrend} />
      <RecentTransactions items={dashboard.recentTransactions} currency={user.currency} />
      <GoalsSection
        goals={goals}
        currency={user.currency}
        onCreate={createGoal}
        onUpdate={updateGoal}
        onDelete={deleteGoal}
      />
    </PageContainer>
  );
}
