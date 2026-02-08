"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { SavingsGoalDTO } from "@/types";

type GoalFormState = {
  title: string;
  targetAmount: string;
  savedAmount: string;
  targetDate: string;
};

const INITIAL_FORM: GoalFormState = {
  title: "",
  targetAmount: "",
  savedAmount: "0",
  targetDate: "",
};

type Props = {
  goals: SavingsGoalDTO[];
  currency: string;
  onCreate: (payload: GoalFormState) => Promise<void>;
  onUpdate: (id: string, payload: GoalFormState) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function GoalsSection({ goals, currency, onCreate, onUpdate, onDelete }: Props) {
  const [form, setForm] = useState(INITIAL_FORM);

  return (
    <Card className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Savings Goals</h3>

      <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <Input
          placeholder="Goal name (e.g., New laptop)"
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            step="0.01"
            placeholder="Target amount"
            value={form.targetAmount}
            onChange={(event) => setForm((prev) => ({ ...prev, targetAmount: event.target.value }))}
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Saved amount"
            value={form.savedAmount}
            onChange={(event) => setForm((prev) => ({ ...prev, savedAmount: event.target.value }))}
          />
        </div>
        <Input
          type="date"
          value={form.targetDate}
          onChange={(event) => setForm((prev) => ({ ...prev, targetDate: event.target.value }))}
        />
        <Button
          fullWidth
          onClick={() => {
            if (!form.title.trim() || Number(form.targetAmount) <= 0) return;
            void onCreate(form);
            setForm(INITIAL_FORM);
          }}
        >
          Create Goal
        </Button>
      </div>

      <div className="space-y-3">
        {goals.length ? (
          goals.map((goal) => (
            <div
              key={goal.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{goal.title}</p>
                <button
                  aria-label="Delete goal"
                  className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                  onClick={() => {
                    void onDelete(goal.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                {formatCurrency(goal.savedAmount, currency)} /{" "}
                {formatCurrency(goal.targetAmount, currency)} ({goal.progress.toFixed(1)}%)
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="0.01"
                  defaultValue={goal.savedAmount}
                  onBlur={(event) => {
                    const nextSaved = event.currentTarget.value;
                    void onUpdate(goal.id, {
                      title: goal.title,
                      targetAmount: String(goal.targetAmount),
                      savedAmount: nextSaved,
                      targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : "",
                    });
                  }}
                />
                <Input
                  type="number"
                  step="0.01"
                  defaultValue={goal.targetAmount}
                  onBlur={(event) => {
                    const nextTarget = event.currentTarget.value;
                    void onUpdate(goal.id, {
                      title: goal.title,
                      targetAmount: nextTarget,
                      savedAmount: String(goal.savedAmount),
                      targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : "",
                    });
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">No goals created yet.</p>
        )}
      </div>
    </Card>
  );
}
