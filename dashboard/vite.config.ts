import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwind from "@tailwindcss/vite";

function debugLogPlugin() {
  return {
    name: "debug-log",
    configureServer() {
      return () => {
        // #region agent log
        try {
          const logPath = path.join(process.cwd(), "..", ".cursor", "debug-492615.log");
          fs.appendFileSync(
            logPath,
            JSON.stringify({
              sessionId: "492615",
              location: "dashboard/vite.config.ts",
              message: "Dashboard Vite server ready",
              data: {
                hypothesisId: "C",
                port: 3002,
                hostname: os.hostname(),
              },
              timestamp: Date.now(),
            }) + "\n",
          );
        } catch (_) {}
        // #endregion
      };
    },
  };
}

export default defineConfig((configEnv) => {
  return {
    server: {
      port: 3002,
      host: "0.0.0.0",
      allowedHosts: true,
    },
    plugins: [
      debugLogPlugin(),
      vue({
        template: {
          compilerOptions: {
            // Needed to prevent hardcoded code blocks from breaking in docs
            whitespace: "preserve",
          },
        },
      }),
      tailwind(),
    ],
  };
});
