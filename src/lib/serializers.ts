import { SavingsGoal, Transaction } from "@prisma/client";
import { clampPercentage } from "@/lib/utils";
import { SavingsGoalDTO, TransactionDTO } from "@/types";

export function serializeTransaction(transaction: Transaction): TransactionDTO {
  return {
    id: transaction.id,
    title: transaction.title,
    amount: Number(transaction.amount),
    category: transaction.category,
    type: transaction.type,
    date: transaction.date.toISOString(),
    notes: transaction.notes,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
}

export function serializeGoal(goal: SavingsGoal): SavingsGoalDTO {
  const targetAmount = Number(goal.targetAmount);
  const savedAmount = Number(goal.savedAmount);
  const progress = targetAmount > 0 ? clampPercentage((savedAmount / targetAmount) * 100) : 0;

  return {
    id: goal.id,
    title: goal.title,
    targetAmount,
    savedAmount,
    progress,
    targetDate: goal.targetDate ? goal.targetDate.toISOString() : null,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
}
