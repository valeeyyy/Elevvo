/**
 * Solid colour palette — shared by Tailwind (utility classes) and Recharts (raw hex).
 * No gradients anywhere: every surface is a flat tone, depth comes from tonal steps and borders.
 * Each hue has a matching "-soft" step: a solid, dark tint used for badge and icon backgrounds.
 */
export const palette = {
  // Surfaces, darkest to lightest (neutral with a faint violet cast)
  canvas: "#0f0f14",
  surface: "#16161d",
  raised: "#1e1e27",
  hover: "#262631",
  line: "#2a2a36",
  strong: "#3b3b4a",

  // Text
  ink: "#eeeef3",
  muted: "#9b9bab",
  faint: "#6c6c7c",

  // Brand accent — violet (buttons, active nav, focus, highlights)
  accent: "#9b87f5",
  "accent-hover": "#ae9df8",
  "accent-soft": "#241f3f",

  // Supporting hues
  teal: "#3fd0bd",
  "teal-soft": "#142a28",
  amber: "#f2b45a",
  "amber-soft": "#2d2416",
  pink: "#f47bb0",
  "pink-soft": "#2e1a26",
  green: "#5fd38d",
  "green-soft": "#16291f",
  red: "#ff7b7b",
  "red-soft": "#301b1d",
  blue: "#6ea8ff",
  "blue-soft": "#172338",
} as const;

/**
 * Categorical chart colours, validated for the dark surface (lightness band,
 * chroma, colour-vision separation, contrast). Always assigned in this order.
 */
export const chartColors = ["#8b6cf0", "#1fa89a", "#c5822a", "#d9568f"] as const;

/** Muted bar colour for non-highlighted months in the earnings chart. */
export const chartMuted = "#34304f";
