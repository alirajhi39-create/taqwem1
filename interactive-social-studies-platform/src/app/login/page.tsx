import { SCHOOL } from "@/lib/quiz";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <main className="container centered-page" dir="rtl"><div className="login-card"><div className="login-icon">🎓</div><span className="section-kicker">{SCHOOL}</span><h1>دخول الطلاب</h1><p>اكتب اسمك ثم اضغط دخول. الفصل المحدد لهذا التقويم هو السادس ب.</p><form action="/api/enter" method="post" target="_top"><input type="hidden" name="role" value="student"/><input type="hidden" name="classroom" value="السادس ب"/><label>اسم الطالب الثلاثي<input name="name" required minLength={2} placeholder="اكتب اسمك الثلاثي" autoComplete="name"/></label><div className="class-fixed">الفصل الدراسي: <strong>السادس ب</strong></div>{params.error && <div className="alert">{params.error}</div>}<button className="btn btn-primary full" type="submit">دخول وبدء الرحلة</button></form><a className="text-button" href="/">العودة إلى الصفحة الرئيسية</a></div></main>;
}
