// Build-time Static Site Generation (SSG).
//
//   1. Builds an SSR bundle of src/entry-server.tsx to dist-server/.
//   2. Sets up browser-like globals (jsdom + shims) so the React app can
//      render in Node without crashing on window/localStorage/etc.
//   3. For every public route, renders the full React tree to HTML and
//      injects it into the existing dist/<route>/index.html (which already
//      contains the per-route <head> metadata written by prerender-meta).
//   4. Client-side main.tsx uses hydrateRoot to attach to that markup.
//
// Exported as runSSG() so the Vite plugin can call it inline — no subprocess
// spawning (which is unreliable inside Lovable's deploy container).

import { createServer } from "vite";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { JSDOM } from "jsdom";

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

export async function runSSG() {
  const ROOT = process.cwd();
  const DIST = resolve(ROOT, "dist");

  if (!existsSync(DIST)) {
    console.warn("[ssg] dist/ not found; run `vite build` first. Skipping.");
    return;
  }

  // Mark the nested vite operation so the SSG plugin skips itself when
  // vite.config.ts is re-loaded here.
  process.env.LOVABLE_SSG_RUNNING = "1";

  // ---- Browser-like globals for React SSR ------------------------------
  console.log("[ssg] Setting up jsdom globals...");
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/",
    pretendToBeVisual: true,
  });
  const { window } = dom;

  const g = globalThis;
  g.window = window;
  g.document = window.document;
  try { Object.defineProperty(g, "navigator", { value: window.navigator, configurable: true }); } catch {}
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
      matches: false, media: "", onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }
  g.matchMedia = window.matchMedia.bind(window);

  class NoopObserver {
    observe() {} unobserve() {} disconnect() {}
    takeRecords() { return []; }
  }
  g.IntersectionObserver = NoopObserver;
  g.ResizeObserver = NoopObserver;
  g.MutationObserver = window.MutationObserver ?? NoopObserver;

  // ---- Load entry-server via Vite dev SSR (no bundling) ----------------
  console.log("[ssg] Starting Vite SSR loader...");
  const vite = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    logLevel: "warn",
  });

  let render;
  try {
    const mod = await vite.ssrLoadModule("/src/entry-server.tsx");
    render = mod.render;
    if (typeof render !== "function") {
      console.error("[ssg] entry-server.tsx did not export render()");
      await vite.close();
      return;
    }
  } catch (err) {
    console.error("[ssg] Failed to load entry-server:", err?.message ?? err);
    await vite.close();
    return;
  }


  function injectBody(shellHtml, appHtml) {
    const openTag = /<div\s+id="root"[^>]*>/;
    const match = shellHtml.match(openTag);
    if (!match) return shellHtml;
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
      try { window.history.replaceState(null, "", route); } catch {}
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

  await vite.close();
  console.log(`[ssg] Done. Rendered ${ok} routes, ${failed} failed.`);
}

// Standalone execution.
if (import.meta.url === `file://${process.argv[1]}`) {
  runSSG().catch((err) => {
    console.error("[ssg] Fatal:", err);
    process.exit(1);
  });
}
