import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { fail, ok } from "@/lib/api-response";
import { PREDEFINED_CATEGORIES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireUser, zodErrorResponse } from "@/lib/route-utils";
import { categorySchema } from "@/lib/validations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireUser(request);
    if (session.error) {
      return session.error;
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = categorySchema.parse(body);
    const nextName = parsed.name.trim();
    const lowerName = nextName.toLowerCase();

    if (PREDEFINED_CATEGORIES.map((item) => item.toLowerCase()).includes(lowerName)) {
      return fail("Cannot rename to a predefined category", 409);
    }

    const existing = await prisma.category.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existing) {
      return fail("Category not found", 404);
    }

    const duplicate = await prisma.category.findFirst({
      where: {
        id: { not: existing.id },
        userId: session.userId,
        name: {
          equals: nextName,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (duplicate) {
      return fail("Category name already exists", 409);
    }

    const category = await prisma.category.update({
      where: { id: existing.id },
      data: { name: nextName },
    });

    // Keep existing transaction history consistent after rename.
    await prisma.transaction.updateMany({
      where: {
        userId: session.userId,
        category: existing.name,
      },
      data: {
        category: nextName,
      },
    });

    return ok({ category });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }
    return fail("Unable to update category", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await requireUser(request);
  if (session.error) {
    return session.error;
  }

  const { id } = await context.params;
  const existing = await prisma.category.findFirst({
    where: {
      id,
      userId: session.userId,
    },
  });

  if (!existing) {
    return fail("Category not found", 404);
  }

  await prisma.$transaction([
    prisma.transaction.updateMany({
      where: {
        userId: session.userId,
        category: existing.name,
      },
      data: {
        category: "Others",
      },
    }),
    prisma.category.delete({
      where: { id: existing.id },
    }),
  ]);

  return ok({ message: "Category deleted successfully" });
}
