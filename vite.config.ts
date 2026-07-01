import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { pathToFileURL } from "node:url";

// Runs the lightweight prerender-meta step after `vite build` finishes.
// No React SSR, no jsdom — just per-route index.html with baked <title>,
// meta tags and a hidden <h1>+intro SEO block for crawlers.
function ssgPlugin(): Plugin {
  return {
    name: "lovable-ssg",
    apply: "build",
    closeBundle: {
      order: "post",
      sequential: true,
      async handler() {
        try {
          const scriptsDir = path.resolve(__dirname, "scripts");
          const metaUrl = pathToFileURL(
            path.join(scriptsDir, "prerender-meta.mjs"),
          ).href;
          console.log("\n[ssg-plugin] Running prerender-meta...");
          const meta = await import(metaUrl);
          await meta.runPrerenderMeta();
        } catch (err) {
          console.error("[ssg-plugin] prerender-meta failed:", err);
          // Do not throw — keep the client build output.
        }
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    ssgPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
