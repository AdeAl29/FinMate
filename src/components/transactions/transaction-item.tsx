"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionDTO } from "@/types";

type Props = {
  transaction: TransactionDTO;
  currency: string;
  onDelete: (id: string) => Promise<void>;
};

export function TransactionItem({ transaction, currency, onDelete }: Props) {
  const { t } = useI18n();

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link
            href={`/transactions/${transaction.id}`}
            className="text-sm font-semibold text-slate-900 underline-offset-4 hover:underline dark:text-slate-100"
          >
            {transaction.title}
          </Link>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {transaction.category} • {formatDate(transaction.date)}
          </p>
          {transaction.notes && (
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{transaction.notes}</p>
          )}
        </div>
        <p
          className={`text-sm font-semibold ${
            transaction.type === "INCOME"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {transaction.type === "INCOME" ? "+" : "-"}
          {formatCurrency(transaction.amount, currency)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/transactions/${transaction.id}`} className="w-full">
          <Button variant="ghost" fullWidth>
            {t("details")}
          </Button>
        </Link>
        <Link href={`/transactions/${transaction.id}/edit`} className="w-full">
          <Button variant="secondary" fullWidth>
            <Pencil className="mr-2 h-4 w-4" />
            {t("edit")}
          </Button>
        </Link>
        <Button
          variant="danger"
          className="w-full"
          onClick={() => {
            void onDelete(transaction.id);
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t("delete")}
        </Button>
      </div>
    </Card>
  );
}
