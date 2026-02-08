"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type TransactionFormValues = {
  title: string;
  amount: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  notes: string;
};

type Props = {
  categories: string[];
  initialValues?: Partial<TransactionFormValues>;
  submitLabel: string;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  loading?: boolean;
};

export function TransactionForm({
  categories,
  initialValues,
  submitLabel,
  onSubmit,
  loading,
}: Props) {
  const [form, setForm] = useState<TransactionFormValues>({
    title: initialValues?.title || "",
    amount: initialValues?.amount || "",
    category: initialValues?.category || categories[0] || "",
    type: initialValues?.type || "EXPENSE",
    date: initialValues?.date || new Date().toISOString().slice(0, 10),
    notes: initialValues?.notes || "",
  });
  const [error, setError] = useState<string | null>(null);

  const sortedCategories = useMemo(() => [...categories].sort(), [categories]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (Number(form.amount) <= 0) {
      setError("Amount must be more than 0.");
      return;
    }
    if (!form.category) {
      setError("Please choose a category.");
      return;
    }

    await onSubmit(form);
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
          Title
        </label>
        <Input
          value={form.title}
          maxLength={100}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          placeholder="e.g., Lunch at campus"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
          Amount
        </label>
        <Input
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
          placeholder="0.00"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Type
          </label>
          <Select
            value={form.type}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                type: event.target.value as "INCOME" | "EXPENSE",
              }))
            }
          >
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Date
          </label>
          <Input
            type="date"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
          Category
        </label>
        <Select
          value={form.category}
          onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
        >
          {sortedCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
          Notes (optional)
        </label>
        <Textarea
          value={form.notes}
          maxLength={250}
          rows={4}
          onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          placeholder="Any details about this transaction"
        />
      </div>

      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

      <Button type="submit" fullWidth disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
