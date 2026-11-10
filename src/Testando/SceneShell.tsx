import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "./Background";

const FADE_LENGTH = 12;

/**
 * Background + centered content with the standard fade-out
 * (last 12 frames → opacity 0, scale 0.96). Pass fadeOutAt = null to hold.
 */
export const SceneShell: React.FC<{
  fadeOutAt: number | null;
  children: React.ReactNode;
}> = ({ fadeOutAt, children }) => {
  const frame = useCurrentFrame();

  const progress =
    fadeOutAt === null
      ? 0
      : interpolate(frame, [fadeOutAt, fadeOutAt + FADE_LENGTH], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill
        style={{
          opacity: 1 - progress,
          transform: `scale(${1 - progress * 0.04})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const fadeOutFor = (duration: number) => duration - FADE_LENGTH;
