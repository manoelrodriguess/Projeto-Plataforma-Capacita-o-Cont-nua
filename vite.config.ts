import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";

const PROJECT_ROOT = fileURLToPath(new URL(".", import.meta.url));
const FRONTEND_ROOT = path.join(PROJECT_ROOT, "apps", "frontend");
const SHARED_ROOT = path.join(PROJECT_ROOT, "packages", "shared");
const LOG_DIR = path.join(FRONTEND_ROOT, "public");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);

type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines: string[] = [];
    let keptBytes = 0;

    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}\n`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
    /* ignore trim errors */
  }
}

function writeToLogFile(source: LogSource, entries: unknown[]) {
  if (entries.length === 0) return;

  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);

  const lines = entries.map((entry) => {
    const ts = new Date().toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });

  fs.appendFileSync(logPath, `${lines.join("\n")}\n`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

function vitePluginDebug(): Plugin {
  return {
    name: "vite-plugin-debug",
    configureServer(server: ViteDevServer) {
      return () => {
        server.middlewares.use("/api/debug/logs", (req, res) => {
          if (req.method !== "POST") {
            res.writeHead(405, { "Content-Type": "text/plain" });
            res.end("Method Not Allowed");
            return;
          }

          const handlePayload = (payload: any) => {
            if (payload.consoleLogs?.length > 0) {
              writeToLogFile("browserConsole", payload.consoleLogs);
            }
            if (payload.networkRequests?.length > 0) {
              writeToLogFile("networkRequests", payload.networkRequests);
            }
            if (payload.sessionEvents?.length > 0) {
              writeToLogFile("sessionReplay", payload.sessionEvents);
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
          };

          const reqBody = (req as { body?: unknown }).body;
          if (reqBody && typeof reqBody === "object") {
            try {
              handlePayload(reqBody);
            } catch (e) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, error: String(e) }));
            }
            return;
          }

          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });

          req.on("end", () => {
            try {
              const payload = JSON.parse(body);
              handlePayload(payload);
            } catch (e) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, error: String(e) }));
            }
          });
        });
      };
    },
  };
}

function vitePluginStorageProxy(): Plugin {
  return {
    name: "vite-plugin-storage-proxy",
    configureServer(server: ViteDevServer) {
      return () => {
        server.middlewares.use("/api/storage/get", (req, res) => {
          if (req.method !== "POST") {
            res.writeHead(405, { "Content-Type": "text/plain" });
            res.end("Method Not Allowed");
            return;
          }

          const key = (req as any).body?.key;
          if (!key) {
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end("Missing 'key' parameter");
            return;
          }

          const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(
            /\/+$/,
            ""
          );
          const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;

          if (!forgeBaseUrl || !forgeKey) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Storage proxy not configured");
            return;
          }

          (async () => {
            try {
              const forgeUrl = new URL("v1/storage/presign/get", forgeBaseUrl + "/");
              forgeUrl.searchParams.set("path", key);

              const forgeResp = await fetch(forgeUrl, {
                headers: { Authorization: `Bearer ${forgeKey}` },
              });

              if (!forgeResp.ok) {
                res.writeHead(502, { "Content-Type": "text/plain" });
                res.end("Storage backend error");
                return;
              }

              const { url } = (await forgeResp.json()) as { url: string };
              if (!url) {
                res.writeHead(502, { "Content-Type": "text/plain" });
                res.end("Empty signed URL");
                return;
              }

              res.writeHead(307, { Location: url, "Cache-Control": "no-store" });
              res.end();
            } catch {
              res.writeHead(502, { "Content-Type": "text/plain" });
              res.end("Storage proxy error");
            }
          })();
        });
      };
    },
  };
}

const plugins = [react(), tailwindcss(), vitePluginDebug(), vitePluginStorageProxy()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.join(FRONTEND_ROOT, "src"),
      "@shared": SHARED_ROOT,
      "@assets": path.join(PROJECT_ROOT, "attached_assets"),
    },
  },
  envDir: PROJECT_ROOT,
  root: FRONTEND_ROOT,
  build: {
    outDir: path.join(PROJECT_ROOT, "dist", "public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    allowedHosts: ["localhost"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
