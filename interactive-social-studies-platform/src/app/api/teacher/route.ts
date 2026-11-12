import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { answers, attempts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decode, sessionFromRequest, teacherPasswordValid } from "@/lib/auth";
import { readKey } from "@/lib/keys";
import { resultsCsv, teacherDashboard } from "@/lib/records";

export const dynamic = "force-dynamic";

async function authorized(req: Request, body?: Record<string, unknown>) {
  const raw = String(body?.k || new URL(req.url).searchParams.get("k") || "");
  if (decode(raw)?.role === "teacher") return true;
  const key = await readKey(raw).catch(() => null);
  if (key?.role === "teacher") return true;
  const session = sessionFromRequest(req, body);
  return session?.role === "teacher" || teacherPasswordValid(String(body?.password || ""));
}

async function adjustScore(answerId: number, score: number) {
  const [existing] = await db.select().from(answers).where(eq(answers.id, answerId)).limit(1);
  if (!existing || existing.question < 4 || existing.question > 8) return null;
  await db.update(answers).set({ score, correct: score === 10, needsReview: false, updatedAt: new Date() }).where(eq(answers.id, answerId));
  const all = await db.select().from(answers).where(eq(answers.attemptId, existing.attemptId));
  const total = all.reduce((sum, row) => sum + (row.id === answerId ? score : row.score), 0);
  await db.update(attempts).set({ score: total }).where(eq(attempts.id, existing.attemptId));
  return teacherDashboard();
}

export async function GET(req: Request) {
  await ensureSchema().catch(() => undefined);
  const url = new URL(req.url);
  const body = { password: url.searchParams.get("password") || "", sid: url.searchParams.get("sid") || "", k: url.searchParams.get("k") || "" };
  if (!await authorized(req, body)) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const data = await teacherDashboard();
  if (url.searchParams.get("format") === "csv") return new Response(resultsCsv(data), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=unit3-results.csv" } });
  return Response.json(data);
}

export async function POST(req: Request) {
  await ensureSchema().catch(() => undefined);
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  if (!await authorized(req, body)) return Response.json({ error: "غير مصرح" }, { status: 401 });
  if (body.action === "csv") {
    const csv = resultsCsv(await teacherDashboard());
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=unit3-results.csv" } });
  }
  if (body.action === "score") {
    const score = Number(body.score);
    if (!Number.isInteger(score) || score < 0 || score > 10) return Response.json({ error: "درجة غير صالحة" }, { status: 400 });
    const data = await adjustScore(Number(body.answerId), score);
    if (!data) return Response.json({ error: "الإجابة ليست مقالاً" }, { status: 400 });
    return Response.json(data);
  }
  return Response.json(await teacherDashboard());
}

export async function PATCH(req: Request) {
  await ensureSchema().catch(() => undefined);
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  if (!await authorized(req, body)) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const score = Number(body.score);
  if (!Number.isInteger(score) || score < 0 || score > 10) return Response.json({ error: "درجة غير صالحة" }, { status: 400 });
  const data = await adjustScore(Number(body.answerId), score);
  if (!data) return Response.json({ error: "الإجابة ليست مقالاً" }, { status: 400 });
  return Response.json({ ok: true, score: data.records.find((row) => row.answers.some((answer) => answer.id === Number(body.answerId)))?.score || 0, ...data });
}
