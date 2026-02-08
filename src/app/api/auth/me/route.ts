import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/route-utils";

export async function GET(request: NextRequest) {
  const session = await requireUser(request);
  if (session.error) {
    return session.error;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      username: true,
      currency: true,
      language: true,
      darkMode: true,
    },
  });

  if (!user) {
    return fail("User not found", 404);
  }

  return ok({ user });
}
