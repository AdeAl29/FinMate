"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/hooks/use-i18n";
import { apiGet, apiSend } from "@/lib/client-api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionDTO } from "@/types";

type TransactionPayload = {
  transaction: TransactionDTO;
};

export default function TransactionDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();
  const [transaction, setTransaction] = useState<TransactionDTO | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function loadTransaction() {
      try {
        const payload = await apiGet<TransactionPayload>(`/api/transactions/${params.id}`);
        setTransaction(payload.transaction);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load transaction details");
      } finally {
        setFetching(false);
      }
    }

    if (params.id) {
      void loadTransaction();
    }
  }, [params.id]);

  async function deleteTransaction() {
    const confirmed = window.confirm("Delete this transaction?");
    if (!confirmed) return;

    try {
      await apiSend(`/api/transactions/${params.id}`, "DELETE");
      toast.success("Transaction deleted");
      router.push("/transactions");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete transaction");
    }
  }

  if (fetching || !transaction) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <PageContainer className="space-y-4">
      <div>
        <Link
          href="/transactions"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
          {t("transaction_details")}
        </h1>
      </div>

      <Card className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">Title</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{transaction.title}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">Amount</p>
          <p
            className={`text-base font-semibold ${
              transaction.type === "INCOME"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {transaction.type === "INCOME" ? "+" : "-"}
            {formatCurrency(transaction.amount, user?.currency || "USD")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Category</p>
            <p className="text-sm text-slate-800 dark:text-slate-100">{transaction.category}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Type</p>
            <p className="text-sm text-slate-800 dark:text-slate-100">
              {transaction.type === "INCOME" ? "Income" : "Expense"}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">Date</p>
          <p className="text-sm text-slate-800 dark:text-slate-100">{formatDate(transaction.date)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">Notes</p>
          <p className="text-sm text-slate-800 dark:text-slate-100">
            {transaction.notes || "No notes"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/transactions/${transaction.id}/edit`} className="w-full">
            <Button fullWidth variant="secondary">
              <Pencil className="mr-2 h-4 w-4" />
              {t("edit")}
            </Button>
          </Link>
          <Button className="w-full" variant="danger" onClick={deleteTransaction}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t("delete")}
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}
