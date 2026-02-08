import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionDTO } from "@/types";

type Props = {
  items: TransactionDTO[];
  currency: string;
};

export function RecentTransactions({ items, currency }: Props) {
  const { t } = useI18n();

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("transactions_label")}
        </h3>
        <Link
          href="/transactions"
          className="text-xs font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400"
        >
          {t("view_all")}
        </Link>
      </div>

      <div className="space-y-2">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-2 dark:border-slate-800"
            >
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.category} • {formatDate(item.date)}
                </p>
              </div>
              <p
                className={`text-sm font-semibold ${
                  item.type === "INCOME"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {item.type === "INCOME" ? "+" : "-"}
                {formatCurrency(item.amount, currency)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">{t("no_transactions_yet")}</p>
        )}
      </div>
    </Card>
  );
}
