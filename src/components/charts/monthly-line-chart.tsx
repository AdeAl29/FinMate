"use client";

import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: Array<{ month: string; expense: number; income: number }>;
};

export function MonthlyLineChart({ data }: Props) {
  const { t } = useI18n();

  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {t("monthly_spending_trend")}
      </h3>
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="expense" stroke="#f97316" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
