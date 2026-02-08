import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { requireUser, zodErrorResponse } from "@/lib/route-utils";
import { serializeGoal } from "@/lib/serializers";
import { savingsGoalSchema } from "@/lib/validations";

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
    const existing = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId: session.userId,
      },
      select: { id: true },
    });

    if (!existing) {
      return fail("Savings goal not found", 404);
    }

    const body = await request.json();
    const parsed = savingsGoalSchema.parse(body);

    const goal = await prisma.savingsGoal.update({
      where: { id: existing.id },
      data: {
        title: parsed.title,
        targetAmount: parsed.targetAmount,
        savedAmount: parsed.savedAmount,
        targetDate: parsed.targetDate ? new Date(parsed.targetDate) : null,
      },
    });

    return ok({ goal: serializeGoal(goal) });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }
    return fail("Unable to update savings goal", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await requireUser(request);
  if (session.error) {
    return session.error;
  }

  const { id } = await context.params;
  const deleted = await prisma.savingsGoal.deleteMany({
    where: {
      id,
      userId: session.userId,
    },
  });

  if (!deleted.count) {
    return fail("Savings goal not found", 404);
  }

  return ok({ message: "Savings goal deleted successfully" });
}
