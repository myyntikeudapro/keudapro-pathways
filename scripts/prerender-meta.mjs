// Prerender per-route <head> metadata into dist/<path>/index.html.
// Exposed as runPrerenderMeta() so the Vite SSG plugin can call it inline
// (no subprocess needed). Also runnable as a standalone script.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { BASE_URL, routes } from "./routes-meta.mjs";

function escapeAttr(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function rewriteHead(html, route) {
  const url = `${BASE_URL}${route.path}`;
  const title = escapeAttr(route.title);
  const description = escapeAttr(route.description);
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${description}" />`,
  );
  out = out.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${url}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${title}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${description}" />`,
  );
  out = out.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${title}" />`,
  );
  out = out.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${description}" />`,
  );
  return out;
}

export async function runPrerenderMeta() {
  const DIST = resolve(process.cwd(), "dist");
  const INDEX = join(DIST, "index.html");
  if (!existsSync(INDEX)) {
    console.warn("[prerender-meta] dist/index.html not found, skipping.");
    return;
  }
  const baseHtml = readFileSync(INDEX, "utf-8");
  let written = 0;
  for (const route of routes) {
    const html = rewriteHead(baseHtml, route);
    if (route.path === "/") {
      writeFileSync(INDEX, html);
    } else {
      const dir = join(DIST, route.path.replace(/^\//, ""));
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "index.html"), html);
    }
    written++;
  }
  console.log(`[prerender-meta] wrote ${written} per-route index.html files`);
}

// Allow standalone execution too.
if (import.meta.url === `file://${process.argv[1]}`) {
  runPrerenderMeta();
}
