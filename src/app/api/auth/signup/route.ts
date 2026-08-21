import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(200),
  phone: z.string().min(7).max(30).optional(),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "signup"), 5, 900);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "TOO_MANY_ATTEMPTS" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", issues: parsed.error.flatten() }, { status: 400 });
  }
  const { name, email, phone, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return NextResponse.json({ error: "EMAIL_TAKEN" }, { status: 409 });

  const user = await db.user.create({
    data: { name, email: normalizedEmail, phone, passwordHash: await hashPassword(password) },
  });
  await createSession(user.id);

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
