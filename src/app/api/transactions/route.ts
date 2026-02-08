import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { fail, ok } from "@/lib/api-response";
import { getAllCategoriesForUser, normalizeCategoryName } from "@/lib/category-utils";
import { prisma } from "@/lib/prisma";
import { requireUser, zodErrorResponse } from "@/lib/route-utils";
import { serializeTransaction } from "@/lib/serializers";
import { transactionSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const session = await requireUser(request);
  if (session.error) {
    return session.error;
  }

  const { searchParams } = request.nextUrl;
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {
    userId: session.userId,
  };

  if (dateFrom || dateTo) {
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom);
    }
    if (dateTo) {
      dateFilter.lte = new Date(dateTo);
    }
    where.date = dateFilter;
  }

  if (category && category !== "All") {
    where.category = category;
  }

  if (type && type !== "All" && (type === "INCOME" || type === "EXPENSE")) {
    where.type = type;
  }

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        notes: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: {
      date: "desc",
    },
  });

  return ok({ transactions: transactions.map(serializeTransaction) });
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireUser(request);
    if (session.error) {
      return session.error;
    }

    const payload = await request.json();
    const parsed = transactionSchema.parse(payload);
    const categoryName = normalizeCategoryName(parsed.category);

    const availableCategories = await getAllCategoriesForUser(session.userId);
    if (!availableCategories.allNames.has(categoryName.toLowerCase())) {
      return fail("Category does not exist for this user", 400);
    }

    const transaction = await prisma.transaction.create({
      data: {
        title: parsed.title,
        amount: parsed.amount,
        category: categoryName,
        type: parsed.type,
        date: new Date(parsed.date),
        notes: parsed.notes?.trim() ? parsed.notes.trim() : null,
        userId: session.userId,
      },
    });

    return ok({ transaction: serializeTransaction(transaction) }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }

    return fail("Unable to create transaction", 500);
  }
}
