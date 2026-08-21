const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const OUT = path.join(__dirname, "..", "docs", "screenshots");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // Full wallet modal (scroll Freighter into view)
  await page.goto("https://web-sandy-one-51.vercel.app", {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.getByRole("button", { name: /connect wallet/i }).first().click();
  await page.waitForTimeout(700);
  const dialog = page.locator('[role="dialog"]');
  await dialog.waitFor({ state: "visible" });
  await dialog.screenshot({ path: path.join(OUT, "05-wallet-picker.png") });
  console.log("wrote 05-wallet-picker.png");

  // Pretty test output card
  const testText = fs.readFileSync(path.join(OUT, "test-output.txt"), "utf8");
  const cleaned = testText
    .replace(/\u001b\[[0-9;]*m/g, "")
    .split(/\r?\n/)
    .filter((line) => !line.includes("CategoryInfo") && !line.includes("FullyQualified") && !line.includes("NativeCommand") && !line.includes("Temporary") && line.trim() !== "")
    .join("\n")
    .trim();

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:#0b1220;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#e2e8f0}
  .wrap{padding:32px}
  .card{background:#111827;border:1px solid #334155;border-radius:16px;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,.45)}
  h1{margin:0 0 8px;font:600 22px/1.2 Inter,system-ui;color:#fff}
  .ok{color:#34d399;font-size:13px;margin-bottom:16px}
  pre{margin:0;white-space:pre-wrap;font-size:13px;line-height:1.55;color:#cbd5e1}
  .pass{color:#34d399}
  </style></head><body><div class="wrap"><div class="card">
  <h1>RouteProof frontend tests</h1>
  <div class="ok">Vitest · 8 files · 36 tests passed</div>
  <pre>${cleaned
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/✓/g, '<span class="pass">✓</span>')}</pre>
  </div></div></body></html>`;

  await page.setContent(html, { waitUntil: "load" });
  await page.locator(".card").screenshot({
    path: path.join(OUT, "10-test-output.png"),
  });
  console.log("wrote 10-test-output.png");

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
