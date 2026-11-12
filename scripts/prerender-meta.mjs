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
import { alySeoBodyHtml, alyJsonLd } from "./aly-seo.mjs";
const pksService = JSON.parse(readFileSync(new URL("../src/data/tyohonvalmennusPks.json", import.meta.url), "utf-8"));
const aseptiikka = JSON.parse(readFileSync(new URL("../src/data/aseptiikka.json", import.meta.url), "utf-8"));

function aseptiikkaSeoBodyHtml() {
  return aseptiikka.sections.map(section => `<h2>${escapeHtml(section.title)}</h2>${section.paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join("")}`).join("")
    + `<h2>Koulutuksen teemat</h2><ul>${aseptiikka.themes.map(text => `<li>${escapeHtml(text)}</li>`).join("")}</ul>`
    + `<h2>Tilaa koulutus organisaatiollesi</h2>${aseptiikka.steps.map(step => `<h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p>`).join("")}<a href="mailto:${aseptiikka.contactEmail}">Pyydä tarjous: ${aseptiikka.contactEmail}</a>`;
}

const pksTranslations = Object.fromEntries(["en", "sv"].map(language => [language, JSON.parse(readFileSync(new URL(`../src/data/pks/${language}.json`, import.meta.url), "utf-8"))]));
const pksUi = JSON.parse(readFileSync(new URL("../src/data/pks/ui.json", import.meta.url), "utf-8"));
function pksSeoBodyHtml(service = pksService, ui = pksUi.fi) {
  const items = list => list.map(item => `<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p>`).join("");
  return `<p>${escapeHtml(service.intro)}</p><h2>${escapeHtml(ui.join)}</h2><p>${escapeHtml(service.entry.intro)}</p>`
    + items(service.steps)
    + `<h2>${escapeHtml(ui.audience)}</h2><p>${escapeHtml(service.audience)}</p><ul>${service.situations.map(text => `<li>${escapeHtml(text)}</li>`).join("")}</ul>`
    + `<h2>${escapeHtml(ui.examples)}</h2>${items(service.examples)}<p>${escapeHtml(service.examplesNote)}</p>`
    + `<h2>${escapeHtml(ui.everyday)}</h2>${items(service.everyday)}`
    + `<h2>${escapeHtml(ui.faq)}</h2>${service.faq.map(item => `<h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p>`).join("")}`
    + `<h2>${escapeHtml(ui.providers)}</h2><p>${escapeHtml(service.ownCoach)}</p><p>${escapeHtml(service.providers.join(" · "))}</p>`;
}


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

// Inject an SEO block inside <div id="root">. React removes it on mount
// (main.tsx drops [data-ssg-seo] and renders a fresh root).
// Inline styles hide it from users while keeping it visible to crawlers.
function injectSeoBlock(html, route, extraBody = "") {
  const h1 = escapeHtml(route.h1 ?? route.title);
  const intro = escapeHtml(route.intro ?? route.description);
  const seoBlock =
    `<div data-ssg-seo style="position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;">` +
    `<h1>${h1}</h1><p>${intro}</p>${extraBody}</div>`;
  return html.replace(
    /(<div\s+id="root"[^>]*>)/,
    `$1${seoBlock}`,
  );
}

function injectJsonLd(html, schemas) {
  if (!schemas?.length) return html;
  const tags = schemas
    .map(
      (s) =>
        `<script type="application/ld+json">${JSON.stringify(s).replace(/</g, "\\u003c")}</script>`,
    )
    .join("\n    ");
  return html.replace("</head>", `  ${tags}\n  </head>`);
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
    const isAly = route.path === "/aly";
    const pksLanguage = route.path === `${pksService.path}/en` ? "en" : route.path === `${pksService.path}/sv` ? "sv" : "fi";
    const isPks = route.path === pksService.path || route.path === `${pksService.path}/en` || route.path === `${pksService.path}/sv`;
    const currentPks = { ...pksService, ...(pksTranslations[pksLanguage] ?? {}), path: route.path };
    if (isPks) {
      html = html.replace(/<html[^>]*>/, `<html lang="${pksLanguage}">`);
      html = html.replace("</head>", ["fi", "en", "sv"].map(lang => `<link rel="alternate" hreflang="${lang}" href="${BASE_URL}${pksService.path}${lang === "fi" ? "" : `/${lang}`}" />`).join("\n") + `<link rel="alternate" hreflang="x-default" href="${BASE_URL}${pksService.path}" /></head>`);
    }
    html = injectSeoBlock(html, route, isAly ? alySeoBodyHtml() : isPks ? pksSeoBodyHtml(currentPks, pksUi[pksLanguage]) : route.path === aseptiikka.path ? aseptiikkaSeoBodyHtml() : "");
    if (isPks) html = injectJsonLd(html, [
      { "@context": "https://schema.org", "@type": "Service", name: currentPks.title, description: currentPks.description, url: `${BASE_URL}${currentPks.path}`, provider: { "@type": "Organization", name: "KeudaPRO" }, areaServed: currentPks.cities.map(name => ({ "@type": "City", name })), offers: { "@type": "Offer", price: currentPks.priceEuros, priceCurrency: "EUR" } },
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: currentPks.faq.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
    ]);
    if (route.path === aseptiikka.path) html = injectJsonLd(html, [{ "@context": "https://schema.org", "@type": "Course", name: aseptiikka.title, description: aseptiikka.description, url: `${BASE_URL}${aseptiikka.path}`, provider: { "@type": "Organization", name: "KeudaPRO" }, timeRequired: "PT2H", courseMode: "online", inLanguage: "fi" }]);
    if (isAly) html = injectJsonLd(html, alyJsonLd());
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
