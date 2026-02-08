import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/api-response";
import { getSessionFromRequest } from "@/lib/server-auth";

export async function requireUser(request: NextRequest): Promise<
  | {
      userId: string;
      email: string;
      username: string;
      error?: never;
    }
  | {
      error: NextResponse;
      userId?: never;
      email?: never;
      username?: never;
    }
> {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return { error: fail("Unauthorized", 401) };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, username: true },
  });

  if (!user) {
    return { error: fail("Unauthorized", 401) };
  }

  return { userId: user.id, email: user.email, username: user.username };
}

export function zodErrorResponse(error: ZodError) {
  return fail("Validation failed", 400, error.flatten());
}
