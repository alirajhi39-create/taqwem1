import { chromium } from "playwright";
import assert from "node:assert/strict";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const TEST_NAME = "اختبار تحديث التقويم";
const browser = await chromium.launch({ headless: true });
const problems = [];
const correct = [
  ["c", "a", "d", "b"],
  [false, true, false, true],
  [0, 0, 2],
  { result: "q4-result-a", reason: "q4-reason-a" },
  ["q5-r1", "q5-r2", "q5-r3"],
  { cause: "q6-cause-a", result: "q6-result-a" },
  { cause: "q7-cause-a", result: "q7-result-a" },
  { cause: "q8-cause-a", result: "q8-result-a" },
  { bayah: "الإدارة والحكم", schools: "التعليم", children: "التعليم", palaces: "العمران", guards: "الأمن", sharia: "الأمن", heir: "الإدارة والحكم", guests: "العمران" },
];
async function call(page, path, body) {
  return page.evaluate(async ({ path, body }) => {
    const token = localStorage.getItem("unit3_session_v2");
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, sessionToken: token }) });
    return { status: response.status, data: await response.json() };
  }, { path, body });
}
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 950 } });
  page.on("pageerror", error => problems.push(error.message));
  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await page.getByLabel("اسم الطالب الثلاثي").fill(TEST_NAME);
  await page.getByLabel("الفصل الدراسي").selectOption("b");
  await page.getByRole("button", { name: "دخول وبدء الرحلة" }).click();
  await page.waitForURL("**/assessment");
  await page.locator(".question-card h1").waitFor();
  const first = await call(page, "/api/quiz", { action: "state" });
  assert.ok(first.data.attempt.layout?.version === 1);
  const firstLayout = first.data.attempt.layout;
  const instructionSize = await page.locator(".question-instruction").evaluate(element => parseFloat(getComputedStyle(element).fontSize));
  assert.ok(instructionSize >= 16, `Instruction font too small: ${instructionSize}`);

  const rows = page.locator(".sort-row");
  const before = await page.locator(".sort-text").allTextContents();
  await rows.nth(0).dragTo(rows.nth(2));
  const after = await page.locator(".sort-text").allTextContents();
  assert.notDeepEqual(after, before, "Drag and drop should reorder event cards");

  for (let question = 1; question <= 9; question++) {
    const saved = await call(page, "/api/quiz", { action: "save", attemptId: first.data.attempt.id, question, response: correct[question - 1] });
    assert.equal(saved.data.answer.score, 10, `Question ${question} should grade correct`);
    assert.equal(saved.data.answer.needsReview, false, `Question ${question} should be objective`);
  }
  const finished = await call(page, "/api/quiz", { action: "finish", attemptId: first.data.attempt.id });
  assert.equal(finished.data.attempt.score, 90);
  const retry = await call(page, "/api/quiz", { action: "start" });
  assert.notEqual(retry.data.attempt.id, first.data.attempt.id);
  assert.notDeepEqual(retry.data.attempt.layout, firstLayout, "A new attempt should shuffle the layout");

  await page.goto(`${base}/assessment`, { waitUntil: "networkidle" });
  await page.locator(".question-card h1").waitFor();
  const optionChecks = [
    { index: 3, texts: ["قيام الدولة السعودية الثانية واستقرار الحكم فيها", "تدمير الدرعية والحاجة إلى عاصمة جديدة للدولة"] },
    { index: 4, texts: ["قوة مبادئ الدولة السعودية الأولى ورسوخها في النفوس", "تأييد الناس ومساندتهم لعودة الحكم السعودي", "قيادة الإمام تركي بن عبدالله وشجاعته في استعادة الحكم"] },
    { index: 5, texts: ["شجاعته ووطنيته وتخطيطه وقيادته الحكيمة", "تحقيق حلمه بتأسيس الدولة السعودية الثانية"] },
    { index: 6, texts: ["كثرة قتلى القوات العثمانية المعتدية في المعركة", "سُمّيت معركة الحلوة بمعركة الروم"] },
    { index: 7, texts: ["توجيه أنصاره والتواصل معهم من السجن، ثم قيادة المقاومة بعد عودته", "الانتصار على الحملات العثمانية المعتدية"] },
  ];
  for (const check of optionChecks) {
    await page.locator(".number-grid button").nth(check.index).click();
    for (const text of check.texts) await page.getByRole("button", { name: text, exact: true }).click();
    await page.getByRole("button", { name: /^تحقق/ }).click();
    await page.locator(".feedback.success").waitFor();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".number-grid button").nth(3).click().catch(async () => { await page.goto(`${base}/assessment`, { waitUntil: "networkidle" }); });
  const mobileSize = await page.locator(".question-instruction").evaluate(element => parseFloat(getComputedStyle(element).fontSize));
  assert.ok(mobileSize >= 15, `Mobile instruction font too small: ${mobileSize}`);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  assert.deepEqual(problems, [], `Browser errors: ${problems.join("; ")}`);
  console.log("PASS larger fonts, Q1 drag/drop, per-attempt shuffle, objective cause/result options Q4-Q8, mobile layout");
} finally {
  await browser.close();
}
