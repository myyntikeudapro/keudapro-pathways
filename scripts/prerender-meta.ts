// Postbuild: generate per-route dist/<path>/index.html files with route-specific
// <title>, <meta name="description">, <link rel="canonical"> and og:*/twitter:* tags
// baked into the static HTML head. This gives social-preview crawlers (LinkedIn,
// Slack, Facebook, WhatsApp) and non-JS-executing search engines (Bing,
// DuckDuckGo) the correct per-route metadata without needing SSR or Puppeteer.
//
// The React app still hydrates and renders content client-side as before.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, join } from "path";
import { BASE_URL, routes, type RouteMeta } from "./routes-meta";

const DIST = resolve("dist");
const INDEX = join(DIST, "index.html");

if (!existsSync(INDEX)) {
  console.warn("[prerender-meta] dist/index.html not found, skipping.");
  process.exit(0);
}

const baseHtml = readFileSync(INDEX, "utf-8");

function escapeAttr(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function rewriteHead(html: string, route: RouteMeta) {
  const url = `${BASE_URL}${route.path}`;
  const title = escapeAttr(route.title);
  const description = escapeAttr(route.description);

  let out = html;

  // <title>
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);

  // meta name="description"
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${description}" />`,
  );

  // canonical
  out = out.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`,
  );

  // og:url / og:title / og:description
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

  // twitter:title / twitter:description
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
