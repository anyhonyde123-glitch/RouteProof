const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const OUT = path.join(__dirname, "..", "docs", "screenshots");
const BASE = process.env.DEMO_URL || "https://web-sandy-one-51.vercel.app";

async function shot(page, name, options = {}) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: !!options.fullPage });
  console.log("wrote", name);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  // Desktop landing
  const desktop = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await desktop.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await desktop.waitForTimeout(1200);
  await shot(desktop, "01-landing-desktop.png");

  await desktop.goto(`${BASE}/app`, { waitUntil: "networkidle", timeout: 60000 });
  await desktop.waitForTimeout(1500);
  await shot(desktop, "02-dashboard-desktop.png");

  await desktop.goto(`${BASE}/app/shipments`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await desktop.waitForTimeout(1500);
  await shot(desktop, "03-shipments-desktop.png");

  await desktop.goto(`${BASE}/verify`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await desktop.waitForTimeout(1000);
  await shot(desktop, "04-verify-desktop.png");

  // Try open wallet modal
  await desktop.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  const connect = desktop.getByRole("button", { name: /connect wallet/i });
  if (await connect.count()) {
    await connect.first().click();
    await desktop.waitForTimeout(800);
    await shot(desktop, "05-wallet-picker.png");
    await desktop.keyboard.press("Escape");
  }

  // Mobile landing + app
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  await mobile.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await mobile.waitForTimeout(1200);
  await shot(mobile, "06-landing-mobile.png");

  await mobile.goto(`${BASE}/app`, { waitUntil: "networkidle", timeout: 60000 });
  await mobile.waitForTimeout(1500);
  await shot(mobile, "07-dashboard-mobile.png");

  await mobile.goto(`${BASE}/verify`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await mobile.waitForTimeout(1000);
  await shot(mobile, "08-verify-mobile.png");

  // GitHub Actions page
  const ci = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await ci.goto(
    "https://github.com/anyhonyde123-glitch/RouteProof/actions",
    { waitUntil: "networkidle", timeout: 60000 },
  );
  await ci.waitForTimeout(2000);
  await shot(ci, "09-cicd-actions.png");

  await browser.close();
  console.log("done");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
