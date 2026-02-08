"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  TransactionForm,
  TransactionFormValues,
} from "@/components/transactions/transaction-form";
import { useI18n } from "@/hooks/use-i18n";
import { apiGet, apiSend } from "@/lib/client-api";

type CategoryPayload = {
  predefined: string[];
  custom: Array<{ id: string; name: string }>;
};

export default function NewTransactionPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [categories, setCategories] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const payload = await apiGet<CategoryPayload>("/api/categories");
        setCategories([...payload.predefined, ...payload.custom.map((item) => item.name)]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load categories");
      } finally {
        setFetching(false);
      }
    }

    void loadCategories();
  }, []);

  async function submit(values: TransactionFormValues) {
    try {
      setPending(true);
      await apiSend("/api/transactions", "POST", values);
      toast.success("Transaction created");
      router.push("/transactions");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create transaction");
    } finally {
      setPending(false);
    }
  }

  if (fetching) {
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
          {t("add_transaction")}
        </h1>
      </div>

      <Card>
        <TransactionForm
          categories={categories}
          submitLabel={t("add_transaction")}
          onSubmit={submit}
          loading={pending}
        />
      </Card>
    </PageContainer>
  );
}
