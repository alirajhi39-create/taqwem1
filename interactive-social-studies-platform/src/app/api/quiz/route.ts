import { db } from "@/db";
import { answers, attempts } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { session, sessionFromToken } from "@/lib/auth";
import { createLayout, grade, isComplete } from "@/lib/quiz";

async function owned(studentId: number, id: number) { const [a] = await db.select().from(attempts).where(and(eq(attempts.id, id), eq(attempts.studentId, studentId))).limit(1); return a; }
export async function GET(req: Request) {
  const user = await session(req);
  if (user?.role !== "student" || !user.studentId) return Response.json({ error: "يرجى تسجيل الدخول" }, { status: 401 });
  const [attempt] = await db.select().from(attempts).where(eq(attempts.studentId, user.studentId)).orderBy(desc(attempts.id)).limit(1);
  const responses = attempt ? await db.select().from(answers).where(eq(answers.attemptId, attempt.id)) : [];
  return Response.json({ user: { name: user.name }, attempt: attempt || null, answers: responses });
}
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const user = (typeof body.sessionToken === "string" ? await sessionFromToken(body.sessionToken) : null) || await session(req);
  if (user?.role !== "student" || !user.studentId) return Response.json({ error: "يرجى تسجيل الدخول" }, { status: 401 });
  if (body.action === "state") {
    const [attempt] = await db.select().from(attempts).where(eq(attempts.studentId, user.studentId)).orderBy(desc(attempts.id)).limit(1);
    const responses = attempt ? await db.select().from(answers).where(eq(answers.attemptId, attempt.id)) : [];
    return Response.json({ user: { name: user.name }, attempt: attempt || null, answers: responses });
  }
  if (body.action === "start") {
    const [latest] = await db.select().from(attempts).where(eq(attempts.studentId, user.studentId)).orderBy(desc(attempts.id)).limit(1);
    if (latest?.status === "in_progress") return Response.json({ attempt: latest });
    const [attempt] = await db.insert(attempts).values({ studentId: user.studentId, layout: createLayout() }).returning();
    return Response.json({ attempt });
  }
  const id = Number(body.attemptId);
  const attempt = await owned(user.studentId, id);
  if (!attempt) return Response.json({ error: "المحاولة غير موجودة" }, { status: 404 });
  if (attempt.status !== "in_progress") return Response.json({ error: "تم تسليم هذه المحاولة بالفعل" }, { status: 409 });
  if (body.action === "save") {
    const q = Number(body.question);
    if (!Number.isInteger(q) || q < 1 || q > 9) return Response.json({ error: "سؤال غير صالح" }, { status: 400 });
    const value = body.response;
    const result = grade(q, value);
    await db.insert(answers).values({ attemptId: id, question: q, response: value, ...result }).onConflictDoUpdate({ target: [answers.attemptId, answers.question], set: { response: value, ...result, updatedAt: new Date() } });
    return Response.json({ answer: { question: q, response: value, ...result } });
  }
  if (body.action === "finish") {
    const rows = await db.select().from(answers).where(eq(answers.attemptId, id));
    const missing = Array.from({ length: 9 }, (_, i) => i + 1).filter(q => !rows.some(r => r.question === q && isComplete(q, r.response)));
    if (missing.length) return Response.json({ error: `أكمل الأسئلة أولاً: ${missing.join("، ")}`, missing }, { status: 400 });
    const score = rows.reduce((n, a) => n + a.score, 0);
    const [updated] = await db.update(attempts).set({ score, status: "completed", finishedAt: new Date() }).where(and(eq(attempts.id, id), eq(attempts.status, "in_progress"))).returning();
    return Response.json({ attempt: updated || attempt });
  }
  return Response.json({ error: "طلب غير صالح" }, { status: 400 });
}
