import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { fail, ok } from "@/lib/api-response";
import { getAllCategoriesForUser, normalizeCategoryName } from "@/lib/category-utils";
import { prisma } from "@/lib/prisma";
import { requireUser, zodErrorResponse } from "@/lib/route-utils";
import { serializeTransaction } from "@/lib/serializers";
import { transactionSchema } from "@/lib/validations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await requireUser(request);
  if (session.error) {
    return session.error;
  }

  const { id } = await context.params;
  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      userId: session.userId,
    },
  });

  if (!transaction) {
    return fail("Transaction not found", 404);
  }

  return ok({ transaction: serializeTransaction(transaction) });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireUser(request);
    if (session.error) {
      return session.error;
    }

    const { id } = await context.params;
    const existing = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.userId,
      },
      select: { id: true },
    });

    if (!existing) {
      return fail("Transaction not found", 404);
    }

    const payload = await request.json();
    const parsed = transactionSchema.parse(payload);
    const categoryName = normalizeCategoryName(parsed.category);

    const availableCategories = await getAllCategoriesForUser(session.userId);
    if (!availableCategories.allNames.has(categoryName.toLowerCase())) {
      return fail("Category does not exist for this user", 400);
    }

    const transaction = await prisma.transaction.update({
      where: { id: existing.id },
      data: {
        title: parsed.title,
        amount: parsed.amount,
        category: categoryName,
        type: parsed.type,
        date: new Date(parsed.date),
        notes: parsed.notes?.trim() ? parsed.notes.trim() : null,
      },
    });

    return ok({ transaction: serializeTransaction(transaction) });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }
    return fail("Unable to update transaction", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await requireUser(request);
  if (session.error) {
    return session.error;
  }

  const { id } = await context.params;
  const deleted = await prisma.transaction.deleteMany({
    where: {
      id,
      userId: session.userId,
    },
  });

  if (!deleted.count) {
    return fail("Transaction not found", 404);
  }

  return ok({ message: "Transaction deleted successfully" });
}
