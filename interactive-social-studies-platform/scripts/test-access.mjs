import { chromium } from "playwright";
import assert from "node:assert/strict";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const TEST_NAME = "اختبار الدخول السادس ب";
const TOKEN_KEY = "unit3_session_v2";
const browser = await chromium.launch({ headless: true });
const problems = [];
function watch(page) {
  page.on("pageerror", error => problems.push(error.message));
  page.on("console", message => {
    if (message.type() === "error" && !message.text().includes("401")) problems.push(message.text());
  });
}
async function blockApiCookies(context) {
  await context.route("**/api/**", async route => {
    const headers = { ...(await route.request().allHeaders()) };
    delete headers.cookie;
    const response = await route.fetch({ headers });
    const responseHeaders = { ...response.headers() };
    delete responseHeaders["set-cookie"];
    await route.fulfill({ response, headers: responseHeaders });
  });
}
async function readQuiz(page) {
  const token = await page.evaluate(key => { try { return localStorage.getItem(key); } catch { return null; } }, TOKEN_KEY);
  return page.evaluate(async token => (await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "state", sessionToken: token || undefined }) })).json(), token);
}
async function studentLogin(page, { stale = false } = {}) {
  if (stale) await page.addInitScript(key => {
    if (!sessionStorage.getItem("stale-seeded")) { localStorage.setItem(key, "stale-token-from-an-old-build"); localStorage.setItem("unit3_access_token", "legacy-stale-token"); sessionStorage.setItem("stale-seeded", "1"); }
  }, TOKEN_KEY);
  let loginAuthorization = "not-seen";
  page.on("request", request => {
    if (!request.url().endsWith("/api/auth") || request.method() !== "POST") return;
    try { const body = request.postDataJSON(); if (!body.action && body.role) loginAuthorization = request.headers().authorization || "none"; } catch {}
  });
  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await page.getByLabel("اسم الطالب الثلاثي").fill(TEST_NAME);
  await page.getByLabel("الفصل الدراسي").selectOption("b");
  assert.equal(await page.getByLabel("الفصل الدراسي").inputValue(), "a");
  await page.getByRole("button", { name: "دخول وبدء الرحلة" }).click();
  await page.waitForURL("**/assessment");
  await page.locator(".question-card h1").waitFor();
  assert.equal(loginAuthorization, "none", "A previous session must not be sent with a new login");
  const first = await readQuiz(page);
  assert.equal(first.user.name, TEST_NAME);
  assert.ok(first.attempt?.id);
  const firstQuestionNav = page.locator(".number-grid button").first();
  if (await firstQuestionNav.isVisible()) await firstQuestionNav.click();
  await page.getByRole("button", { name: /^تحقق/ }).click();
  await page.locator(".feedback").waitFor();
  await page.reload({ waitUntil: "networkidle" });
  await page.locator(".question-card h1").waitFor();
  const restored = await readQuiz(page);
  assert.equal(restored.attempt.id, first.attempt.id, "Reload must resume the same attempt");
  assert.ok(restored.answers.length >= 1, "The saved answer must survive reload");
  const expectedQuestion = Array.from({ length: 9 }, (_, index) => index + 1).find(question => !restored.answers.some(answer => answer.question === question)) || 9;
  const displayedQuestion = Number((await page.locator(".question-count").innerText()).match(/\d+/)?.[0]);
  assert.equal(displayedQuestion, expectedQuestion, "Reload must resume the first unanswered question");
  return first;
}
async function teacherLogin(page, password = "139613") {
  await page.goto(`${base}/teacher/login`, { waitUntil: "networkidle" });
  await page.getByLabel("الرقم السري للمعلم").fill(password);
  await page.getByRole("button", { name: "دخول لوحة المعلم" }).click();
  await page.waitForURL("**/teacher");
  await page.getByRole("heading", { name: "نتائج تقويم الوحدة الثالثة" }).waitFor();
}
try {
  const desktop = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const student = await desktop.newPage(); watch(student);
  await studentLogin(student, { stale: true });
  const studentToken = await student.evaluate(key => localStorage.getItem(key), TOKEN_KEY);
  assert.ok(studentToken);
  assert.equal(await student.evaluate(async token => (await fetch("/api/teacher", { headers: { Authorization: `Bearer ${token}` } })).status, studentToken), 401);
  console.log("PASS class B, stale-token replacement, answer persistence, same attempt and first-unanswered resume, student cannot read teacher data");

  await student.goto(`${base}/teacher/login`, { waitUntil: "networkidle" });
  await student.getByLabel("الرقم السري للمعلم").fill("000000");
  await student.getByRole("button", { name: "دخول لوحة المعلم" }).click();
  await student.getByText("الرقم السري غير صحيح. حاول مرة أخرى.").waitFor();
  await student.getByLabel("الرقم السري للمعلم").fill("139613");
  await student.getByRole("button", { name: "دخول لوحة المعلم" }).click();
  await student.waitForURL("**/teacher");
  await student.getByRole("heading", { name: "نتائج تقويم الوحدة الثالثة" }).waitFor();
  await student.getByText(TEST_NAME, { exact: true }).waitFor();
  await student.reload({ waitUntil: "networkidle" });
  await student.getByRole("heading", { name: "نتائج تقويم الوحدة الثالثة" }).waitFor();
  const teacherToken = await student.evaluate(key => localStorage.getItem(key), TOKEN_KEY);
  assert.notEqual(teacherToken, studentToken);
  assert.equal(await student.evaluate(async token => (await fetch("/api/quiz", { headers: { Authorization: `Bearer ${token}` } })).status, teacherToken), 401);
  await student.getByRole("button", { name: "تسجيل الخروج" }).click();
  await student.waitForURL(base + "/");
  assert.equal(await student.evaluate(async token => (await fetch("/api/auth", { headers: { Authorization: `Bearer ${token}` } })).json(), teacherToken).then(x => x.authenticated), false);
  console.log("PASS student-to-teacher login in same browser, wrong password, 139613, reload, role isolation, revoked logout");

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobileStudent = await mobile.newPage(); watch(mobileStudent);
  await mobileStudent.goto(`${base}/`, { waitUntil: "networkidle" });
  await mobileStudent.getByRole("button", { name: "القائمة" }).click();
  await mobileStudent.getByRole("link", { name: "دخول الطلاب" }).click();
  await mobileStudent.getByLabel("اسم الطالب الثلاثي").fill(TEST_NAME);
  await mobileStudent.getByLabel("الفصل الدراسي").selectOption({ label: "السادس ب" });
  await mobileStudent.getByRole("button", { name: "دخول وبدء الرحلة" }).click();
  await mobileStudent.waitForURL("**/assessment");
  await mobileStudent.locator(".question-card h1").waitFor();
  assert.ok(await mobileStudent.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await teacherLogin(mobileStudent);
  console.log("PASS mobile class B selection by label, quiz layout, teacher login");

  const cookieless = await browser.newContext();
  await blockApiCookies(cookieless);
  const cookielessStudent = await cookieless.newPage(); watch(cookielessStudent);
  await studentLogin(cookielessStudent);
  await teacherLogin(cookielessStudent);
  await cookielessStudent.reload({ waitUntil: "networkidle" });
  await cookielessStudent.getByRole("heading", { name: "نتائج تقويم الوحدة الثالثة" }).waitFor();
  console.log("PASS class B and teacher with API cookies blocked");

  const noStorage = await browser.newContext();
  await noStorage.addInitScript(() => { Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Storage blocked", "SecurityError"); } }); });
  const noStorageStudent = await noStorage.newPage(); watch(noStorageStudent);
  await noStorageStudent.goto(`${base}/login`, { waitUntil: "networkidle" });
  await noStorageStudent.getByLabel("اسم الطالب الثلاثي").fill(TEST_NAME);
  await noStorageStudent.getByLabel("الفصل الدراسي").selectOption("b");
  await noStorageStudent.getByRole("button", { name: "دخول وبدء الرحلة" }).click();
  await noStorageStudent.waitForURL("**/assessment");
  await noStorageStudent.locator(".question-card h1").waitFor();
  await teacherLogin(noStorageStudent);
  console.log("PASS class B and teacher with localStorage blocked using secure cookie");

  const arabic = await browser.newContext();
  const arabicTeacher = await arabic.newPage(); watch(arabicTeacher);
  await teacherLogin(arabicTeacher, "١٣٩٦١٣");
  console.log("PASS Arabic-digit teacher password");
  await arabicTeacher.goto(`${base}/login`, { waitUntil: "networkidle" });
  await arabicTeacher.getByLabel("اسم الطالب الثلاثي").fill(TEST_NAME);
  await arabicTeacher.getByLabel("الفصل الدراسي").selectOption("b");
  await arabicTeacher.getByRole("button", { name: "دخول وبدء الرحلة" }).click();
  await arabicTeacher.waitForURL("**/assessment");
  await arabicTeacher.locator(".question-card h1").waitFor();
  const reverseSession = await arabicTeacher.evaluate(async () => (await fetch("/api/auth")).json());
  assert.equal(reverseSession.role, "student");
  console.log("PASS teacher-to-student class B login in same browser");
  assert.deepEqual(problems, [], `Browser errors: ${problems.join("; ")}`);
  console.log("PASS no uncaught browser errors");
} finally {
  await browser.close();
}
