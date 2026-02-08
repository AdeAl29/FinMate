"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  TransactionForm,
  TransactionFormValues,
} from "@/components/transactions/transaction-form";
import { useI18n } from "@/hooks/use-i18n";
import { apiGet, apiSend } from "@/lib/client-api";
import { TransactionDTO } from "@/types";

type CategoryPayload = {
  predefined: string[];
  custom: Array<{ id: string; name: string }>;
};

type TransactionPayload = {
  transaction: TransactionDTO;
};

export default function EditTransactionPage() {
  const router = useRouter();
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const transactionId = params.id;
  const [categories, setCategories] = useState<string[]>([]);
  const [transaction, setTransaction] = useState<TransactionDTO | null>(null);
  const [fetching, setFetching] = useState(true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [categoryPayload, transactionPayload] = await Promise.all([
          apiGet<CategoryPayload>("/api/categories"),
          apiGet<TransactionPayload>(`/api/transactions/${transactionId}`),
        ]);

        setCategories([
          ...categoryPayload.predefined,
          ...categoryPayload.custom.map((item) => item.name),
        ]);
        setTransaction(transactionPayload.transaction);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load transaction");
      } finally {
        setFetching(false);
      }
    }

    if (transactionId) {
      void loadData();
    }
  }, [transactionId]);

  const initialValues = useMemo(() => {
    if (!transaction) {
      return undefined;
    }

    return {
      title: transaction.title,
      amount: String(transaction.amount),
      category: transaction.category,
      type: transaction.type,
      date: transaction.date.slice(0, 10),
      notes: transaction.notes || "",
    };
  }, [transaction]);

  async function submit(values: TransactionFormValues) {
    try {
      setPending(true);
      await apiSend(`/api/transactions/${transactionId}`, "PATCH", values);
      toast.success("Transaction updated");
      router.push("/transactions");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update transaction");
    } finally {
      setPending(false);
    }
  }

  async function deleteTransaction() {
    const confirmed = window.confirm("Delete this transaction?");
    if (!confirmed) {
      return;
    }

    try {
      await apiSend(`/api/transactions/${transactionId}`, "DELETE");
      toast.success("Transaction deleted");
      router.push("/transactions");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete transaction");
    }
  }

  if (fetching || !initialValues) {
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
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
            {t("edit_transaction")}
          </h1>
        </div>
        <Button variant="danger" onClick={deleteTransaction}>
          <Trash2 className="mr-2 h-4 w-4" />
          {t("delete")}
        </Button>
      </div>

      <Card>
        <TransactionForm
          categories={categories}
          initialValues={initialValues}
          submitLabel={t("save_changes")}
          onSubmit={submit}
          loading={pending}
        />
      </Card>
    </PageContainer>
  );
}
