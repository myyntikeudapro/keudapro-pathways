// Build-time Static Site Generation (SSG).
//
// Runs AFTER `vite build` + `prerender-meta` postbuild step.
//   1. Builds an SSR bundle of src/entry-server.tsx to dist-server/.
//   2. Sets up browser-like globals (jsdom + shims) so the React app can
//      render in Node without crashing on window/localStorage/etc.
//   3. For every public route, renders the full React tree to HTML and
//      injects it into the existing dist/<route>/index.html (which already
//      contains the per-route <head> metadata written by prerender-meta).
//   4. Client-side main.tsx uses hydrateRoot to attach to that markup.
//
// This gives non-JS crawlers (GPTBot, OAI-SearchBot, PerplexityBot,
// ClaudeBot, Bing, LinkedIn, Slack, Facebook, WhatsApp) real page content
// instead of an empty <div id="root">, without moving to SSR at runtime.

import { build } from "vite";
import { readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";

const ROOT = process.cwd();
const DIST = resolve(ROOT, "dist");
const SERVER_OUT = resolve(ROOT, "dist-server");

const ROUTES = [
  "/",
  "/aly",
  "/noste",
  "/kasvu",
  "/muutosturva",
  "/osaaminen",
  "/operaattori",
  "/kumppanit",
  "/yhteystiedot",
];

if (!existsSync(DIST)) {
  console.warn("[ssg] dist/ not found; run `vite build` first. Skipping.");
  process.exit(0);
}

console.log("[ssg] Building SSR bundle...");
await build({
  logLevel: "warn",
  build: {
    ssr: "src/entry-server.tsx",
    outDir: "dist-server",
    emptyOutDir: true,
    rollupOptions: {
      output: { format: "esm", entryFileNames: "entry-server.mjs" },
    },
  },
  ssr: {
    // Bundle everything so the server bundle is self-contained and
    // we don't need node_modules resolution at import time.
    noExternal: true,
  },
});

// ---- Browser-like globals for React SSR --------------------------------
console.log("[ssg] Setting up jsdom globals...");
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
  pretendToBeVisual: true,
});
const { window } = dom;

const g = globalThis;
g.window = window;
g.document = window.document;
try { Object.defineProperty(g, "navigator", { value: window.navigator, configurable: true }); } catch { /* already set */ }
g.HTMLElement = window.HTMLElement;
g.HTMLAnchorElement = window.HTMLAnchorElement;
g.Element = window.Element;
g.Node = window.Node;
g.Text = window.Text;
g.DocumentFragment = window.DocumentFragment;
g.getComputedStyle = window.getComputedStyle.bind(window);
g.localStorage = window.localStorage;
g.sessionStorage = window.sessionStorage;
g.location = window.location;
g.history = window.history;
g.CustomEvent = window.CustomEvent;
g.Event = window.Event;
g.MouseEvent = window.MouseEvent;
g.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
g.cancelAnimationFrame = (id) => clearTimeout(id);

if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
g.matchMedia = window.matchMedia.bind(window);

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
g.IntersectionObserver = NoopObserver;
g.ResizeObserver = NoopObserver;
g.MutationObserver = window.MutationObserver ?? NoopObserver;

// ---- Load the SSR bundle -----------------------------------------------
const entryPath = join(SERVER_OUT, "entry-server.mjs");
if (!existsSync(entryPath)) {
  console.error("[ssg] SSR bundle not found at", entryPath);
  process.exit(1);
}
const mod = await import(pathToFileURL(entryPath).href);
const render = mod.render;
if (typeof render !== "function") {
  console.error("[ssg] entry-server.mjs did not export a render() function.");
  process.exit(1);
}

// ---- Render each route -------------------------------------------------
function injectBody(shellHtml, appHtml) {
  // Replace the empty root div's inner content with the rendered app.
  // Handles both `<div id="root"></div>` and `<div id="root" />`.
  const openTag = /<div\s+id="root"[^>]*>/;
  const match = shellHtml.match(openTag);
  if (!match) {
    console.warn("[ssg] Could not find <div id=\"root\"> in shell HTML.");
    return shellHtml;
  }
  const startIdx = match.index + match[0].length;
  const endIdx = shellHtml.indexOf("</div>", startIdx);
  if (endIdx === -1) return shellHtml;
  return shellHtml.slice(0, startIdx) + appHtml + shellHtml.slice(endIdx);
}

let ok = 0;
let failed = 0;
for (const route of ROUTES) {
  const filePath =
    route === "/"
      ? join(DIST, "index.html")
      : join(DIST, route.replace(/^\//, ""), "index.html");

  if (!existsSync(filePath)) {
    console.warn(`[ssg] Skipping ${route} — no shell at ${filePath}`);
    continue;
  }

  try {
    // Reset location for each route so components reading window.location
    // during SSR (e.g. canonical builders) see the right URL.
    try {
      window.history.replaceState(null, "", route);
    } catch {}

    const { html } = render(route);
    const shell = readFileSync(filePath, "utf-8");
    const out = injectBody(shell, html);
    writeFileSync(filePath, out);
    console.log(`[ssg] ✓ ${route} (${html.length.toLocaleString()} chars)`);
    ok++;
  } catch (err) {
    failed++;
    console.error(`[ssg] ✗ ${route} — ${err?.message ?? err}`);
    if (err?.stack) console.error(err.stack.split("\n").slice(0, 6).join("\n"));
  }
}

// Clean up the SSR bundle — not needed at runtime.
try {
  rmSync(SERVER_OUT, { recursive: true, force: true });
} catch {}

console.log(`[ssg] Done. Rendered ${ok} routes, ${failed} failed.`);
if (failed > 0) process.exit(1);
