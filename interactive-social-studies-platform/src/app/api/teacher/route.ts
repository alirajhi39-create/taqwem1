import { db } from "@/db";
import { answers, attempts, students } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { session, sessionFromToken } from "@/lib/auth";
import { questionTitles } from "@/lib/quiz";
import { ACTIVE_CLASSROOM } from "@/lib/classrooms";

async function dashboard(format?: unknown) {
  const records = await db.select({ attempt: attempts, student: students }).from(attempts).innerJoin(students, eq(attempts.studentId, students.id)).where(eq(students.classroom, ACTIVE_CLASSROOM)).orderBy(desc(attempts.id));
  const responses = await db.select().from(answers);
  const data = records.map(r => ({ ...r.attempt, student: r.student, answers: responses.filter(a => a.attemptId === r.attempt.id) }));
  if (format === "csv") {
    const esc = (s: unknown) => `"${String(s ?? "").replaceAll('"', '""')}"`;
    const csv = "\uFEFF" + ["اسم الطالب,الفصل,التاريخ,الدرجة,النسبة,الحالة", ...data.map(a => [a.student.name, a.student.classroom, a.startedAt.toISOString(), a.score, `${Math.round(a.score / 90 * 100)}%`, a.status === "completed" ? "مكتمل" : "جارٍ"].map(esc).join(","))].join("\n");
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=unit3-results.csv", "Cache-Control": "no-store" } });
  }
  const completed = data.filter(a => a.status === "completed");
  const difficulty = questionTitles.map((title, i) => ({ title, average: completed.length ? Math.round(completed.reduce((sum, a) => sum + (a.answers.find(x => x.question === i + 1)?.score || 0), 0) / completed.length * 10) : 0 })).sort((a, b) => a.average - b.average);
  return Response.json({ records: data, average: completed.length ? Math.round(completed.reduce((sum, a) => sum + a.score, 0) / completed.length / 90 * 100) : 0, difficulty }, { headers: { "Cache-Control": "no-store" } });
}

export async function GET(req: Request) {
  const user = await session(req);
  if (user?.role !== "teacher") return Response.json({ error: "غير مصرح" }, { status: 401 });
  return dashboard(new URL(req.url).searchParams.get("format"));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const user = (typeof body.sessionToken === "string" ? await sessionFromToken(body.sessionToken) : null) || await session(req);
  if (user?.role !== "teacher") return Response.json({ error: "غير مصرح" }, { status: 401 });
  return dashboard(body.format);
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const user = (typeof body.sessionToken === "string" ? await sessionFromToken(body.sessionToken) : null) || await session(req);
  if (user?.role !== "teacher") return Response.json({ error: "غير مصرح" }, { status: 401 });
  const id = Number(body.answerId), score = Number(body.score);
  if (!Number.isInteger(id) || !Number.isInteger(score) || score < 0 || score > 10) return Response.json({ error: "درجة غير صالحة" }, { status: 400 });
  const [existing] = await db.select().from(answers).where(eq(answers.id, id)).limit(1);
  if (!existing || existing.question < 4 || existing.question > 8) return Response.json({ error: "الإجابة ليست مقالاً" }, { status: 400 });
  const [owner] = await db.select({ classroom: students.classroom }).from(attempts).innerJoin(students, eq(attempts.studentId, students.id)).where(eq(attempts.id, existing.attemptId)).limit(1);
  if (owner?.classroom !== ACTIVE_CLASSROOM) return Response.json({ error: "هذه الإجابة خارج الفصل المحدد" }, { status: 403 });
  await db.update(answers).set({ score, correct: score === 10, needsReview: false, updatedAt: new Date() }).where(eq(answers.id, id));
  const all = await db.select().from(answers).where(eq(answers.attemptId, existing.attemptId));
  const total = all.reduce((sum, row) => sum + (row.id === id ? score : row.score), 0);
  await db.update(attempts).set({ score: total }).where(eq(attempts.id, existing.attemptId));
  return Response.json({ ok: true, score: total });
}
