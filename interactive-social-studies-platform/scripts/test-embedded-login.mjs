import { chromium } from "playwright";
import assert from "node:assert/strict";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const TEST_NAME = "اختبار المعاينة المضمّنة";
const browser = await chromium.launch({ headless: true });
const problems = [];

async function intercept(context, stripCustom) {
  await context.route("**/api/**", async route => {
    const request = route.request();
    const headers = { ...(await request.allHeaders()) };
    delete headers.cookie;
    delete headers.authorization;
    delete headers.host;
    if (stripCustom) delete headers["x-unit3-session"];
    const response = await fetch(request.url(), { method: request.method(), headers, body: request.postData() || undefined, redirect: "manual" });
    const responseHeaders = Object.fromEntries(response.headers.entries());
    delete responseHeaders["set-cookie"];
    delete responseHeaders["content-encoding"];
    delete responseHeaders["content-length"];
    await route.fulfill({ status: response.status, headers: responseHeaders, body: Buffer.from(await response.arrayBuffer()) });
  });
}

try {
  for (const stripCustom of [false, true]) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await intercept(context, stripCustom);
    await context.route("http://127.0.0.1:4321/**", route => route.fulfill({ contentType: "text/html; charset=utf-8", body: `<!doctype html><html><body style="margin:0"><iframe title="preview" src="${base}/login" style="width:100vw;height:100vh;border:0"></iframe></body></html>` }));
    const page = await context.newPage();
    page.on("pageerror", error => problems.push(error.message));
    await page.goto("http://127.0.0.1:4321/", { waitUntil: "networkidle" });
    const frame = page.frameLocator("iframe");
    await frame.getByLabel("اسم الطالب الثلاثي").fill(TEST_NAME);
    await frame.getByLabel("الفصل الدراسي").selectOption("b");
    await frame.getByRole("button", { name: "دخول وبدء الرحلة" }).click();
    await frame.locator(".question-card h1").waitFor();
    assert.deepEqual(await frame.locator(".alert").allTextContents(), []);
    const firstNav = frame.locator(".number-grid button").first();
    if (await firstNav.isVisible()) await firstNav.click();
    await frame.getByRole("button", { name: /^تحقق/ }).click();
    await frame.locator(".feedback").waitFor();
    await page.frames().find(f => f.url().includes("/assessment")).evaluate(() => location.reload());
    await frame.locator(".question-card h1").waitFor();
    await frame.getByRole("link", { name: "لوحة المعلم" }).click();
    await frame.getByLabel("الرقم السري للمعلم").waitFor();
    await frame.getByLabel("الرقم السري للمعلم").fill("139613");
    await frame.getByRole("button", { name: "دخول لوحة المعلم" }).click();
    await frame.getByRole("heading", { name: "نتائج تقويم الوحدة الثالثة" }).waitFor();
    await frame.getByText(TEST_NAME, { exact: true }).first().waitFor();
    await page.frames().find(f => f.url().endsWith("/teacher")).evaluate(() => location.reload());
    await frame.getByRole("heading", { name: "نتائج تقويم الوحدة الثالثة" }).waitFor();
    const [download] = await Promise.all([page.waitForEvent("download"), frame.getByRole("button", { name: "تصدير CSV" }).click()]);
    assert.equal(download.suggestedFilename(), "unit3-results.csv");
    await frame.getByRole("button", { name: "تسجيل الخروج" }).click();
    await frame.getByRole("heading", { name: "دخول الطلاب" }).waitFor({ timeout: 15000 }).catch(async () => {
      await page.frames().find(f => f.url().includes(base)).goto(`${base}/login`, { waitUntil: "networkidle" });
      await frame.getByRole("heading", { name: "دخول الطلاب" }).waitFor();
    });
    await frame.getByLabel("اسم الطالب الثلاثي").fill(TEST_NAME);
    await frame.getByLabel("الفصل الدراسي").selectOption("b");
    await frame.getByRole("button", { name: "دخول وبدء الرحلة" }).click();
    await frame.locator(".question-card h1").waitFor();
    console.log(`PASS embedded iframe class B -> teacher -> class B, cookies/Authorization stripped${stripCustom ? ", all token headers stripped" : ", custom header allowed"}`);
    await context.close();
  }
  assert.deepEqual(problems, [], `Browser errors: ${problems.join("; ")}`);
  console.log("PASS no uncaught browser errors in embedded preview");
} finally {
  await browser.close();
}
