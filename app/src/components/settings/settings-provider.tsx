"use client";

import * as React from "react";
import { z } from "zod";
import { supabaseBrowser } from "@/lib/supabase/client";

const STORAGE_KEY = "aureo-settings-v1";

const SettingsSchema = z.object({
  account: z.object({
    fullName: z.string(),
    username: z.string(),
    email: z.string(),
  }),
  appearance: z.object({
    density: z.enum(["comfortable", "compact"]),
    fontSize: z.enum(["small", "default", "large"]),
    reduceMotion: z.boolean(),
    highContrast: z.boolean(),
  }),
  notifications: z.object({
    productUpdates: z.boolean(),
    jobMatches: z.boolean(),
    messages: z.boolean(),
    digest: z.enum(["daily", "weekly", "off"]),
    quietHoursEnabled: z.boolean(),
    quietStart: z.string(),
    quietEnd: z.string(),
  }),
  privacy: z.object({
    visibility: z.enum(["public", "employers", "private"]),
    showEmail: z.boolean(),
    blocklist: z.array(z.string()),
    reporting: z.enum(["standard", "strict"]),
  }),
  jobPreferences: z.object({
    roles: z.array(z.string()),
    locations: z.object({
      remote: z.boolean(),
      hybrid: z.boolean(),
      onsite: z.boolean(),
    }),
    salaryMin: z.number(),
    salaryMax: z.number(),
    employmentTypes: z.array(z.string()),
    openToWork: z.boolean(),
    workAuthorization: z.boolean(),
  }),
  accessibility: z.object({
    screenReaderHints: z.boolean(),
    focusRing: z.enum(["standard", "strong"]),
    keyboardShortcuts: z.boolean(),
  }),
  billing: z.object({
    plan: z.enum(["Free", "Pro", "Team"]),
  }),
});

export type AureoSettings = z.infer<typeof SettingsSchema>;

const StoredSettingsSchema = SettingsSchema.omit({ account: true });
type StoredSettings = z.infer<typeof StoredSettingsSchema>;

export const defaultSettings: AureoSettings = {
  account: {
    fullName: "",
    username: "",
    email: "",
  },
  appearance: {
    density: "comfortable",
    fontSize: "default",
    reduceMotion: false,
    highContrast: false,
  },
  notifications: {
    productUpdates: true,
    jobMatches: true,
    messages: true,
    digest: "weekly",
    quietHoursEnabled: false,
    quietStart: "21:00",
    quietEnd: "07:30",
  },
  privacy: {
    visibility: "public",
    showEmail: false,
    blocklist: [],
    reporting: "standard",
  },
  jobPreferences: {
    roles: ["Product Designer", "Frontend Engineer"],
    locations: { remote: true, hybrid: true, onsite: false },
    salaryMin: 90000,
    salaryMax: 160000,
    employmentTypes: ["Full-time"],
    openToWork: true,
    workAuthorization: true,
  },
  accessibility: {
    screenReaderHints: true,
    focusRing: "standard",
    keyboardShortcuts: true,
  },
  billing: {
    plan: "Free",
  },
};

type SettingsContextValue = {
  settings: AureoSettings;
  setSettings: React.Dispatch<React.SetStateAction<AureoSettings>>;
  update: <K extends keyof AureoSettings>(
    section: K,
    value: Partial<AureoSettings[K]>,
  ) => void;
};

const SettingsContext = React.createContext<SettingsContextValue | null>(null);

function applyDocumentPreferences(settings: AureoSettings) {
  const root = document.documentElement;
  root.dataset.density = settings.appearance.density;
  root.dataset.fontSize = settings.appearance.fontSize;
  root.dataset.reduceMotion = String(settings.appearance.reduceMotion);
  root.dataset.highContrast = String(settings.appearance.highContrast);
  root.dataset.focusRing = settings.accessibility.focusRing;
}

function readStoredSettings(): AureoSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = StoredSettingsSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return defaultSettings;
    return { ...defaultSettings, ...parsed.data };
  } catch {
    return defaultSettings;
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<AureoSettings>(() => readStoredSettings());

  React.useEffect(() => {
    const stored = readStoredSettings();
    setSettings(stored);
    applyDocumentPreferences(stored);

    const supabase = supabaseBrowser();
    const syncAccount = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session?.user?.id) return;

      const userId = session.user.id;
      const email = session.user.email ?? "";

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, full_name, username")
        .eq("id", userId)
        .maybeSingle();

      const emailUsername = email ? email.split("@")[0].toLowerCase().replace(/[^a-z0-9-_]/g, "-") : "";

      if (!profile) {
        await supabase.from("profiles").insert({
          id: userId,
          email,
          full_name: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? null,
          username: emailUsername || null,
        } as any);
      } else if (!profile.username && emailUsername) {
        await supabase.from("profiles").update({ username: emailUsername } as any).eq("id", userId);
      } else if (!profile.email && email) {
        await supabase.from("profiles").update({ email } as any).eq("id", userId);
      }

      const { data: refreshed } = await supabase
        .from("profiles")
        .select("email, full_name, username")
        .eq("id", userId)
        .maybeSingle();

      setSettings((prev) => ({
        ...prev,
        account: {
          fullName: String(refreshed?.full_name ?? prev.account.fullName ?? ""),
          username: String(refreshed?.username ?? prev.account.username ?? emailUsername ?? ""),
          email: String(refreshed?.email ?? prev.account.email ?? email ?? ""),
        },
      }));
    };

    syncAccount();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      syncAccount();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const { account: _account, ...prefs } = settings;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs satisfies StoredSettings));
      applyDocumentPreferences(settings);
    } catch {
      // ignore write failures (private mode, quota)
    }
  }, [settings]);

  const update: SettingsContextValue["update"] = React.useCallback((section, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...value },
    }));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, update }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
