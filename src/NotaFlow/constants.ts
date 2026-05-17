// Design tokens from PROMPT.md — "Livro Fiscal" theme

export const COLORS = {
  bg: "#F5F4F1",
  card: "#FFFFFF",
  border: "#E2E2DC",
  foreground: "#1C2B3A",
  muted: "#728999",
  green: "#1B5E20",
  greenMid: "#388E3C",
  greenLight: "#E8F5E9",
  greenGlow: "rgba(27, 94, 32, 0.25)",
  blue: "#1565C0",
  blueLight: "#E8F0FD",
  orange: "#E65100",
  orangeLight: "#FFF3E0",
  purple: "#7c3aed",
  purpleLight: "rgba(124, 58, 237, 0.10)",
  red: "#C62828",
  redLight: "#FFEBEE",
  pinkBlob: "rgba(255, 182, 193, 0.25)",
  peachBlob: "rgba(255, 218, 185, 0.2)",
};

export const SPRING_CONFIG = {
  damping: 10,
  stiffness: 150,
  mass: 0.8,
  overshootClamping: false,
};

export const CARD_SHADOW =
  "0 25px 60px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.04)";
export const CARD_SHADOW_LIGHT = "0 4px 20px rgba(0,0,0,0.06)";
export const CARD_SHADOW_MED = "0 4px 16px rgba(0,0,0,0.05)";

// Scene timings (audio-first: measured from ElevenLabs output + 5 frames padding)
export const SCENES = {
  s01: { from: 0,    duration: 216 },
  s02: { from: 216,  duration: 283 },
  s03: { from: 499,  duration: 440 },
  s04: { from: 939,  duration: 175 },
  s05: { from: 1114, duration: 94  },
  s06: { from: 1208, duration: 214 },
  s06b: { from: 1422, duration: 220 },
  s07: { from: 1642, duration: 313 },
  s08: { from: 1955, duration: 175 },
  s09: { from: 2130, duration: 159 },
  s10: { from: 2289, duration: 168 },
};

export const TOTAL_FRAMES = 2457;
export const FPS = 30;
