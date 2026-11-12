import { db } from "@/db";
import { students } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { clearSession, session, sessionFromToken, setSession, teacherPasswordValid, type Session } from "@/lib/auth";
import { normalizeClassroom } from "@/lib/classrooms";

const noStore = { "Cache-Control": "no-store, max-age=0" };
const sessionPayload = (value: Session | null) => ({ authenticated: !!value, role: value?.role || null, name: value?.name || null, studentId: value?.studentId || null });

export async function GET(req: Request) {
  try {
    return Response.json(sessionPayload(await session(req)), { headers: noStore });
  } catch {
    return Response.json({ error: "تعذر التحقق من جلسة الدخول. حاول مرة أخرى." }, { status: 503, headers: noStore });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ error: "بيانات الدخول غير صالحة." }, { status: 400 });
  try {
    if (body.action === "verify") {
      const value = await sessionFromToken(typeof body.token === "string" ? body.token : typeof body.sessionToken === "string" ? body.sessionToken : undefined);
      return Response.json(sessionPayload(value), { headers: noStore });
    }
    if (body.action === "logout") {
      await clearSession(req, typeof body.sessionToken === "string" ? body.sessionToken : typeof body.token === "string" ? body.token : undefined);
      return Response.json({ ok: true }, { headers: noStore });
    }
    const previousToken = typeof body.previousToken === "string" ? body.previousToken : undefined;
    if (body.role === "teacher") {
      if (!teacherPasswordValid(String(body.password || ""))) return Response.json({ error: "الرقم السري غير صحيح. حاول مرة أخرى." }, { status: 401, headers: noStore });
      await clearSession(req, previousToken);
      const value: Session = { role: "teacher", exp: Date.now() + 30 * 86400000 };
      const accessToken = await setSession(value);
      return Response.json({ ok: true, role: "teacher", token: accessToken }, { headers: noStore });
    }
    if (body.role !== "student") return Response.json({ error: "نوع الدخول غير صالح." }, { status: 400 });
    const name = String(body.name || "").normalize("NFC").trim().replace(/\s+/g, " ").slice(0, 100);
    const classroom = normalizeClassroom(body.classroom);
    if (name.length < 5 || !classroom) return Response.json({ error: "اكتب اسمك الثلاثي واختر الفصل الدراسي." }, { status: 400 });
    let [student] = await db.select().from(students).where(and(eq(students.name, name), eq(students.classroom, classroom))).limit(1);
    if (!student) [student] = await db.insert(students).values({ name, classroom }).onConflictDoNothing().returning();
    if (!student) [student] = await db.select().from(students).where(and(eq(students.name, name), eq(students.classroom, classroom))).limit(1);
    if (!student) throw new Error("Student record unavailable");
    await clearSession(req, previousToken);
    const value: Session = { role: "student", studentId: student.id, name: student.name, exp: Date.now() + 30 * 86400000 };
    const accessToken = await setSession(value);
    return Response.json({ ok: true, role: "student", name: student.name, classroom: student.classroom, token: accessToken }, { headers: noStore });
  } catch (error) {
    console.error("Authentication storage error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "تعذر تثبيت جلسة الدخول. حاول مرة أخرى بعد قليل." }, { status: 503, headers: noStore });
  }
}
