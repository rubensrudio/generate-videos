// Design tokens from PROMPT.md

export const COLORS = {
  bg: "#f5f5f0",
  card: "#ffffff",
  border: "#e2e2dc",
  foreground: "#262622",
  muted: "#757568",
  green: "#16a34a",
  greenLight: "rgba(22, 163, 74, 0.12)",
  greenGlow: "rgba(22, 163, 74, 0.25)",
  blue: "#2563eb",
  blueLight: "rgba(37, 99, 235, 0.10)",
  orange: "#ea580c",
  orangeLight: "rgba(234, 88, 12, 0.10)",
  purple: "#7c3aed",
  purpleLight: "rgba(124, 58, 237, 0.10)",
  red: "#dc2626",
  redLight: "rgba(220, 38, 38, 0.10)",
  pinkBlob: "rgba(255, 182, 193, 0.25)",
  peachBlob: "rgba(255, 218, 185, 0.2)",
};

export const MONO = "'SF Mono', 'Fira Code', 'Cascadia Code', monospace";

export const SPRING_CONFIG = {
  damping: 10,
  stiffness: 150,
  mass: 0.8,
  overshootClamping: false,
};

export const CARD_SHADOW =
  "0 25px 60px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.04)";

export const FPS = 30;
const PADDING_FRAMES = 5;

// Narration durations (seconds) measured with `npx remotion ffprobe`
const AUDIO_SECONDS = {
  s01: 3.892245,
  s02: 3.578776,
  s03: 6.635102,
  s04: 5.694694,
  s05: 3.004082,
  s06: 3.004082,
  s06b: 3.422041,
  s07: 5.433469,
  s08: 2.533878,
  s09: 4.728163,
  s10: 2.089796,
};

export type SceneKey = keyof typeof AUDIO_SECONDS;

// Audio-first timing: duration = ceil(audio * fps) + padding, scenes back to back
const buildScenes = () => {
  let from = 0;
  const scenes = {} as Record<SceneKey, { from: number; duration: number }>;
  for (const key of Object.keys(AUDIO_SECONDS) as SceneKey[]) {
    const duration = Math.ceil(AUDIO_SECONDS[key] * FPS) + PADDING_FRAMES;
    scenes[key] = { from, duration };
    from += duration;
  }
  return { scenes, total: from };
};

const built = buildScenes();

export const SCENES = built.scenes;
export const TOTAL_FRAMES = built.total;
