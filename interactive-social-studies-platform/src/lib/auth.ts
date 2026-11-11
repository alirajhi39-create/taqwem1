import { cookies } from "next/headers";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { and, eq, gt, inArray } from "drizzle-orm";
import { db } from "@/db";
import { authSessions, students } from "@/db/schema";
import teacherAccess from "./teacher-access.json";

const COOKIE_NAME = "unit3_session";
export type Session = { role: "student" | "teacher"; studentId?: number; name?: string; exp: number };
const hashToken = (raw: string) => createHash("sha256").update(raw).digest("hex");
const bearerToken = (req?: Request) => {
  const custom = req?.headers.get("x-unit3-session")?.trim();
  if (custom) return custom;
  const value = req?.headers.get("authorization");
  return value?.startsWith("Bearer ") ? value.slice(7).trim() : undefined;
};

export async function sessionFromToken(raw?: string): Promise<Session | null> {
  return resolveToken(raw);
}

async function resolveToken(raw?: string): Promise<Session | null> {
  if (!raw || raw.length > 256) return null;
  const [record] = await db.select().from(authSessions).where(and(eq(authSessions.tokenHash, hashToken(raw)), gt(authSessions.expiresAt, new Date()))).limit(1);
  if (!record) return null;
  if (record.role === "teacher") return { role: "teacher", exp: record.expiresAt.getTime() };
  if (record.role !== "student" || !record.studentId) return null;
  const [student] = await db.select({ id: students.id, name: students.name }).from(students).where(eq(students.id, record.studentId)).limit(1);
  if (!student) return null;
  return { role: "student", studentId: student.id, name: student.name, exp: record.expiresAt.getTime() };
}

export async function session(req?: Request): Promise<Session | null> {
  const bearer = bearerToken(req);
  if (bearer) {
    const value = await resolveToken(bearer);
    if (value) return value;
  }
  return resolveToken((await cookies()).get(COOKIE_NAME)?.value);
}

export async function setSession(value: Session): Promise<string> {
  const raw = randomBytes(32).toString("base64url");
  await db.insert(authSessions).values({ tokenHash: hashToken(raw), role: value.role, studentId: value.role === "student" ? value.studentId : null, expiresAt: new Date(value.exp) });
  (await cookies()).set(COOKIE_NAME, raw, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return raw;
}

export async function clearSession(req?: Request, explicitToken?: string) {
  const values = [(await cookies()).get(COOKIE_NAME)?.value, bearerToken(req), explicitToken].filter((value): value is string => !!value);
  if (values.length) await db.delete(authSessions).where(inArray(authSessions.tokenHash, values.map(hashToken)));
  (await cookies()).delete(COOKIE_NAME);
}

export function normalizeAccessCode(input: string) {
  return input.replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776)).trim();
}

export function teacherPasswordValid(input: string) {
  const normalized = normalizeAccessCode(input);
  if (!normalized || normalized.length > 128) return false;
  const configured = (process.env.TEACHER_PASSWORD || "").trim();
  if (configured) {
    const a = Buffer.from(normalized); const b = Buffer.from(configured);
    return a.length === b.length && timingSafeEqual(a, b);
  }
  const expected = Buffer.from(teacherAccess.hash, "hex");
  const actual = scryptSync(normalized, teacherAccess.salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
