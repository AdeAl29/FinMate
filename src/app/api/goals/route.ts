import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { requireUser, zodErrorResponse } from "@/lib/route-utils";
import { serializeGoal } from "@/lib/serializers";
import { savingsGoalSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const session = await requireUser(request);
  if (session.error) {
    return session.error;
  }

  const goals = await prisma.savingsGoal.findMany({
    where: {
      userId: session.userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return ok({
    goals: goals.map(serializeGoal),
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireUser(request);
    if (session.error) {
      return session.error;
    }

    const body = await request.json();
    const parsed = savingsGoalSchema.parse(body);

    const goal = await prisma.savingsGoal.create({
      data: {
        userId: session.userId,
        title: parsed.title,
        targetAmount: parsed.targetAmount,
        savedAmount: parsed.savedAmount,
        targetDate: parsed.targetDate ? new Date(parsed.targetDate) : null,
      },
    });

    return ok({ goal: serializeGoal(goal) }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }

    return fail("Unable to create savings goal", 500);
  }
}
