import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { fail, ok } from "@/lib/api-response";
import { PREDEFINED_CATEGORIES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireUser, zodErrorResponse } from "@/lib/route-utils";
import { categorySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const session = await requireUser(request);
  if (session.error) {
    return session.error;
  }

  const custom = await prisma.category.findMany({
    where: {
      userId: session.userId,
    },
    orderBy: {
      name: "asc",
    },
  });

  return ok({
    predefined: PREDEFINED_CATEGORIES,
    custom,
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireUser(request);
    if (session.error) {
      return session.error;
    }

    const body = await request.json();
    const parsed = categorySchema.parse(body);
    const name = parsed.name.trim();
    const lowerName = name.toLowerCase();

    if (PREDEFINED_CATEGORIES.map((item) => item.toLowerCase()).includes(lowerName)) {
      return fail("This category already exists as predefined", 409);
    }

    const existing = await prisma.category.findFirst({
      where: {
        userId: session.userId,
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (existing) {
      return fail("Category already exists", 409);
    }

    const category = await prisma.category.create({
      data: {
        userId: session.userId,
        name,
      },
    });

    return ok({ category }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }
    return fail("Unable to create category", 500);
  }
}
