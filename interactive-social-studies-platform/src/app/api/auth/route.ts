import { ensureSchema } from "@/db/ensure";
import { clearSessionResponse, jsonWithSession, teacherPasswordValid } from "@/lib/auth";
import { findOrCreateStudent, startAttempt, teacherDashboard } from "@/lib/records";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body.action === "logout") return clearSessionResponse();
  try {
    await ensureSchema();
    if (body.role === "teacher") {
      if (!teacherPasswordValid(String(body.password || ""))) return Response.json({ error: "الرقم السري غير صحيح." }, { status: 401 });
      return jsonWithSession({ ok: true, role: "teacher", ...(await teacherDashboard()) }, { role: "teacher", exp: Date.now() + 30 * 86400000 });
    }
    const student = await findOrCreateStudent(String(body.name || ""), String(body.classroom || ""));
    if (!student) return Response.json({ error: "اكتب اسمك واسم فصلك للدخول إلى التقويم." }, { status: 400 });
    const state = await startAttempt(student.id, student.name);
    return jsonWithSession({ ok: true, role: "student", name: student.name, ...state }, { role: "student", studentId: student.id, name: student.name, exp: Date.now() + 30 * 86400000 });
  } catch {
    return Response.json({ error: "تعذر إكمال الدخول. حاول مرة أخرى." }, { status: 500 });
  }
}
