import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { requireUser, zodErrorResponse } from "@/lib/route-utils";
import { changePasswordSchema } from "@/lib/validations";

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireUser(request);
    if (session.error) {
      return session.error;
    }

    const body = await request.json();
    const parsed = changePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return fail("User not found", 404);
    }

    const currentMatches = await bcrypt.compare(parsed.currentPassword, user.passwordHash);
    if (!currentMatches) {
      return fail("Current password is incorrect", 400);
    }

    const newHash = await bcrypt.hash(parsed.newPassword, 12);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash: newHash,
      },
    });

    return ok({ message: "Password updated successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }
    return fail("Unable to update password", 500);
  }
}
