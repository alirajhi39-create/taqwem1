import { ensureSchema } from "@/db/ensure";
import { teacherPasswordValid, token } from "@/lib/auth";
import { findOrCreateStudent, startAttempt } from "@/lib/records";

export const dynamic = "force-dynamic";

function redirectTo(_req: Request, location: string) {
  const safe = location.replaceAll("&", "&amp;").replaceAll('"', "%22");
  const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${safe}"><script>location.replace(${JSON.stringify(location)})</script><title>جاري الدخول</title></head><body style="font-family:Tahoma,sans-serif;text-align:center;padding:48px"><p>جاري فتح الصفحة...</p><p><a href="${safe}">اضغط هنا إذا لم يتم التحويل تلقائيًا</a></p></body></html>`;
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const role = String(form?.get("role") || "");
  try {
    await ensureSchema();
    if (role === "teacher") {
      if (!teacherPasswordValid(String(form?.get("password") || ""))) return redirectTo(req, `/teacher?error=${encodeURIComponent("الرقم السري غير صحيح")}`);
      const sid = token({ role: "teacher", exp: Date.now() + 30 * 86400000 });
      return redirectTo(req, `/?k=${encodeURIComponent(sid)}`);
    }
    const student = await findOrCreateStudent(String(form?.get("name") || ""), "السادس ب");
    if (!student) return redirectTo(req, `/login?error=${encodeURIComponent("اكتب اسمك ثم اضغط دخول")}`);
    await startAttempt(student.id, student.name);
    const sid = token({ role: "student", studentId: student.id, name: student.name, exp: Date.now() + 30 * 86400000 });
    return redirectTo(req, `/?k=${encodeURIComponent(sid)}&name=${encodeURIComponent(student.name)}&classroom=${encodeURIComponent(student.classroom)}`);
  } catch {
    return redirectTo(req, `/?error=${encodeURIComponent("تعذر الدخول الآن. حاول مرة أخرى")}`);
  }
}
