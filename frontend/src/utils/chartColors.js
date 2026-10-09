export const chartColors = {
  fatal: "#ec6b82",
  serious: "#e8a83e",
  slight: "#4dbb8a",
  brand: "#9d5fd4",
  brandLight: "#d0b0ec",
  mauve: "#cc6bb0",
  mint: "#4dbb8a",
  amber: "#e8a83e",
  coral: "#ec6b82",
  ink: "#9187a3",
  grid: "#f0eaf7",
};

// A varied, colorful palette for categorical data (weather, road type, etc.)
// where each bar/segment should read as visually distinct at a glance.
export const CATEGORICAL_PALETTE = [
  "#9d5fd4", // lavender
  "#4dbb8a", // mint
  "#e8a83e", // amber
  "#cc6bb0", // mauve/pink
  "#5fa8d3", // sky blue
  "#e0724f", // terracotta
  "#7bc4c4", // teal
  "#b784e0", // light purple
  "#d4a24d", // gold
  "#e88ea0", // rose
];

export const severityColor = (label) => {
  if (label === "Fatal") return chartColors.fatal;
  if (label === "Serious") return chartColors.serious;
  return chartColors.slight;
};

export const categoricalColor = (index) => CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length];
