"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";

type Props = {
  data: Array<{ category: string; value: number }>;
};

const COLORS = ["#0ea5e9", "#14b8a6", "#f59e0b", "#f43f5e", "#6366f1", "#84cc16"];

export function ExpensePieChart({ data }: Props) {
  const { t } = useI18n();

  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {t("expense_by_category")}
      </h3>
      <div className="mt-3 h-64">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="category"
                innerRadius={48}
                outerRadius={88}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => Number(value ?? 0).toFixed(2)} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            {t("no_expense_month")}
          </div>
        )}
      </div>
    </Card>
  );
}
