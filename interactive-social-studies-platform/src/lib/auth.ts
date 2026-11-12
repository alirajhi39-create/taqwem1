import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const key = process.env.SESSION_SECRET || process.env.DATABASE_URL || "unit3-school-session";
export type Session = { role: "student" | "teacher"; studentId?: number; name?: string; exp: number };

function sign(data: string) {
  return createHmac("sha256", key).update(data).digest("hex");
}

export function token(session: Session) {
  const data = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function decode(raw?: string | null): Session | null {
  if (!raw) return null;
  try {
    const [data, signature] = raw.split(".");
    if (!data || !signature) return null;
    const expected = sign(data);
    const left = Buffer.from(signature);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
    const session = JSON.parse(Buffer.from(data, "base64url").toString()) as Session;
    return session.exp > Date.now() ? session : null;
  } catch {
    return null;
  }
}

function westernDigits(input: string) {
  return input.trim().replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/\s+/g, "");
}

function same(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function teacherPasswordValid(input: string) {
  const password = westernDigits(String(input || ""));
  const reversed = password.split("").reverse().join("");
  const accepted = ["139613", process.env.TEACHER_PASSWORD || ""].filter(Boolean).map(westernDigits);
  return accepted.some((value) => same(password, value) || same(reversed, value));
}

export function sessionFromRequest(req: Request, body?: unknown): Session | null {
  const record = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const header = req.headers.get("authorization") || "";
  let querySid = "";
  try {
    const url = new URL(req.url);
    querySid = url.searchParams.get("sid") || url.searchParams.get("token") || "";
  } catch { /* Relative request URLs have no session query. */ }
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)unit3_(?:sid|session)=([^;]+)/);
  const candidates = [
    header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "",
    req.headers.get("x-sid") || "",
    querySid,
    match ? decodeURIComponent(match[1]) : "",
    String(record.sid || record.token || ""),
  ];
  for (const raw of candidates) {
    const session = decode(raw);
    if (session) return session;
  }
  return null;
}

export function jsonWithSession(data: Record<string, unknown>, sessionValue: Session | null, status = 200) {
  const sid = sessionValue ? token(sessionValue) : "";
  const res = NextResponse.json(sessionValue ? { ...data, token: sid, sid } : data, { status });
  if (sid) {
    const options = { sameSite: "lax" as const, secure: false, path: "/", maxAge: 60 * 60 * 24 * 30 };
    res.cookies.set("unit3_session", sid, { ...options, httpOnly: true });
    res.cookies.set("unit3_sid", sid, { ...options, httpOnly: false });
  }
  return res;
}

export function clearSessionResponse() {
  const res = NextResponse.json({ ok: true, cleared: true });
  res.cookies.set("unit3_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set("unit3_sid", "", { httpOnly: false, path: "/", maxAge: 0 });
  return res;
}
