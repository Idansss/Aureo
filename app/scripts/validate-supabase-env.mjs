import { existsSync, readFileSync } from "node:fs";
import dns from "node:dns/promises";

function loadLocalEnvFallback() {
  if (!existsSync(".env.local")) return;

  const env = readFileSync(".env.local", "utf8");
  for (const line of env.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

function fail(message) {
  console.error(`[env] ${message}`);
  process.exit(1);
}

loadLocalEnvFallback();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  fail("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

let parsed;
try {
  parsed = new URL(supabaseUrl);
} catch {
  fail("NEXT_PUBLIC_SUPABASE_URL must be a valid URL.");
}

if (parsed.protocol !== "https:") {
  fail("NEXT_PUBLIC_SUPABASE_URL must use https.");
}

if (!parsed.hostname.endsWith(".supabase.co")) {
  fail("NEXT_PUBLIC_SUPABASE_URL must be a Supabase project URL ending in .supabase.co.");
}

const projectRef = parsed.hostname.replace(/\.supabase\.co$/, "");
if (!/^[a-z0-9]{20}$/.test(projectRef)) {
  fail(`Invalid Supabase project ref "${projectRef}". It should be 20 lowercase letters/numbers.`);
}

if (process.env.SKIP_SUPABASE_DNS_CHECK === "1") {
  console.log("[env] Supabase DNS check skipped.");
  process.exit(0);
}

try {
  await dns.lookup(parsed.hostname);
  console.log(`[env] Supabase URL resolves: ${parsed.hostname}`);
} catch {
  console.warn(
    `[env] Warning: Supabase host does not resolve: ${parsed.hostname}. ` +
      "Auth and data requests will fail until NEXT_PUBLIC_SUPABASE_URL is corrected in Vercel Environment Variables.",
  );
}
