import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-response";
import { signToken } from "@/lib/jwt";
import { setAuthCookie } from "@/lib/server-auth";
import { loginSchema } from "@/lib/validations";
import { zodErrorResponse } from "@/lib/route-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: parsed.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        currency: true,
        language: true,
        darkMode: true,
      },
    });

    if (!user) {
      return fail("Invalid email or password", 401);
    }

    const passwordMatches = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!passwordMatches) {
      return fail("Invalid email or password", 401);
    }

    const token = await signToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    const response = ok({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        currency: user.currency,
        language: user.language,
        darkMode: user.darkMode,
      },
    });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }
    return fail("Unable to sign in", 500);
  }
}
