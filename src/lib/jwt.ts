import { JWTPayload, SignJWT, jwtVerify } from "jose";

export type AuthTokenPayload = JWTPayload & {
  sub: string;
  email: string;
  username: string;
};

type SignTokenInput = {
  sub: string;
  email: string;
  username: string;
};

function getJwtSecret() {
  const rawSecret = process.env.JWT_SECRET;
  if (!rawSecret || rawSecret.length < 32) {
    throw new Error("JWT_SECRET must be set in .env and be at least 32 characters long");
  }
  return new TextEncoder().encode(rawSecret);
}

export async function signToken(payload: SignTokenInput) {
  return new SignJWT({
    email: payload.email,
    username: payload.username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload.sub || !payload.email || !payload.username) {
      return null;
    }

    return payload as AuthTokenPayload;
  } catch {
    return null;
  }
}
