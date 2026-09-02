// IndexNow: ilmoittaa uudet tai päivitetyt URL-osoitteet Bingille ja muille
// IndexNow-yhteensopiville hakukoneille.
// Käyttö: bun run indexnow            (kaikki sitemapin reitit)
//         bun run indexnow /aly /kasvu (vain valitut reitit)
import { BASE_URL, routes } from "./routes-meta.mjs";
import { readdirSync } from "node:fs";

const host = new URL(BASE_URL).hostname;
const key = readdirSync("public").find((f) => /^[0-9a-f]{32}\.txt$/.test(f))?.replace(/\.txt$/, "");
if (!key) {
  console.error("IndexNow-avaintiedostoa ei löytynyt public/-kansiosta.");
  process.exit(1);
}

const args = process.argv.slice(2);
const paths = args.length ? args : routes.map((r) => r.path);
const urlList = paths.map((p) => `${BASE_URL}${p.startsWith("/") ? p : `/${p}`}`);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation: `${BASE_URL}/${key}.txt`, urlList }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} (${urlList.length} URL)`);
if (!res.ok) console.error(await res.text());
