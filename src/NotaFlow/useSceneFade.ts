import { interpolate, useCurrentFrame } from "remotion";

/**
 * Returns opacity and scale for standard scene fade-out.
 * fadeStart = frame within scene where fade begins (from end).
 */
export const useSceneFade = (
  durationInFrames: number,
  fadeOutAt: number,
  fadeLength = 12,
): { opacity: number; scale: number } => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [fadeOutAt, fadeOutAt + fadeLength],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const scale = interpolate(
    frame,
    [fadeOutAt, fadeOutAt + fadeLength],
    [1, 0.96],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return { opacity, scale };
};
