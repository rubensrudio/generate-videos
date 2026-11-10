import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, SPRING_CONFIG } from "./constants";
import { instrumentSerif, inter } from "./fonts";
import { SceneShell, fadeOutFor } from "./SceneShell";

export const Scene9MicDrop: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const main = spring({ frame: frame - 4, fps, config: SPRING_CONFIG });
  const subtitle = spring({ frame: frame - 14, fps, config: SPRING_CONFIG });

  return (
    <SceneShell fadeOutAt={fadeOutFor(duration)}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div
          style={{
            fontFamily: inter,
            fontSize: 24,
            fontWeight: 500,
            color: COLORS.muted,
            opacity: Math.min(subtitle, 1),
            transform: `translateY(${interpolate(subtitle, [0, 1], [15, 0])}px)`,
          }}
        >
          from zero to a complete email stack
        </div>
        <div
          style={{
            fontFamily: instrumentSerif,
            fontSize: 100,
            fontWeight: 400,
            color: COLORS.foreground,
            opacity: Math.min(main, 1),
            transform: `scale(${interpolate(main, [0, 1], [0.7, 1])})`,
          }}
        >
          Under 5 minutes
        </div>
      </div>
    </SceneShell>
  );
};
