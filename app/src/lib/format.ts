export function formatCurrencyRange(options: {
  currency?: string;
  min?: number | null;
  max?: number | null;
}) {
  const { currency = "USD", min, max } = options;

  if (min == null && max == null) {
    return null;
  }

  const formatter = new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  if (min != null && max != null) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }

  if (min != null) {
    return `From ${formatter.format(min)}`;
  }

  return `Up to ${formatter.format(max as number)}`;
}

export function formatPostedDate(date?: string | null) {
  if (!date) return null;
  const posted = new Date(date);
  const now = new Date();
  const diff = Math.max(0, now.getTime() - posted.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export function clampTrustScore(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  return Math.min(100, Math.max(0, Math.round(value)));
}
