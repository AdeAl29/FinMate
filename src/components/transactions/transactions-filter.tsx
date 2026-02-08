"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";

export type TransactionFilters = {
  search: string;
  category: string;
  type: string;
  dateFrom: string;
  dateTo: string;
};

type Props = {
  categories: string[];
  value: TransactionFilters;
  onChange: (value: TransactionFilters) => void;
};

export function TransactionsFilter({ categories, value, onChange }: Props) {
  const { t } = useI18n();

  return (
    <Card className="space-y-3">
      <Input
        placeholder={t("search_placeholder")}
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          value={value.category}
          onChange={(event) => onChange({ ...value, category: event.target.value })}
        >
          <option value="All">{t("all_categories")}</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>

        <Select
          value={value.type}
          onChange={(event) => onChange({ ...value, type: event.target.value })}
        >
          <option value="All">{t("all_types")}</option>
          <option value="INCOME">{t("income")}</option>
          <option value="EXPENSE">{t("expense")}</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="date"
          value={value.dateFrom}
          onChange={(event) => onChange({ ...value, dateFrom: event.target.value })}
        />
        <Input
          type="date"
          value={value.dateTo}
          onChange={(event) => onChange({ ...value, dateTo: event.target.value })}
        />
      </div>
    </Card>
  );
}
