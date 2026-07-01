import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { spawnSync } from "node:child_process";

// Runs prerender-meta + SSG automatically after `vite build` finishes the
// client bundle. This makes SSG part of `vite build` itself, so production
// deploys that call `vite build` directly (not `npm run build`) still get
// fully rendered HTML for every route.
function ssgPlugin(): Plugin {
  return {
    name: "lovable-ssg",
    apply: "build",
    closeBundle: {
      order: "post",
      sequential: true,
      async handler() {
        // Skip when we're inside the nested SSR build that build-ssg.mjs itself triggers.
        if (process.env.LOVABLE_SSG_RUNNING === "1") return;
        // Skip if this build IS an SSR build (client build only).
        // @ts-ignore
        if (this.environment?.config?.build?.ssr) return;

        process.env.LOVABLE_SSG_RUNNING = "1";
        try {
          console.log("\n[ssg-plugin] Running prerender-meta...");
          const meta = spawnSync("bunx", ["tsx", "scripts/prerender-meta.ts"], {
            stdio: "inherit",
            shell: false,
          });
          if (meta.status !== 0) {
            console.warn("[ssg-plugin] prerender-meta failed (continuing).");
          }

          console.log("[ssg-plugin] Running build-ssg...");
          const ssg = spawnSync("node", ["scripts/build-ssg.mjs"], {
            stdio: "inherit",
            shell: false,
          });
          if (ssg.status !== 0) {
            throw new Error("build-ssg.mjs exited with code " + ssg.status);
          }
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
