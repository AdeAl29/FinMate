import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Props = {
  currency: string;
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
};

export function SummaryCards({ currency, totalBalance, totalIncome, totalExpense }: Props) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Card className="bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-md">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-white/85">{t("total_balance")}</p>
          <Wallet className="h-4 w-4 text-white/90" />
        </div>
        <p className="mt-2 text-xl font-semibold">{formatCurrency(totalBalance, currency)}</p>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-300">{t("income")}</p>
          <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
        </div>
        <p className="mt-2 text-xl font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(totalIncome, currency)}
        </p>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-300">{t("expense")}</p>
          <ArrowDownCircle className="h-4 w-4 text-rose-500" />
        </div>
        <p className="mt-2 text-xl font-semibold text-rose-600 dark:text-rose-400">
          {formatCurrency(totalExpense, currency)}
        </p>
      </Card>
    </div>
  );
}
