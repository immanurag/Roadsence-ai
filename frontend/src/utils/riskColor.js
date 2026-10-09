// Traffic-light semantics — intuitive for non-technical readers without
// needing to learn what "Moderate" vs "High" means: green is fine, amber is
// caution, red/rose is danger. Kept inside the app's pastel lavender palette.
export const RISK_COLORS = {
  Low: "#4dbb8a",
  Moderate: "#e8a83e",
  High: "#ec6b82",
  Critical: "#d94569",
};

export const RISK_BADGE_CLASSES = {
  Low: "bg-mint-400/15 text-mint-500",
  Moderate: "bg-amber-400/20 text-amber-500",
  High: "bg-coral-400/15 text-coral-500",
  Critical: "bg-coral-600/15 text-coral-600",
};

export function riskColor(level) {
  return RISK_COLORS[level] || RISK_COLORS.Moderate;
}
