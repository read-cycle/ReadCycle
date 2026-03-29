import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import process from 'node:process';
import { chromium } from 'playwright';

const BASE_URL = process.env.MOBILE_CHECK_BASE_URL ?? 'http://127.0.0.1:4173';
const LOGIN_EMAIL = process.env.MOBILE_CHECK_EMAIL ?? 'nikhilabrolsingh11@gmail.com';
const LOGIN_PASSWORD = process.env.MOBILE_CHECK_PASSWORD ?? 'ragnik4203';
const SERVER_COMMAND = process.env.MOBILE_CHECK_SERVER_COMMAND ?? 'npm';
const SERVER_ARGS = (process.env.MOBILE_CHECK_SERVER_ARGS ?? 'run dev -- --host 127.0.0.1 --port 4173 --strictPort').split(' ');
const OUTPUT_ROOT = process.env.MOBILE_CHECK_OUTPUT_DIR ?? 'artifacts/mobile-compat';
const timestamp = new Date().toISOString().replaceAll(':', '-');
const outputDir = join(process.cwd(), OUTPUT_ROOT, timestamp);
const storageStatePath = join(outputDir, 'storage-state.json');

const routes = [
  { slug: 'landing', path: '/' },
  { slug: 'login', path: '/login' },
  { slug: 'dashboard', path: '/dashboard' },
  { slug: 'browse', path: '/browse' },
  { slug: 'upload', path: '/upload' },
  { slug: 'chats', path: '/chats' }
];

const viewportMatrix = [
  { name: 'iphone-se', width: 320, height: 568, deviceScaleFactor: 2 },
  { name: 'small-android', width: 360, height: 640, deviceScaleFactor: 3 },
  { name: 'iphone-12-mini', width: 360, height: 780, deviceScaleFactor: 3 },
  { name: 'pixel-5', width: 393, height: 851, deviceScaleFactor: 2.75 },
  { name: 'iphone-12-13-14', width: 390, height: 844, deviceScaleFactor: 3 },
  { name: 'pixel-7-pro', width: 412, height: 892, deviceScaleFactor: 3.5 },
  { name: 'iphone-14-plus', width: 428, height: 926, deviceScaleFactor: 3 },
  { name: 'large-phone', width: 480, height: 960, deviceScaleFactor: 2.5 },
  { name: 'fold-portrait', width: 540, height: 720, deviceScaleFactor: 2.5 },
  { name: 'small-tablet-portrait', width: 600, height: 960, deviceScaleFactor: 2 },
  { name: 'ipad-mini-portrait', width: 768, height: 1024, deviceScaleFactor: 2 },
  { name: 'iphone-se-landscape', width: 568, height: 320, deviceScaleFactor: 2 },
  { name: 'small-android-landscape', width: 640, height: 360, deviceScaleFactor: 3 },
  { name: 'iphone-12-landscape', width: 844, height: 390, deviceScaleFactor: 3 },
  { name: 'pixel-7-landscape', width: 892, height: 412, deviceScaleFactor: 3.5 }
];

function log(message) {
  process.stdout.write(`${message}\n`);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 45_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Server not ready yet.
    }

    await wait(1_000);
  }

  throw new Error(`Timed out waiting for dev server at ${url}`);
}

async function isServerReachable(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

function ensureCleanDir(dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function sanitizeSegment(value) {
  return value.replaceAll(/[^a-z0-9-]+/gi, '-').replaceAll(/^-+|-+$/g, '').toLowerCase();
}

function buildViewportContextOptions(viewport) {
  return {
    viewport: { width: viewport.width, height: viewport.height },
    screen: { width: viewport.width, height: viewport.height },
    isMobile: viewport.width < 900,
    hasTouch: viewport.width < 900,
    deviceScaleFactor: viewport.deviceScaleFactor
  };
}

async function settlePage(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
  await wait(1_200);
}

async function inspectPage(page) {
  return page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const root = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(root.scrollWidth, body?.scrollWidth ?? 0);
    const scrollHeight = Math.max(root.scrollHeight, body?.scrollHeight ?? 0);
    const visibleElements = [...document.querySelectorAll('*')].filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none'
      );
    });

    const overflowingElements = visibleElements
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          className: element.className,
          id: element.id,
          right: rect.right,
          bottom: rect.bottom
        };
      })
      .filter((element) => element.right > viewportWidth + 1)
      .slice(0, 10);

    return {
      title: document.title,
      viewportWidth,
      viewportHeight,
      scrollWidth,
      scrollHeight,
      horizontalOverflow: scrollWidth > viewportWidth + 1,
      verticalOverflow: scrollHeight > viewportHeight + 1,
      overflowingElements
    };
  });
}

async function loginAndPersistState(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    screen: { width: 1440, height: 1200 }
  });
  const page = await context.newPage();

  log(`Opening login page at ${BASE_URL}/login`);
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await settlePage(page);

  await page.locator('.input-box').nth(0).evaluate((element, value) => {
    const input = element;
    input.focus();
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, LOGIN_EMAIL);
  await page.locator('.input-box').nth(1).evaluate((element, value) => {
    const input = element;
    input.focus();
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, LOGIN_PASSWORD);
  await page.getByRole('button', { name: 'Log In' }).click();

  const loginDeadline = Date.now() + 30_000;

  while (Date.now() < loginDeadline) {
    if (new URL(page.url()).pathname === '/dashboard') {
      break;
    }

    const toast = page.locator('.Vue-Toastification__toast-body').first();
    const toastCount = await toast.count();

    if (toastCount > 0) {
      const message = (await toast.textContent())?.trim() ?? 'Unknown login failure.';
      await page.screenshot({ path: join(outputDir, 'login-failure.png'), fullPage: true });
      throw new Error(`Login failed before reaching /dashboard: ${message}`);
    }

    await wait(500);
  }

  if (new URL(page.url()).pathname !== '/dashboard') {
    await page.screenshot({ path: join(outputDir, 'login-timeout.png'), fullPage: true });
    throw new Error('Login did not reach /dashboard within 30 seconds.');
  }

  await settlePage(page);
  await context.storageState({ path: storageStatePath });
  await context.close();
}

async function captureViewport(browser, viewport, results) {
  const context = await browser.newContext({
    ...buildViewportContextOptions(viewport),
    storageState: storageStatePath
  });
  const page = await context.newPage();
  const errors = [];

  page.on('pageerror', (error) => {
    errors.push({ type: 'pageerror', message: error.message });
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push({ type: 'console', message: message.text() });
    }
  });

  for (const route of routes) {
    const targetUrl = `${BASE_URL}${route.path}`;
    log(`Checking ${route.slug} at ${viewport.width}x${viewport.height}`);

    try {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      await settlePage(page);

      const metrics = await inspectPage(page);
      const fileName = `${sanitizeSegment(route.slug)}-${sanitizeSegment(viewport.name)}-${viewport.width}x${viewport.height}.png`;
      const screenshotPath = join(outputDir, fileName);

      await page.screenshot({ path: screenshotPath, fullPage: true });

      results.push({
        route: route.path,
        routeSlug: route.slug,
        viewport,
        finalUrl: page.url(),
        screenshotPath,
        metrics,
        errors: [...errors]
      });
    } catch (error) {
      results.push({
        route: route.path,
        routeSlug: route.slug,
        viewport,
        finalUrl: page.url(),
        screenshotPath: null,
        metrics: null,
        errors: [
          ...errors,
          { type: 'exception', message: error instanceof Error ? error.message : String(error) }
        ]
      });
    }

    errors.length = 0;
  }

  await context.close();
}

async function main() {
  ensureCleanDir(outputDir);

  log(`Artifacts will be written to ${outputDir}`);
  let server = null;
  let serverClosed = false;
  const stopServer = () => {
    if (server && !serverClosed) {
      server.kill('SIGTERM');
      serverClosed = true;
    }
  };

  process.on('exit', stopServer);
  process.on('SIGINT', () => {
    stopServer();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    stopServer();
    process.exit(143);
  });

  try {
    const serverAlreadyRunning = await isServerReachable(BASE_URL);

    if (serverAlreadyRunning) {
      log(`Reusing existing server at ${BASE_URL}`);
    } else {
      server = spawn(SERVER_COMMAND, SERVER_ARGS, {
        cwd: process.cwd(),
        stdio: 'pipe',
        shell: process.platform === 'win32'
      });

      server.stdout.on('data', (chunk) => process.stdout.write(`[vite] ${chunk}`));
      server.stderr.on('data', (chunk) => process.stderr.write(`[vite] ${chunk}`));

      await waitForServer(BASE_URL);
    }

    const browser = await chromium.launch();
    const results = [];

    try {
      await loginAndPersistState(browser);

      for (const viewport of viewportMatrix) {
        await captureViewport(browser, viewport, results);
      }
    } finally {
      await browser.close();
    }

    const summary = {
      generatedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      outputDir,
      totalScreenshots: results.filter((result) => result.screenshotPath).length,
      totalChecks: results.length,
      horizontalOverflowCount: results.filter((result) => result.metrics?.horizontalOverflow).length,
      failedChecks: results.filter((result) => result.errors.length > 0).length,
      results
    };

    writeFileSync(join(outputDir, 'summary.json'), JSON.stringify(summary, null, 2));
    log(`Saved ${summary.totalScreenshots} screenshots across ${summary.totalChecks} checks.`);
    log(`Summary written to ${join(outputDir, 'summary.json')}`);
  } finally {
    stopServer();
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
