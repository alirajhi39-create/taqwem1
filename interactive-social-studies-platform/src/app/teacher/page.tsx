import { SCHOOL } from "@/lib/quiz";

export const dynamic = "force-dynamic";

export default async function TeacherPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <main className="container centered-page" dir="rtl"><div className="login-card"><div className="login-icon">🔒</div><span className="section-kicker">{SCHOOL}</span><h1>لوحة تحكم المعلم</h1><p>أدخل الرقم السري للوصول إلى نتائج التقويم.</p><form action="/api/enter" method="post"><input type="hidden" name="role" value="teacher"/><label>الرقم السري<input className="password-input" name="password" type="password" dir="ltr" inputMode="numeric" required placeholder="أدخل الرقم السري" autoComplete="current-password"/></label>{params.error && <div className="alert">{params.error}</div>}<button className="btn btn-primary full" type="submit">دخول لوحة المعلم</button></form><a className="text-button" href="/">العودة إلى الصفحة الرئيسية</a></div></main>;
}
