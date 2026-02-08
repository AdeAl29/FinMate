import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-response";
import { signToken } from "@/lib/jwt";
import { setAuthCookie } from "@/lib/server-auth";
import { registerSchema } from "@/lib/validations";
import { zodErrorResponse } from "@/lib/route-utils";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      return fail("Email is already registered", 409);
    }

    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const created = await prisma.user.create({
      data: {
        email: parsed.email.toLowerCase(),
        username: parsed.username,
        passwordHash,
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

    const token = await signToken({
      sub: created.id,
      email: created.email,
      username: created.username,
    });

    const response = ok(
      {
        user: created,
      },
      201,
    );
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }
    return fail("Unable to create account", 500);
  }
}
