"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Award, BookOpen, Check, CheckCircle2, ChevronDown, CircleHelp, ClipboardList, Clock3, Download, GraduationCap, GripVertical, History, Home, LayoutDashboard, LockKeyhole, LogOut, Medal, Menu, MoveDown, Printer, RotateCcw, School, Send, ShieldCheck, Sparkles, Star, Volume2, VolumeX, X } from "lucide-react";
import { categories, choices, civilization, defaultLayout, eventCards, facts, isComplete, MAX_SCORE, optionSlots, optionText, q5Options, questionTitles, SCHOOL, trueFalse, type QuizLayout, type ResponseValue } from "@/lib/quiz";
import { CLASS_OPTIONS } from "@/lib/classrooms";

type Answer = { id?: number; question: number; response: ResponseValue; score: number; correct: boolean; needsReview: boolean; feedback: string };
type Attempt = { id: number; startedAt: string; finishedAt: string | null; score: number; status: string; layout?: QuizLayout | null };
type RecordItem = Attempt & { student: { name: string; classroom: string }; answers: Answer[] };
function freshDrafts(layout: QuizLayout): ResponseValue[] {
  return [[...layout.order], [null, null, null, null] as unknown as boolean[], [null, null, null] as unknown as number[], { result: "", reason: "" }, ["", "", ""], { cause: "", result: "" }, { cause: "", result: "" }, { cause: "", result: "" }, {}];
}
const defaults = freshDrafts(defaultLayout);
const formatDate = (value: string) => new Date(value).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
const percent = (score: number) => Math.round(score / MAX_SCORE * 100);
function describeAnswer(a: Answer) {
  const v = a.response;
  if (a.question === 1 && Array.isArray(v)) return v.map((id, i) => `${i + 1}. ${eventCards.find(c => c.id === id)?.text || id}`).join(" • ");
  if (a.question === 2 && Array.isArray(v)) return v.map((item, i) => `${["أ", "ب", "ج", "د"][i]}: ${item ? "صح" : "خطأ"}`).join(" • ");
  if (a.question === 3 && Array.isArray(v)) return v.map((item, i) => `${["أ", "ب", "ج"][i]}: ${choices[i]?.options[Number(item)] || "—"}`).join(" • ");
  if (a.question === 5 && Array.isArray(v)) return v.map((item, i) => `${i + 1}. ${q5Options.find(option => option.id === item)?.text || item}`).join(" • ");
  if (a.question === 9 && typeof v === "object" && !Array.isArray(v)) return Object.entries(v).map(([id, cat]) => `${civilization.find(c => c.id === id)?.text || id}: ${cat}`).join(" • ");
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map((item, i) => `${i + 1}. ${item}`).join(" • ");
  return Object.entries(v).map(([key, value]) => `${key === "result" ? "النتيجة" : "السبب"}: ${optionText(a.question, key, value)}`).join(" • ");
}
function performance(p: number) { return p >= 90 ? "ممتاز! أنت مؤرخ صغير مبدع." : p >= 80 ? "رائع! لديك معرفة تاريخية مميزة." : p >= 70 ? "جيد جداً، واصل التعلم." : "حاول مرة أخرى، فأنت قادر على تحقيق نتيجة أفضل."; }
const TOKEN_KEY = "unit3_session_v2";
let memoryToken: string | null = null;
function storedToken() {
  if (memoryToken !== null) return memoryToken || null;
  try { return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function saveToken(value: string) {
  memoryToken = value;
  try { localStorage.setItem(TOKEN_KEY, value); localStorage.removeItem("unit3_access_token"); } catch {}
}
function forgetToken() {
  memoryToken = "";
  try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem("unit3_access_token"); } catch {}
}
class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}
async function api(url: string, method = "GET", body?: unknown) {
  let response: Response;
  const headers: Record<string, string> = body ? { "Content-Type": "application/json" } : {};
  const isAuthAction = !!body && typeof body === "object" && "action" in body && (body.action === "logout" || body.action === "verify");
  const isLogin = url === "/api/auth" && method === "POST" && !isAuthAction;
  const accessToken = storedToken();
  let payload: unknown = body;
  if (accessToken && !isLogin) {
    headers.Authorization = `Bearer ${accessToken}`;
    headers["X-Unit3-Session"] = accessToken;
    if (body && typeof body === "object" && !Array.isArray(body)) payload = { ...body, sessionToken: accessToken };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    response = await fetch(url, { method, headers, body: payload ? JSON.stringify(payload) : undefined, cache: "no-store", credentials: "include", signal: controller.signal });
  } catch {
    throw new ApiError("تعذر الاتصال بالخادم. تحقق من الاتصال ثم حاول مرة أخرى.", 0);
  } finally {
    clearTimeout(timeout);
  }
  const data = await response.json().catch(() => ({ error: "استجابة غير متوقعة من الخادم. حاول مرة أخرى." }));
  if (!response.ok) throw new ApiError(data.error || "حدث خطأ، حاول مجددًا", response.status);
  return data;
}

export type AppView = "home" | "login" | "quiz" | "result" | "teacherLogin" | "teacher" | "assessment";
export default function HomePage({ initialView }: { initialView?: AppView } = {}) {
  const router = useRouter();
  const [view, setView] = useState<AppView>(initialView || "home");
  const [name, setName] = useState(""); const [classroom, setClassroom] = useState("b"); const [password, setPassword] = useState("");
  const [user, setUser] = useState(""); const [attempt, setAttempt] = useState<Attempt | null>(null); const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [drafts, setDrafts] = useState<ResponseValue[]>(defaults); const [layout, setLayout] = useState<QuizLayout>(defaultLayout); const [current, setCurrent] = useState(1); const [review, setReview] = useState(false);
  const [draggingSort, setDraggingSort] = useState<number | null>(null); const [dragOverSort, setDragOverSort] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null); const [sound, setSound] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [teacherData, setTeacherData] = useState<{ records: RecordItem[]; average: number; difficulty: { title: string; average: number }[] } | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null); const [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => {
    let active = true;
    async function restore() {
      if (initialView === "teacher") {
        try {
          const data = await api("/api/teacher", "POST", { action: "list" });
          if (active) setTeacherData(data);
        } catch (error) {
          if (!active) return;
          if (error instanceof ApiError && error.status === 401) {
            forgetToken();
            window.location.replace("/teacher/login");
          } else {
            setError(error instanceof Error ? error.message : "تعذر تحميل لوحة المعلم.");
          }
        }
        return;
      }
      try {
        const data = await api("/api/quiz", "POST", { action: "state" });
        if (!active) return;
        setUser(data.user.name);
        const map: Record<number, Answer> = {};
        const activeLayout = data.attempt?.layout || defaultLayout;
        setLayout(activeLayout);
        const next = freshDrafts(activeLayout);
        if (data.attempt) {
          setAttempt(data.attempt);
          for (const answer of data.answers) {
            map[answer.question] = answer;
            next[answer.question - 1] = answer.response;
          }
          setAnswers(map);
          if (data.attempt.status === "in_progress") {
            try {
              const saved = localStorage.getItem(`unit3-draft-${data.attempt.id}`);
              if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) parsed.forEach((value: ResponseValue, index: number) => { if (!map[index + 1] && index < 9) next[index] = value; });
              }
            } catch {}
          }
          setDrafts(next);
          const first = Array.from({ length: 9 }, (_, index) => index + 1).find(question => !map[question]);
          setCurrent(first || 1);
        }
        if (initialView === "assessment") {
          if (!data.attempt) {
            const created = await api("/api/quiz", "POST", { action: "start" });
            if (!active) return;
            const createdLayout = created.attempt.layout || defaultLayout;
            setAttempt(created.attempt); setLayout(createdLayout); setDrafts(freshDrafts(createdLayout));
          }
          setView(data.attempt?.status === "completed" ? "result" : "quiz");
        } else if (!initialView && data.attempt?.status === "completed") {
          setView("result");
        }
      } catch (error) {
        if (!active) return;
        const status = error instanceof ApiError ? error.status : 0;
        if (status === 401) {
          if (initialView === "assessment") { forgetToken(); window.location.replace("/login"); }
          else if (!initialView) setUser("");
          return;
        }
        if (initialView === "assessment" || !initialView) setError(error instanceof Error ? error.message : "تعذر فتح التقويم.");
      }
    }
    restore();
    return () => { active = false; };
  }, [initialView, router]);
  useEffect(() => {
    if (attempt?.status === "in_progress") {
      try { localStorage.setItem(`unit3-draft-${attempt.id}`, JSON.stringify(drafts)); } catch {}
    }
  }, [drafts, attempt]);
  function update(value: ResponseValue) { setDrafts(prev => prev.map((x, i) => i === current - 1 ? value : x)); }
  function renderOptionSlot(question: number, key: string) {
    const slot = optionSlots[question]?.find(item => item.key === key);
    if (!slot) return null;
    const ids = layout.optionOrders[`${question}:${key}`] || slot.options.map(option => option.id);
    const raw = drafts[question - 1];
    const value = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, string> : {};
    return <div className="option-card-list" role="group" aria-label={slot.label}>{ids.map(id => { const option = slot.options.find(item => item.id === id); if (!option) return null; return <button type="button" key={id} className={`option-card ${value[key] === id ? "selected" : ""}`} onClick={() => update({ ...value, [key]: id })}><span className="radio-dot"/>{option.text}</button>; })}</div>;
  }
  function beep() { if (!sound) return; try { const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = 660; gain.gain.value = 0.08; osc.start(); osc.stop(ctx.currentTime + 0.12); osc.onended = () => ctx.close(); } catch {} }
  async function studentLogin() {
    const previousToken = storedToken();
    setBusy(true); setError(""); forgetToken();
    try {
      const data = await api("/api/auth", "POST", { name, classroom, role: "student", previousToken: previousToken || undefined });
      if (!data.token) throw new Error("لم تصل جلسة الدخول من الخادم. حاول مرة أخرى.");
      saveToken(data.token);
      const verified = await api("/api/auth", "POST", { action: "verify", token: data.token });
      if (!verified.authenticated || verified.role !== "student") throw new Error("تعذر تثبيت جلسة الطالب. اضغط دخول مرة أخرى.");
      setUser(data.name);
      window.location.assign("/assessment");
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function start() { if (!user && !storedToken()) { router.push("/login"); return; } setBusy(true); setError(""); try { const data = await api("/api/quiz", "POST", { action: "start" }); const nextLayout = data.attempt.layout || defaultLayout; setAttempt(data.attempt); setLayout(nextLayout); if (attempt?.status === "completed") { setAnswers({}); setDrafts(freshDrafts(nextLayout)); setCurrent(1); } setView("quiz"); setReview(false); } catch (e) { if (e instanceof ApiError && e.status === 401) { forgetToken(); setUser(""); router.push("/login"); } else setError((e as Error).message); } finally { setBusy(false); } }
  async function check() { if (!attempt) return; if (!isComplete(current, drafts[current - 1])) { setError("أكمل إجابتك أولاً لتتحقق منها."); return; } setBusy(true); setError(""); try { const data = await api("/api/quiz", "POST", { action: "save", attemptId: attempt.id, question: current, response: drafts[current - 1] }); setAnswers(prev => ({ ...prev, [current]: data.answer })); beep(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  async function finish() { if (!attempt) return; const missing = Array.from({ length: 9 }, (_, i) => i + 1).filter(q => !answers[q] || !isComplete(q, drafts[q - 1]) || JSON.stringify(answers[q].response) !== JSON.stringify(drafts[q - 1])); if (missing.length) { setError(`هناك إجابات لم تُحفظ بعد: ${missing.join("، ")}. انتقل إليها وتحقق من إجابتك قبل التسليم.`); setCurrent(missing[0]); return; } if (!window.confirm("هل أنت مستعد لتسليم التقويم؟ لن تتمكن من تعديل إجاباتك بعد التسليم.")) return; setBusy(true); setError(""); try { const data = await api("/api/quiz", "POST", { action: "finish", attemptId: attempt.id }); setAttempt(data.attempt); localStorage.removeItem(`unit3-draft-${attempt.id}`); setView("result"); setReview(false); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  async function teacherLogin() {
    const previousToken = storedToken();
    setBusy(true); setError(""); forgetToken();
    try {
      const data = await api("/api/auth", "POST", { role: "teacher", password, previousToken: previousToken || undefined });
      if (!data.token) throw new Error("لم تصل جلسة الدخول من الخادم. حاول مرة أخرى.");
      saveToken(data.token);
      const verified = await api("/api/auth", "POST", { action: "verify", token: data.token });
      if (!verified.authenticated || verified.role !== "teacher") throw new Error("تعذر تثبيت جلسة المعلم. اضغط دخول مرة أخرى.");
      window.location.assign("/teacher");
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function changeScore(id: number, score: number) { setBusy(true); try { await api("/api/teacher", "PATCH", { answerId: id, score }); setTeacherData(await api("/api/teacher")); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  async function downloadCsv() {
    try {
      const token = storedToken();
      const response = await fetch("/api/teacher", { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { "X-Unit3-Session": token, Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ action: "export", format: "csv", sessionToken: token || undefined }), credentials: "include", cache: "no-store" });
      if (!response.ok) throw new Error("تعذر تصدير النتائج.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a"); link.href = url; link.download = "unit3-results.csv"; link.click(); URL.revokeObjectURL(url);
    } catch (e) { setError((e as Error).message); }
  }
  async function logout() { try { await api("/api/auth", "POST", { action: "logout" }); } catch {} forgetToken(); window.location.assign("/"); }
  const answered = Object.keys(answers).length; const p = percent(attempt?.score || 0);
  const activeAnswer = answers[current]; const changed = activeAnswer && JSON.stringify(activeAnswer.response) !== JSON.stringify(drafts[current - 1]);
  return <div className="app-shell" dir="rtl">
    <header className="site-header"><div className="container header-inner">
      <a className="brand" href="/" aria-label="الصفحة الرئيسية"><span className="brand-icon"><School size={25} strokeWidth={1.8}/></span><span><strong>مدرسة العروس الابتدائية</strong><small>منصة الدراسات الاجتماعية التفاعلية</small></span></a>
      <nav className={mobileMenu ? "header-nav open" : "header-nav"}><a href="/"><Home size={16}/> الرئيسية</a><a href={user ? "/assessment" : "/login"}><GraduationCap size={16}/> {user ? "التقويم" : "دخول الطلاب"}</a><a className={view === "teacher" ? "nav-active" : ""} href="/teacher"><LayoutDashboard size={16}/> لوحة المعلم</a>{user && <span className="user-pill"><span className="online-dot"/> مرحبًا، {user.split(" ")[0]}</span>}{(user || initialView === "teacher") && <button onClick={logout} aria-label="تسجيل الخروج"><LogOut size={17}/></button>}</nav>
      <button className="mobile-menu" onClick={() => setMobileMenu(!mobileMenu)} aria-label="القائمة"><Menu size={24}/></button>
    </div></header>
    {error && (view === "home" || view === "result") && <div className="container"><div className="alert" role="alert"><CircleHelp size={18}/>{error}</div></div>}
    {view === "assessment" && !attempt && <main className="container centered-page"><div className="login-card"><div className="login-icon"><BookOpen size={30}/></div><h1>{error ? "تعذر فتح التقويم" : "نجهّز رحلتك التعليمية..."}</h1><p>{error || "جاري استعادة تقدمك وفتح التقويم."}</p>{error && <><button className="btn btn-primary full" onClick={() => window.location.reload()}>إعادة المحاولة <RotateCcw size={17}/></button><a className="text-button" href="/login">العودة إلى دخول الطلاب</a></>}</div></main>}
    {view === "teacher" && !teacherData && <main className="container centered-page"><div className="login-card"><div className="login-icon"><LayoutDashboard size={30}/></div><h1>{error ? "تعذر تحميل النتائج" : "جاري تحميل النتائج..."}</h1><p>{error || "نستعيد بيانات الطلاب من لوحة المعلم."}</p>{error && <><button className="btn btn-primary full" onClick={() => window.location.reload()}>إعادة المحاولة <RotateCcw size={17}/></button><a className="text-button" href="/teacher/login">العودة إلى دخول المعلم</a></>}</div></main>}
    {view === "home" && <>
      <section className="hero"><div className="container hero-grid"><div className="hero-content"><div className="eyebrow"><span className="eyebrow-line"/> الدراسات الاجتماعية <span>•</span> الصف السادس الابتدائي</div><div className="unit-badge"><Sparkles size={15}/> الوحدة الثالثة — الصفحات ٧١–٧٣</div><h1>رحلة في تاريخ<br/><em>الدولة السعودية الثانية</em></h1><p className="hero-lead">أهلاً بك يا بطل! حان وقت اختبار معلوماتك التاريخية. استعد لاكتشاف ما تعلمته من أحداث وشخصيات صنعت تاريخ وطننا.</p><div className="hero-actions"><button className="btn btn-primary btn-lg" onClick={start} disabled={busy}>ابدأ التقويم <ArrowLeft size={20}/></button><span className="hero-subnote"><ShieldCheck size={17}/> تُحفظ إجاباتك وتقدمك تلقائيًا</span></div><div className="hero-stats"><div><strong>٠٩</strong><span>أسئلة متنوعة</span></div><i/><div><strong>١٥</strong><span>دقيقة مقترحة</span></div><i/><div><strong>متوسط</strong><span>مستوى التقويم</span></div></div></div>
      <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-star star-one">✦</div><div className="art-star star-two">✧</div><div className="art-circle"><div className="sun"/><div className="horizon"/><div className="fort"><div className="fort-roof"/><div className="fort-body"><span/><span/><span/></div><div className="fort-door"/></div><div className="palm palm-right"><span>✳</span><i/></div><div className="palm palm-left"><span>✳</span><i/></div></div><div className="float-card card-top"><span className="float-icon"><History size={22}/></span><span>استكشف تاريخنا <b>بخطوات ممتعة</b></span></div><div className="float-card card-bottom"><span className="float-icon gold"><Medal size={21}/></span><span>أنجز التقويم <b>واحصل على شهادتك</b></span></div></div></div></section>
      <section className="overview container"><div className="section-heading"><div><span className="section-kicker">رحلتك التعليمية</span><h2>كل ما تحتاجه لتبدأ بثقة</h2></div><p>خطوات بسيطة، تجربة ممتعة، وإنجاز يستحق الاحتفال.</p></div><div className="feature-grid"><div className="feature-card"><div className="feature-icon blue"><ClipboardList size={26}/></div><h3>أسئلة تفاعلية</h3><p>تسعة أنشطة متنوعة بين السحب والترتيب والاختيار والتصنيف وبطاقات السبب والنتيجة.</p></div><div className="feature-card"><div className="feature-icon peach"><CheckCircle2 size={26}/></div><h3>تعلّم من إجابتك</h3><p>تغذية راجعة ومعلومات تاريخية مفيدة بعد كل سؤال.</p></div><div className="feature-card"><div className="feature-icon mint"><Award size={26}/></div><h3>احتفل بإنجازك</h3><p>نتيجتك وشهادة إتمام إلكترونية قابلة للطباعة.</p></div></div></section>
      <section className="container bottom-cta"><div><span className="section-kicker">جاهز للانطلاق؟</span><h2>التاريخ ينتظرك يا بطل!</h2><p>كل سؤال فرصة جديدة لتتعلم شيئًا عن وطنك.</p></div><button className="btn btn-white" onClick={start}>ابدأ رحلتك الآن <ArrowLeft size={18}/></button></section>
    </>}
    {(view === "login" || view === "teacherLogin") && <main className="container centered-page"><div className="login-card"><div className="login-icon">{view === "login" ? <GraduationCap size={32}/> : <LockKeyhole size={29}/>}</div><span className="section-kicker">{SCHOOL}</span><h1>{view === "login" ? "دخول الطلاب" : "لوحة تحكم المعلم"}</h1><p>{view === "login" ? "تقويم الوحدة الثالثة — السادس ب" : "نتائج تقويم الوحدة الثالثة — السادس ب"}</p><form autoComplete="off" onSubmit={e => { e.preventDefault(); view === "login" ? studentLogin() : teacherLogin(); }}>
      {view === "login" ? <><label>اسم الطالب الثلاثي<input name="name" autoComplete="off" value={name} onChange={e => setName(e.target.value)} required minLength={5}/></label><label>الفصل الدراسي<select name="classroom" autoComplete="off" value={classroom} onChange={e => setClassroom(e.target.value)} required>{CLASS_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label></> : <label>الرقم السري للمعلم<input type="password" name="password" inputMode="numeric" autoComplete="off" value={password} onChange={e => setPassword(e.target.value)} required/></label>}
      {error && <div className="alert" role="alert">{error}</div>}<button type="submit" className="btn btn-primary full" disabled={busy}>{busy ? "جاري التحقق من الدخول..." : view === "login" ? "دخول وبدء الرحلة" : "دخول لوحة المعلم"} <ArrowLeft size={18}/></button></form><a className="text-button" href="/">العودة إلى الصفحة الرئيسية</a></div></main>}
    {view === "quiz" && attempt && <main className="container quiz-layout"><aside className="quiz-aside"><div className="aside-top"><div className="aside-icon"><BookOpen size={23}/></div><span>تقويم الوحدة الثالثة</span><h2>الدولة السعودية الثانية</h2><p>الصف السادس الابتدائي — الفصل ب</p></div><div className="aside-progress"><div><span>تقدمك في التقويم</span><b>{answered} / ٩</b></div><div className="progress-track"><span style={{ width: `${answered / 9 * 100}%` }}/></div></div><div className="question-nav"><span className="aside-label">الأسئلة</span><div className="number-grid">{questionTitles.map((_, i) => <button key={i} className={`${current === i + 1 ? "active" : ""} ${answers[i + 1] ? "done" : ""}`} onClick={() => { setCurrent(i + 1); setError(""); setSelectedCard(null); }}>{answers[i + 1] ? <Check size={17}/> : i + 1}</button>)}</div></div></aside>
      <div className="quiz-main"><div className="quiz-topline"><div className="breadcrumbs">تقويم الوحدة الثالثة <span>/</span> السؤال {current} من ٩</div><button className="sound-toggle" onClick={() => setSound(!sound)}>{sound ? <Volume2 size={18}/> : <VolumeX size={18}/>} <span>الصوت {sound ? "مفعّل" : "مغلق"}</span></button></div><div className="mobile-progress"><span>السؤال {current} من ٩</span><div className="progress-track"><span style={{ width: `${current / 9 * 100}%` }}/></div></div>
      <div className="question-card"><div className="question-head"><span className="question-count">السؤال {String(current).padStart(2, "0")}</span><span className="question-type">{current === 1 ? "سحب وإفلات" : current === 2 || current === 3 || current === 9 ? "نشاط تفاعلي" : "اختيار السبب والنتيجة"}</span></div><h1>{questionTitles[current - 1]}</h1><p className="question-instruction">{["رتّب الأحداث من الأقدم إلى الأحدث: اسحب البطاقة من مقبضها وأفلتها في المكان المناسب، أو استخدم الأسهم.", "ضع علامة صح أو خطأ أمام كل عبارة من العبارات الآتية.", "اختر إجابة واحدة صحيحة لكل فقرة.", "اختر بطاقة النتيجة المناسبة للنشاط الأول، وبطاقة السبب المناسبة للنشاط الثاني.", "اختر ثلاثة أسباب تفسّر عودة الدولة السعودية في دورها الثاني.", "اختر السبب والنتيجة المناسبين لنبذة عن الإمام تركي بن عبدالله بن محمد بن سعود.", "اختر السبب والنتيجة اللذين يفسّران تسمية معركة الحلوة بمعركة الروم.", "اختر السبب والنتيجة اللذين يوضحان كيف انتصر الإمام فيصل بن تركي برغم سجنه.", "صنّف الجوانب الحضارية للدولتين السعوديتين الأولى والثانية. اسحب البطاقة أو اضغط عليها ثم اختر التصنيف."][current - 1]}</p>
      <div className={`answer-area ${review ? "read-only" : ""}`} key={current}>
        {current === 1 && <div className="sort-list">{(drafts[0] as string[]).map((id, index) => { const card = eventCards.find(c => c.id === id)!; return <div className={`sort-row ${draggingSort === index ? "dragging" : ""} ${dragOverSort === index ? "drop-target" : ""}`} draggable={!review} onDragStart={e => { e.dataTransfer.setData("text/plain", String(index)); e.dataTransfer.effectAllowed = "move"; setDraggingSort(index); }} onDragEnd={() => { setDraggingSort(null); setDragOverSort(null); }} onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverSort(index); }} onDrop={e => { e.preventDefault(); const from = Number(e.dataTransfer.getData("text/plain")); if (Number.isInteger(from) && from >= 0 && from < 4 && from !== index) { const next = [...(drafts[0] as string[])]; const [moved] = next.splice(from, 1); next.splice(index, 0, moved); update(next); } setDraggingSort(null); setDragOverSort(null); }} key={id} data-sort-index={index}><span className="sort-index">{index + 1}</span><span className="sort-text">{card.text}</span><div className="sort-controls"><button disabled={index === 0} onClick={() => { const next = [...(drafts[0] as string[])]; [next[index], next[index - 1]] = [next[index - 1], next[index]]; update(next); }} aria-label="تحريك للأعلى">↑</button><button disabled={index === 3} onClick={() => { const next = [...(drafts[0] as string[])]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; update(next); }} aria-label="تحريك للأسفل">↓</button></div><span className="drag-handle"><GripVertical size={24}/></span></div>; })}</div>}
        {current === 2 && <div className="statement-list">{layout.trueFalse.map((original, position) => <div className="statement" key={original}><div className="statement-label"><span className="letter">{["أ", "ب", "ج", "د"][position]}</span><span>{trueFalse[original]}</span></div><div className="binary-options"><button className={(drafts[1] as boolean[])[original] === true ? "chosen yes" : ""} onClick={() => { const v = [...drafts[1] as boolean[]]; v[original] = true; update(v); }}><Check size={18}/> صح</button><button className={(drafts[1] as boolean[])[original] === false ? "chosen no" : ""} onClick={() => { const v = [...drafts[1] as boolean[]]; v[original] = false; update(v); }}><X size={18}/> خطأ</button></div></div>)}</div>}
        {current === 3 && <div className="choice-list">{choices.map((group, i) => <div className="choice-group" key={i}><h3><span>{["أ", "ب", "ج"][i]}</span> {group.title}</h3><div className="option-grid">{(layout.choices[i] || group.options.map((_, index) => index)).map(original => <button className={(drafts[2] as number[])[i] === original ? "option selected" : "option"} key={original} onClick={() => { const v = [...drafts[2] as number[]]; v[i] = original; update(v); }}><span className="radio-dot"/>{group.options[original]}</button>)}</div></div>)}</div>}
        {current === 4 && <div className="cause-activities"><div className="activity-label">النشاط الأول</div><div className="cause-grid"><div className="cause-box"><span>السبب</span><p>قوة مبادئ الدولة السعودية الأولى والحكم الرشيد.</p></div><div className="cause-arrow">←</div><div className="cause-box event"><span>الحدث</span><p>تأييد الناس للإمام تركي بن عبدالله مؤسس الدولة السعودية الثانية.</p></div><div className="cause-arrow">←</div><div className="cause-box input-box"><span>النتيجة</span>{renderOptionSlot(4, "result")}</div></div><div className="activity-label second">النشاط الثاني</div><div className="cause-grid"><div className="cause-box input-box"><span>السبب</span>{renderOptionSlot(4, "reason")}</div><div className="cause-arrow">←</div><div className="cause-box event"><span>الحدث</span><p>اتخاذ مدينة الرياض عاصمة للدولة السعودية الثانية بدلاً من الدرعية.</p></div><div className="cause-arrow">←</div><div className="cause-box"><span>النتيجة</span><p>ازدهار مدينة الرياض وتطورها.</p></div></div></div>}
        {current === 5 && (() => { const selected = Array.isArray(drafts[4]) ? (drafts[4] as string[]).filter(Boolean) : []; return <div className="reason-options"><div className="cause-box event result-fixed"><span>النتيجة</span><p>عودة الدولة السعودية في دورها الثاني.</p></div><p className="field-label">اختر ثلاثة أسباب <span>({selected.length}/٣)</span></p><div className="option-card-list">{(layout.q5 || q5Options.map(option => option.id)).map(id => { const option = q5Options.find(item => item.id === id); if (!option) return null; const isSelected = selected.includes(id); return <button type="button" key={id} disabled={selected.length >= 3 && !isSelected} className={`option-card ${isSelected ? "selected" : ""}`} onClick={() => update(isSelected ? selected.filter(item => item !== id) : [...selected, id])}><span className="radio-dot"/>{option.text}</button>; })}</div></div>; })()}
        {current === 6 && <div><div className="keyword-list">{["الشجاعة", "الوطنية", "التخطيط", "تحقيق الحلم", "القيادة"].map(w => <span key={w}><Star size={15}/>{w}</span>)}</div>{review && typeof drafts[5] === "string" ? <p className="legacy-answer">{drafts[5] as string}</p> : <div className="cause-result-grid"><div className="cause-box input-box"><span>السبب</span>{renderOptionSlot(6, "cause")}</div><div className="cause-box input-box"><span>النتيجة</span>{renderOptionSlot(6, "result")}</div></div>}</div>}
        {(current === 7 || current === 8) && <div>{review && typeof drafts[current - 1] === "string" ? <p className="legacy-answer">{drafts[current - 1] as string}</p> : <div className="cause-result-grid"><div className="cause-box input-box"><span>السبب</span>{renderOptionSlot(current, "cause")}</div><div className="cause-box input-box"><span>النتيجة</span>{renderOptionSlot(current, "result")}</div></div>}</div>}
        {current === 9 && <div className="classification"><p className="field-label">البطاقات المتاحة <span>({civilization.filter(c => !(drafts[8] as Record<string,string>)[c.id]).length})</span></p><div className="card-pool">{(layout.civilization || civilization.map(c => c.id)).map(id => civilization.find(c => c.id === id)!).filter(c => c && !(drafts[8] as Record<string,string>)[c.id]).map(c => <button key={c.id} draggable onDragStart={e => e.dataTransfer.setData("text/plain", c.id)} onClick={() => setSelectedCard(c.id)} className={selectedCard === c.id ? "drag-card selected" : "drag-card"}><GripVertical size={17}/>{c.text}</button>)}</div><div className="category-grid">{(layout.categories || categories).map(cat => <div key={cat} className="category-box" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (civilization.some(c => c.id === id)) update({ ...(drafts[8] as Record<string,string>), [id]: cat }); }} onClick={() => { if (selectedCard) { update({ ...(drafts[8] as Record<string,string>), [selectedCard]: cat }); setSelectedCard(null); } }}><h3>{cat}</h3><div className="category-items">{civilization.filter(c => (drafts[8] as Record<string,string>)[c.id] === cat).map(c => <button key={c.id} onClick={e => { e.stopPropagation(); const v = { ...(drafts[8] as Record<string,string>) }; delete v[c.id]; update(v); }}>{c.text} <X size={15}/></button>)}{!civilization.some(c => (drafts[8] as Record<string,string>)[c.id] === cat) && <span>اسحب البطاقة هنا أو اخترها</span>}</div></div>)}</div></div>}
      </div>
      {activeAnswer && !changed && <div className={`feedback ${activeAnswer.correct ? "success" : "thoughtful"}`}><div className="feedback-icon">{activeAnswer.correct ? <CheckCircle2 size={23}/> : <Sparkles size={23}/>}</div><div><strong>{activeAnswer.correct ? "أحسنت! إجابة صحيحة" : activeAnswer.needsReview ? "عمل جميل! إجابتك تحتاج مراجعة المعلم" : "محاولة جيدة، تعلّم من الإجابة"} <span>({activeAnswer.score}/١٠)</span></strong><p>{activeAnswer.feedback}</p><small>{facts[current - 1]}</small></div></div>}
      {error && <div className="alert"><CircleHelp size={18}/>{error}</div>}
      <div className="question-footer"><div className="question-footer-right"><button className="btn btn-outline" disabled={current === 1} onClick={() => { setCurrent(current - 1); setError(""); }}><ArrowRight size={17}/> السابق</button>{!review && <button className="btn btn-primary" onClick={check} disabled={busy}>{busy ? "لحظة..." : activeAnswer && !changed ? "تحقق مرة أخرى" : "تحقق من إجابتي"} <Check size={17}/></button>}</div><button className="btn btn-ghost" onClick={() => { if (current === 9) { if (review) { setView("result"); setReview(false); } else finish(); } else { setCurrent(current + 1); setError(""); } }} disabled={busy}>{current === 9 ? review ? "العودة للنتيجة" : "إنهاء التقويم" : "التالي"} <ArrowLeft size={17}/></button></div>
      </div></div></main>}
    {view === "result" && attempt && <main className="container result-page"><div className="result-banner"><div className="result-medal"><Award size={38}/></div><span>اكتملت رحلتك التعليمية</span><h1>أحسنت يا {user.split(" ")[0]}!</h1><p>{performance(p)}</p><div className="result-score"><strong>{p}٪</strong><span>{attempt.score} من {MAX_SCORE} درجة</span></div></div><div className="result-grid"><div className="result-info card-surface"><h2>تفاصيل النتيجة</h2><div><span>اسم الطالب</span><strong>{user}</strong></div><div><span>المدرسة</span><strong>{SCHOOL}</strong></div><div><span>المادة</span><strong>الدراسات الاجتماعية</strong></div><div><span>الوحدة</span><strong>الثالثة — الدولة السعودية الثانية</strong></div><div><span>تاريخ الإنجاز</span><strong>{formatDate(attempt.finishedAt || attempt.startedAt)}</strong></div></div><div className="result-summary card-surface"><h2>ملخص أدائك</h2><div className="summary-row"><span><CheckCircle2 size={18}/> إجابات كاملة</span><b>{Object.values(answers).filter(a => a.correct).length}</b></div><div className="summary-row"><span><X size={18}/> تحتاج لتحسين</span><b>{Object.values(answers).filter(a => !a.correct).length}</b></div><div className="summary-row"><span><History size={18}/> للمراجعة اليدوية</span><b>{Object.values(answers).filter(a => a.needsReview).length}</b></div><div className="level-badge"><Sparkles size={18}/> المستوى: {p >= 90 ? "ممتاز" : p >= 80 ? "رائع" : p >= 70 ? "جيد جدًا" : "واصل المحاولة"}</div></div></div><div className="result-actions"><button className="btn btn-primary" onClick={() => { setReview(true); setView("quiz"); setCurrent(1); }}>مراجعة الإجابات <BookOpen size={17}/></button><button className="btn btn-outline" onClick={() => window.print()}>طباعة النتيجة <Printer size={17}/></button><button className="btn btn-outline" onClick={() => { document.body.classList.add("print-certificate"); window.print(); setTimeout(() => document.body.classList.remove("print-certificate"), 1000); }}>إصدار شهادة <Award size={17}/></button><button className="btn btn-ghost" onClick={start}>إعادة المحاولة <RotateCcw size={17}/></button></div><div className="certificate"><div className="certificate-border"><School size={32}/><small>{SCHOOL}</small><h2>شهادة إتمام</h2><p>تُمنح هذه الشهادة للطالب / الطالبة</p><strong>{user}</strong><p>لإتمام تقويم الوحدة الثالثة «الدولة السعودية الثانية» في مادة الدراسات الاجتماعية للصف السادس الابتدائي</p><b>النتيجة: {p}٪</b><span>تاريخ الإتمام: {formatDate(attempt.finishedAt || attempt.startedAt)}</span></div></div></main>}
    {view === "teacher" && teacherData && <main className="container teacher-page"><div className="teacher-heading"><div><span className="section-kicker">لوحة المعلم / الدراسات الاجتماعية</span><h1>نتائج تقويم الوحدة الثالثة</h1><p>متابعة أداء طلاب الفصل السادس ب فقط في وحدة الدولة السعودية الثانية.</p></div><div className="teacher-actions"><button className="btn btn-outline" onClick={downloadCsv}><Download size={17}/> تصدير CSV</button><button className="btn btn-primary" onClick={() => window.print()}><Printer size={17}/> طباعة التقرير</button></div></div><div className="teacher-stats"><div><span>إجمالي المحاولات</span><strong>{teacherData.records.length}</strong><ClipboardList size={25}/></div><div><span>المحاولات المكتملة</span><strong>{teacherData.records.filter(r => r.status === "completed").length}</strong><CheckCircle2 size={25}/></div><div><span>متوسط أداء الفصل</span><strong>{teacherData.average}٪</strong><Medal size={25}/></div><div><span>إجابات للمراجعة</span><strong>{teacherData.records.filter(r => r.status === "completed").flatMap(r => r.answers).filter(a => a.needsReview).length}</strong><History size={25}/></div></div><div className="teacher-columns"><div className="teacher-table-wrap card-surface"><h2>سجل الطلاب <span>{teacherData.records.length} محاولة</span></h2><div className="table-scroll"><table><thead><tr><th>الطالب</th><th>التاريخ</th><th>الدرجة</th><th>النسبة</th><th>الحالة</th><th></th></tr></thead><tbody>{teacherData.records.map(r => <tr key={r.id}><td><b>{r.student.name}</b><small>{r.student.classroom}</small></td><td>{formatDate(r.startedAt)}</td><td>{r.score}/٩٠</td><td>{percent(r.score)}٪</td><td><span className={r.status === "completed" ? "status done" : "status pending"}>{r.status === "completed" ? "مكتمل" : "جارٍ"}</span></td><td><button className="table-link" onClick={() => setSelectedRecord(selectedRecord === r.id ? null : r.id)}>التفاصيل <ChevronDown size={15}/></button></td></tr>)}</tbody></table>{!teacherData.records.length && <div className="empty-state">لا توجد محاولات بعد. ستظهر نتائج الطلاب هنا عند بدء التقويم.</div>}</div></div><div className="difficulty card-surface"><h2>الأسئلة الأكثر صعوبة</h2><p>متوسط درجة الطلاب لكل سؤال</p>{teacherData.difficulty.slice(0, 5).map((d, i) => <div className="difficulty-row" key={d.title}><div><span>{i + 1}. {d.title}</span><b>{d.average}٪</b></div><div className="progress-track"><span style={{ width: `${d.average}%` }}/></div></div>)}</div></div>{selectedRecord && (() => { const record = teacherData.records.find(r => r.id === selectedRecord); if (!record) return null; return <div className="student-details card-surface"><div className="details-head"><div><span className="section-kicker">تفاصيل الإجابات</span><h2>{record.student.name} <small>— {record.student.classroom}</small></h2></div><button onClick={() => setSelectedRecord(null)} aria-label="إغلاق"><X size={20}/></button></div><div className="details-grid">{record.answers.sort((a,b) => a.question - b.question).map(a => <div className="detail-answer" key={a.question}><div><strong>س{a.question} — {questionTitles[a.question - 1]}</strong><span>{a.score}/١٠</span></div><p>{describeAnswer(a)}</p>{a.question >= 4 && a.question <= 8 && <label>تعديل الدرجة <select value={a.score} disabled={busy} onChange={e => changeScore(a.id!, Number(e.target.value))}>{Array.from({ length: 11 }, (_, i) => <option value={i} key={i}>{i} / ١٠</option>)}</select>{a.needsReview && <span className="review-needed">تحتاج مراجعة</span>}</label>}</div>)}</div></div>; })()}{error && <div className="alert">{error}</div>}</main>}
    <footer className="footer"><div className="container"><div><School size={19}/><strong>{SCHOOL}</strong><span>•</span><span>الدراسات الاجتماعية — الصف السادس الابتدائي</span></div><small>نتعلم تاريخنا، ونعتز بوطننا © {new Date().getFullYear()}</small></div></footer>
    {review && view === "quiz" && <div className="review-banner">أنت الآن في وضع مراجعة الإجابات. <button onClick={() => { setView("result"); setReview(false); }}>العودة للنتيجة <ArrowLeft size={16}/></button></div>}
  </div>;
}
