import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { answers, attempts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { decode, sessionFromRequest } from "@/lib/auth";
import { readKey } from "@/lib/keys";
import { grade, isComplete } from "@/lib/quiz";
import { findOrCreateStudent, startAttempt, studentState } from "@/lib/records";

export const dynamic = "force-dynamic";

async function resolveStudent(req: Request, body: Record<string, unknown>) {
  const raw = String(body.k || new URL(req.url).searchParams.get("k") || "");
  const signed = decode(raw);
  if (signed?.role === "student" && signed.studentId) return { studentId: signed.studentId, name: signed.name || String(body.name || "") };
  const key = await readKey(raw).catch(() => null);
  if (key?.role === "student" && key.studentId) return { studentId: key.studentId, name: key.name || String(body.name || "") };
  const session = sessionFromRequest(req, body);
  if (session?.role === "student" && session.studentId) return { studentId: session.studentId, name: session.name || String(body.name || "") };
  const student = await findOrCreateStudent(String(body.name || ""), String(body.classroom || ""));
  return student ? { studentId: student.id, name: student.name } : null;
}

export async function GET(req: Request) {
  await ensureSchema().catch(() => undefined);
  const user = await resolveStudent(req, Object.fromEntries(new URL(req.url).searchParams));
  if (!user) return Response.json({ error: "يرجى تسجيل الدخول" }, { status: 401 });
  return Response.json(await studentState(user.studentId, user.name));
}

export async function POST(req: Request) {
  await ensureSchema().catch(() => undefined);
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const user = await resolveStudent(req, body);
  if (!user) return Response.json({ error: "يرجى تسجيل الدخول" }, { status: 401 });
  if (body.action === "load") return Response.json(await studentState(user.studentId, user.name));
  if (body.action === "start") return Response.json(await startAttempt(user.studentId, user.name));
  const id = Number(body.attemptId);
  const [attempt] = await db.select().from(attempts).where(and(eq(attempts.id, id), eq(attempts.studentId, user.studentId))).limit(1);
  if (!attempt) return Response.json({ error: "المحاولة غير موجودة" }, { status: 404 });
  if (attempt.status !== "in_progress") return Response.json({ error: "تم تسليم هذه المحاولة بالفعل" }, { status: 409 });
  if (body.action === "save") {
    const question = Number(body.question);
    if (!Number.isInteger(question) || question < 1 || question > 9) return Response.json({ error: "سؤال غير صالح" }, { status: 400 });
    const result = grade(question, body.response);
    await db.insert(answers).values({ attemptId: id, question, response: body.response, ...result }).onConflictDoUpdate({ target: [answers.attemptId, answers.question], set: { response: body.response, ...result, updatedAt: new Date() } });
    return Response.json({ answer: { question, response: body.response, ...result } });
  }
  if (body.action === "finish") {
    const rows = await db.select().from(answers).where(eq(answers.attemptId, id));
    const missing = Array.from({ length: 9 }, (_, i) => i + 1).filter((question) => !rows.some((row) => row.question === question && isComplete(question, row.response)));
    if (missing.length) return Response.json({ error: `أكمل الأسئلة أولاً: ${missing.join("، ")}`, missing }, { status: 400 });
    const score = rows.reduce((sum, row) => sum + row.score, 0);
    const [updated] = await db.update(attempts).set({ score, status: "completed", finishedAt: new Date() }).where(and(eq(attempts.id, id), eq(attempts.status, "in_progress"))).returning();
    return Response.json({ attempt: updated || attempt });
  }
  return Response.json({ error: "طلب غير صالح" }, { status: 400 });
}
