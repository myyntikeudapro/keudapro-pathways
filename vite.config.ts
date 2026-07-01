import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { pathToFileURL } from "node:url";

// Runs prerender-meta + SSG automatically after `vite build` finishes the
// client bundle. Executed inline (dynamic import) — no subprocesses, so it
// works reliably inside Lovable's deploy container.
function ssgPlugin(): Plugin {
  return {
    name: "lovable-ssg",
    apply: "build",
    closeBundle: {
      order: "post",
      sequential: true,
      async handler() {
        // Skip when we're inside the nested SSR sub-build that runSSG() triggers.
        if (process.env.LOVABLE_SSG_RUNNING === "1") return;

        try {
          const scriptsDir = path.resolve(__dirname, "scripts");
          const metaUrl = pathToFileURL(
            path.join(scriptsDir, "prerender-meta.mjs"),
          ).href;
          const ssgUrl = pathToFileURL(
            path.join(scriptsDir, "build-ssg.mjs"),
          ).href;

          console.log("\n[ssg-plugin] Running prerender-meta...");
          const meta = await import(metaUrl);
          await meta.runPrerenderMeta();

          console.log("[ssg-plugin] Running build-ssg...");
          const ssg = await import(ssgUrl);
          await ssg.runSSG();
        } catch (err) {
          console.error("[ssg-plugin] SSG failed:", err);
          // Do NOT throw — keep the client build output so the site still deploys
          // (falls back to SPA behavior for that build).
        } finally {
          delete process.env.LOVABLE_SSG_RUNNING;
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
