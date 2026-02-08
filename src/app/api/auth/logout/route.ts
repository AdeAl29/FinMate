import { clearAuthCookie } from "@/lib/server-auth";
import { ok } from "@/lib/api-response";

export async function POST() {
  const response = ok({ message: "Logged out successfully" });
  clearAuthCookie(response);
  return response;
}
