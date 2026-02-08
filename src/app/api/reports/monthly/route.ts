import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/route-utils";
import { serializeTransaction } from "@/lib/serializers";

type GroupByTypeResult = {
  type: "INCOME" | "EXPENSE";
  _sum: { amount: unknown };
};

type GroupByCategoryResult = {
  category: string;
  _sum: { amount: unknown };
};

function resolveMonthBounds(input: string | null) {
  const now = new Date();
  const fallback = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const safeInput = input || fallback;
  const [yearText, monthText] = safeInput.split("-");

  const year = Number(yearText);
  const month = Number(monthText);

  if (!year || !month || month < 1 || month > 12) {
    return null;
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  return { year, month, start, end, key: safeInput };
}

export async function GET(request: NextRequest) {
  const session = await requireUser(request);
  if (session.error) {
    return session.error;
  }

  const monthInput = request.nextUrl.searchParams.get("month");
  const bounds = resolveMonthBounds(monthInput);
  if (!bounds) {
    return fail("Invalid month format. Use YYYY-MM", 400);
  }

  const [transactions, totalsByTypeRaw, expenseByCategoryRaw] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId: session.userId,
        date: {
          gte: bounds.start,
          lte: bounds.end,
        },
      },
      orderBy: {
        date: "desc",
      },
    }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId: session.userId,
        date: {
          gte: bounds.start,
          lte: bounds.end,
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      where: {
        userId: session.userId,
        type: "EXPENSE",
        date: {
          gte: bounds.start,
          lte: bounds.end,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const totalsByType = totalsByTypeRaw as GroupByTypeResult[];
  const expenseByCategory = expenseByCategoryRaw as GroupByCategoryResult[];

  const totalIncome = Number(totalsByType.find((item) => item.type === "INCOME")?._sum.amount || 0);
  const totalExpense = Number(
    totalsByType.find((item) => item.type === "EXPENSE")?._sum.amount || 0,
  );

  return ok({
    month: bounds.key,
    periodStart: bounds.start.toISOString(),
    periodEnd: bounds.end.toISOString(),
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    expenseByCategory: expenseByCategory.map((item) => ({
      category: item.category,
      amount: Number(item._sum.amount || 0),
    })),
    transactions: transactions.map(serializeTransaction),
  });
}
