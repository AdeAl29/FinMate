import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { MONTH_NAMES_SHORT } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/route-utils";
import { serializeTransaction } from "@/lib/serializers";

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function readSum(amount: unknown) {
  return amount ? Number(amount) : 0;
}

type GroupByTypeResult = {
  type: "INCOME" | "EXPENSE";
  _sum: { amount: unknown };
};

type GroupByCategoryResult = {
  category: string;
  _sum: { amount: unknown };
};

type TrendTransaction = {
  amount: unknown;
  date: Date;
  type: "INCOME" | "EXPENSE";
};

export async function GET(request: NextRequest) {
  const session = await requireUser(request);
  if (session.error) {
    return session.error;
  }

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const trendStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalsByTypeRaw,
    monthByTypeRaw,
    recentTransactions,
    expenseByCategoryRaw,
    trendTransactionsRaw,
  ] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId: session.userId },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId: session.userId,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId: session.userId },
      orderBy: { date: "desc" },
      take: 8,
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      where: {
        userId: session.userId,
        type: "EXPENSE",
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId: session.userId,
        date: {
          gte: trendStart,
          lte: currentMonthEnd,
        },
      },
      select: {
        amount: true,
        date: true,
        type: true,
      },
      orderBy: {
        date: "asc",
      },
    }),
  ]);

  const totalsByType = totalsByTypeRaw as GroupByTypeResult[];
  const monthByType = monthByTypeRaw as GroupByTypeResult[];
  const expenseByCategory = expenseByCategoryRaw as GroupByCategoryResult[];
  const trendTransactions = trendTransactionsRaw as TrendTransaction[];

  const totalIncome = totalsByType.find((item) => item.type === "INCOME");
  const totalExpense = totalsByType.find((item) => item.type === "EXPENSE");
  const monthlyIncome = monthByType.find((item) => item.type === "INCOME");
  const monthlyExpense = monthByType.find((item) => item.type === "EXPENSE");

  const monthlyTemplate = new Map<string, { month: string; income: number; expense: number }>();
  for (let i = 5; i >= 0; i -= 1) {
    const pointer = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyTemplate.set(toMonthKey(pointer), {
      month: MONTH_NAMES_SHORT[pointer.getMonth()],
      income: 0,
      expense: 0,
    });
  }

  for (const transaction of trendTransactions) {
    const key = toMonthKey(transaction.date);
    const bucket = monthlyTemplate.get(key);
    if (!bucket) {
      continue;
    }

    if (transaction.type === "INCOME") {
      bucket.income += Number(transaction.amount);
    } else {
      bucket.expense += Number(transaction.amount);
    }
  }

  return ok({
    totalBalance: readSum(totalIncome?._sum.amount) - readSum(totalExpense?._sum.amount),
    totalIncome: readSum(totalIncome?._sum.amount),
    totalExpense: readSum(totalExpense?._sum.amount),
    monthlyIncome: readSum(monthlyIncome?._sum.amount),
    monthlyExpense: readSum(monthlyExpense?._sum.amount),
    recentTransactions: recentTransactions.map(serializeTransaction),
    expenseByCategory: expenseByCategory.map((item) => ({
      category: item.category,
      value: readSum(item._sum.amount),
    })),
    monthlyTrend: Array.from(monthlyTemplate.values()),
  });
}
