/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

const APP_DIR = path.join(process.cwd(), "src", "app");
const DEFAULT_PORTS = [3000, 3001, 3002, 3003, 3004, 3005];
const PROBE_PATH = "/status";
const PROBE_MARKER = "data-smoke-marker=\"aureo-status\"";

function isRouteGroup(name) {
  return name.startsWith("(") && name.endsWith(")");
}

function isDynamicSegment(name) {
  return name.startsWith("[") && name.endsWith("]");
}

function normalizeRouteFromSegments(segments) {
  const cleaned = segments.filter((seg) => seg && !isRouteGroup(seg));
  const route = "/" + cleaned.join("/");
  return route === "/index" ? "/" : route;
}

function walkRoutes(dir, segments = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const routes = [];

  const hasPage = entries.some(
    (e) => e.isFile() && /^page\.(t|j)sx?$/.test(e.name),
  );
  if (hasPage) {
    routes.push(normalizeRouteFromSegments(segments));
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("_")) continue;
    const childDir = path.join(dir, entry.name);
    routes.push(...walkRoutes(childDir, [...segments, entry.name]));
  }

  return routes;
}

function pickDynamicValue(route) {
  if (route.includes("/jobs/[id]/pipeline")) return route.replace("[id]", "job-1");
  if (route.includes("/jobs/[id]")) return route.replace("[id]", "job-1");
  if (route.includes("/stories/[slug]")) {
    return route.replace("[slug]", "operating-a-trust-first-talent-pipeline");
  }
  if (route.includes("/u/[username]")) return route.replace("[username]", "aureo-user");
  if (route.includes("/profile/[username]")) return route.replace("[username]", "aureo-user");
  if (route.includes("/employers/[slug]")) return route.replace("[slug]", "northwind");
  return route.replace(/\[[^\]]+\]/g, "sample");
}

function hasDynamic(route) {
  return route.split("/").some((seg) => isDynamicSegment(seg));
}

function deriveRoutes() {
  const raw = walkRoutes(APP_DIR, []);
  const unique = Array.from(new Set(raw)).sort((a, b) => a.localeCompare(b));
  return unique.map((r) => (hasDynamic(r) ? pickDynamicValue(r) : r));
}

function findErrorOverlay(html) {
  const markers = [
    "Runtime Error",
    "Application error: a client-side exception has occurred",
    "__nextjs_original-stack-frame",
    "nextjs-portal",
    "nextjs__container_errors",
  ];
  return markers.find((m) => html.includes(m)) ?? null;
}

async function fetchRoute(baseUrl, route) {
  const url = new URL(route, baseUrl).toString();
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  const res = await fetch(url, { redirect: "manual", signal: controller.signal }).catch((err) => ({
    ok: false,
    status: 0,
    text: async () => String(err),
  }));
  clearTimeout(timeout);
  const ms = Date.now() - start;
  const html = await res.text();
  const marker = findErrorOverlay(html);
  const ok = res.status >= 200 && res.status < 400 && !marker;
  return { route, status: res.status, ok, ms, marker };
}

function printTable(results) {
  const rows = results.map((r) => ({
    route: r.route,
    status: String(r.status).padStart(3, " "),
    ok: r.ok ? "PASS" : "FAIL",
    ms: `${r.ms}ms`.padStart(7, " "),
    marker: r.marker ?? "",
  }));

  const header = `${"ROUTE".padEnd(32)}  ${"ST".padEnd(3)}  ${"OK".padEnd(4)}  ${"TIME".padEnd(7)}  MARKER`;
  console.log(header);
  console.log("-".repeat(header.length));
  for (const row of rows) {
    console.log(
      `${row.route.padEnd(32)}  ${row.status}  ${row.ok.padEnd(4)}  ${row.ms}  ${row.marker}`,
    );
  }
}

function startDevServer() {
  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  const child = spawn(command, ["run", "dev"], {
    stdio: "pipe",
    env: process.env,
    cwd: process.cwd(),
    shell: process.platform === "win32",
    windowsHide: true,
  });

  let ready = false;
  let localUrl = null;
  let fatalError = null;
  let exited = false;
  const logs = [];

  child.stdout.on("data", (buf) => {
    const line = String(buf);
    logs.push(line);
    const localMatch = line.match(/Local:\s+(http:\/\/localhost:\d+)/);
    if (localMatch) {
      localUrl = localMatch[1];
    }
    if (line.includes("Local:") || line.includes("Ready in") || line.includes("localhost:3000")) {
      ready = true;
    }
    process.stdout.write(line);
  });
  child.stderr.on("data", (buf) => {
    const line = String(buf);
    logs.push(line);
    if (line.includes("Unable to acquire lock") || line.includes("EADDRINUSE")) {
      fatalError = "dev-server-lock";
    }
    process.stderr.write(line);
  });
  child.on("exit", () => {
    exited = true;
  });

  return {
    child,
    waitUntilReady: async (timeoutMs = 60000) => {
      const start = Date.now();
      while (!ready && !fatalError && !exited && Date.now() - start < timeoutMs) {
        await new Promise((r) => setTimeout(r, 250));
      }
      return { ready, fatalError, exited };
    },
    getLogs: () => logs.join(""),
    getLocalUrl: () => localUrl,
  };
}

function killProcessTree(child) {
  if (!child || child.killed) return;

  if (process.platform === "win32" && typeof child.pid === "number") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true,
    });
    return;
  }

  child.kill();
}

async function probeServer(baseUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const res = await fetch(new URL(PROBE_PATH, baseUrl).toString(), {
    redirect: "manual",
    signal: controller.signal,
  }).catch(() => null);
  clearTimeout(timeout);

  if (!res) return false;
  if (res.status < 200 || res.status >= 500) return false;
  const html = await res.text().catch(() => "");
  if (html.includes(PROBE_MARKER)) return true;
  // Fallback for older running dev servers that don't include the marker yet.
  return html.includes("App status") && html.includes("Aureo");
}

async function findRunningServer() {
  const ports = process.env.SMOKE_PORTS
    ? process.env.SMOKE_PORTS.split(",").map((p) => Number(p.trim())).filter(Boolean)
    : DEFAULT_PORTS;

  for (const port of ports) {
    const baseUrl = `http://localhost:${port}`;
    // eslint-disable-next-line no-await-in-loop
    const ok = await probeServer(baseUrl);
    if (ok) return baseUrl;
  }

  return null;
}

async function main() {
  let baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
  const routes = deriveRoutes();

  const shouldStartServer = process.env.SMOKE_START_SERVER !== "false";
  const forceStart = process.env.SMOKE_FORCE_START === "true";
  let server = null;

  if (shouldStartServer && !forceStart) {
    const running = await findRunningServer();
    if (running) {
      baseUrl = running;
      console.log(`[smoke] using existing server at ${baseUrl}`);
    } else {
      server = startDevServer();
    }
  } else if (shouldStartServer) {
    server = startDevServer();
  }

  if (server) {
    const status = await server.waitUntilReady();
    if (!status.ready) {
      if (status.fatalError === "dev-server-lock") {
        console.error("[smoke] dev server could not start due to project lock, trying to reuse existing server");
        killProcessTree(server.child);
        const running = await findRunningServer();
        if (!running) {
          console.error("[smoke] no running server found after lock failure");
          process.exit(2);
        }
        baseUrl = running;
      } else {
        console.error("[smoke] dev server did not become ready in time");
        killProcessTree(server.child);
        process.exit(2);
      }
    } else {
      const devUrl = server.getLocalUrl();
      if (devUrl) baseUrl = devUrl;
    }
  }

  const results = [];
  for (const route of routes) {
    // Skip API routes in smoke run; focus on pages.
    if (route.startsWith("/api/")) continue;
    const result = await fetchRoute(baseUrl, route);
    results.push(result);
  }

  printTable(results);

  const failing = results.filter((r) => !r.ok);
  console.log("");
  console.log(`[smoke] total: ${results.length}, passing: ${results.length - failing.length}, failing: ${failing.length}`);
  if (failing.length) {
    console.log("[smoke] failing routes:");
    failing.forEach((r) => console.log(`- ${r.route} (status ${r.status}${r.marker ? `, marker: ${r.marker}` : ""})`));
  }

  if (server) {
    killProcessTree(server.child);
  }

  process.exit(failing.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
