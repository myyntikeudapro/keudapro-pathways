// Prerender per-route <head> metadata AND a minimal SEO body block
// (an <h1> + intro paragraph) into dist/<path>/index.html.
//
// The React app hydrates on top of this block and replaces it visually,
// but crawlers (Googlebot, GPTBot, Bing, LinkedIn, Slack) see the
// route-specific <h1> and description in the static HTML.
//
// No React SSR, no jsdom, no sub-build — safe for Lovable's deploy container.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { BASE_URL, routes } from "./routes-meta.mjs";

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rewriteHead(html, route) {
  const url = `${BASE_URL}${route.path}`;
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
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

// Inject an SEO block inside <div id="root">. React replaces it on hydration
// (createRoot's render() clears the container's children before mounting).
// Inline styles hide it from users while keeping it visible to crawlers.
function injectSeoBlock(html, route) {
  const h1 = escapeHtml(route.h1 ?? route.title);
  const intro = escapeHtml(route.intro ?? route.description);
  const seoBlock =
    `<div data-ssg-seo style="position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;">` +
    `<h1>${h1}</h1><p>${intro}</p></div>`;
  return html.replace(
    /(<div\s+id="root"[^>]*>)/,
    `$1${seoBlock}`,
  );
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
    let html = rewriteHead(baseHtml, route);
    html = injectSeoBlock(html, route);
    if (route.path === "/") {
      writeFileSync(INDEX, html);
    } else {
      const dir = join(DIST, route.path.replace(/^\//, ""));
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "index.html"), html);
    }
    written++;
  }
  console.log(`[prerender-meta] wrote ${written} per-route index.html files with SEO block`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runPrerenderMeta();
}
