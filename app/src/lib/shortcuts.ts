"use client";

const FOCUS_KEY = "aureo:focus-target";

export function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return (
    el?.tagName === "INPUT" ||
    el?.tagName === "TEXTAREA" ||
    el?.tagName === "SELECT" ||
    Boolean(el?.isContentEditable)
  );
}

export function requestFocus(targetId: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(FOCUS_KEY, targetId);
  } catch {
    // ignore
  }
}

export function consumeFocusRequest(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(FOCUS_KEY);
    if (value) window.sessionStorage.removeItem(FOCUS_KEY);
    return value;
  } catch {
    return null;
  }
}

export function tryFocusById(targetId: string): boolean {
  if (typeof document === "undefined") return false;
  const el = document.getElementById(targetId) as HTMLElement | null;
  if (!el) return false;
  if (typeof (el as HTMLInputElement).select === "function") {
    try {
      (el as HTMLInputElement).select();
    } catch {
      // ignore
    }
  }
  el.focus();
  return true;
}

export function focusPageSearch(): boolean {
  return tryFocusById("hero-q") || tryFocusById("jobs-q");
}

