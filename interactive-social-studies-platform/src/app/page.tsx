import HomeClient from "@/components/home-client";
import { ensureSchema } from "@/db/ensure";
import { decode, type Session } from "@/lib/auth";
import { readKey } from "@/lib/keys";
import { findOrCreateStudent, studentState, teacherDashboard } from "@/lib/records";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ k?: string; error?: string; panel?: string; name?: string; classroom?: string }> }) {
  const params = await searchParams;
  let initial: { kind: "student"; sessionKey: string; user: { name: string }; attempt: { id: number; startedAt: string; finishedAt: string | null; score: number; status: string } | null; answers: { id?: number; question: number; response: unknown; score: number; correct: boolean; needsReview: boolean; feedback: string }[] } | { kind: "teacher"; sessionKey: string; records: unknown[]; average: number; difficulty: { title: string; average: number }[] } | null = null;
  let notice = params.error || "";
  try {
    await ensureSchema();
    let session: Session | null = params.k ? decode(params.k) : null;
    if (!session && params.k) {
      const saved = await readKey(params.k).catch(() => null);
      if (saved?.role === "student" && saved.studentId) session = { role: "student", studentId: Number(saved.studentId), name: saved.name || "", exp: Date.now() + 86400000 };
      if (saved?.role === "teacher") session = { role: "teacher", exp: Date.now() + 86400000 };
    }
    if ((!session || session.role !== "student") && params.name && params.classroom) {
      const student = await findOrCreateStudent(params.name, params.classroom);
      if (student) session = { role: "student", studentId: student.id, name: student.name, exp: Date.now() + 86400000 };
    }
    if (session?.role === "student" && session.studentId) {
      const state = await studentState(Number(session.studentId), session.name || params.name || "");
      initial = { kind: "student", sessionKey: params.k || "student", ...JSON.parse(JSON.stringify(state)) };
      notice = "";
    } else if (session?.role === "teacher") {
      initial = { kind: "teacher", sessionKey: params.k || "teacher", ...JSON.parse(JSON.stringify(await teacherDashboard())) };
      notice = "";
    } else if (params.k) notice = "تعذر فتح الصفحة. أعد تسجيل الدخول.";
  } catch {
    notice = notice || "تعذر الاتصال بقاعدة البيانات. حاول مرة أخرى.";
  }
  return <HomeClient initial={initial as never} notice={notice} panel={params.panel || ""} />;
}
