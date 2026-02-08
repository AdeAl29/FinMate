import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { requireUser, zodErrorResponse } from "@/lib/route-utils";
import { profileSettingsSchema } from "@/lib/validations";

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireUser(request);
    if (session.error) {
      return session.error;
    }

    const body = await request.json();
    const parsed = profileSettingsSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        username: parsed.username.trim(),
        currency: parsed.currency,
        language: parsed.language,
        darkMode: parsed.darkMode,
      },
      select: {
        id: true,
        email: true,
        username: true,
        currency: true,
        language: true,
        darkMode: true,
      },
    });

    return ok({ user });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }
    return fail("Unable to update profile settings", 500);
  }
}
