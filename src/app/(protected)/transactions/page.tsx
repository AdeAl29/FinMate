"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TransactionItem } from "@/components/transactions/transaction-item";
import {
  TransactionFilters,
  TransactionsFilter,
} from "@/components/transactions/transactions-filter";
import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/hooks/use-i18n";
import { apiGet, apiSend } from "@/lib/client-api";
import { TransactionDTO } from "@/types";

type TransactionsPayload = {
  transactions: TransactionDTO[];
};

type CategoryPayload = {
  predefined: string[];
  custom: Array<{ id: string; name: string }>;
};

const INITIAL_FILTERS: TransactionFilters = {
  search: "",
  category: "All",
  type: "All",
  dateFrom: "",
  dateTo: "",
};

export default function TransactionsPage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>(INITIAL_FILTERS);
  const [fetching, setFetching] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.category !== "All") params.set("category", filters.category);
      if (filters.type !== "All") params.set("type", filters.type);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);

      const [transactionsPayload, categoryPayload] = await Promise.all([
        apiGet<TransactionsPayload>(`/api/transactions?${params.toString()}`),
        apiGet<CategoryPayload>("/api/categories"),
      ]);

      setTransactions(transactionsPayload.transactions);
      setCategories([
        ...categoryPayload.predefined,
        ...categoryPayload.custom.map((category) => category.name),
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load transactions");
    } finally {
      setFetching(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!loading && user) {
      void refreshData();
    }
  }, [loading, refreshData, user]);

  async function deleteTransaction(id: string) {
    const confirmed = window.confirm("Delete this transaction?");
    if (!confirmed) {
      return;
    }

    try {
      await apiSend(`/api/transactions/${id}`, "DELETE");
      toast.success("Transaction deleted");
      await refreshData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete transaction");
    }
  }

  const emptyMessage = useMemo(() => {
    if (fetching) return "";
    return t("no_transactions_filter");
  }, [fetching, t]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <PageContainer className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {t("transactions_title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            {t("manage_income_expenses")}
          </p>
        </div>
        <Link href="/transactions/new">
          <Button>{t("add")}</Button>
        </Link>
      </div>

      <TransactionsFilter categories={categories} value={filters} onChange={setFilters} />

      {fetching ? (
        <div className="flex min-h-40 items-center justify-center">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.length ? (
            transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                currency={user.currency}
                onDelete={deleteTransaction}
              />
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {emptyMessage || t("no_transactions_filter")}
            </p>
          )}
        </div>
      )}
    </PageContainer>
  );
}
