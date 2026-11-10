import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, SPRING_CONFIG } from "./constants";
import { instrumentSerif, inter } from "./fonts";
import { Logo } from "./Logo";
import { SceneShell, fadeOutFor } from "./SceneShell";

export const Scene1Intro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame: frame - 2, fps, config: SPRING_CONFIG });
  const title = spring({ frame: frame - 8, fps, config: SPRING_CONFIG });
  const subtitle = spring({ frame: frame - 18, fps, config: SPRING_CONFIG });

  return (
    <SceneShell fadeOutAt={fadeOutFor(duration)}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{ transform: `scale(${logoScale})` }}>
          <Logo size={100} radius={22} />
        </div>
        <div
          style={{
            fontFamily: instrumentSerif,
            fontSize: 76,
            color: COLORS.foreground,
            opacity: title,
            transform: `translateY(${interpolate(title, [0, 1], [30, 0])}px)`,
          }}
        >
          Introducing Sendkit
        </div>
        <div
          style={{
            fontFamily: inter,
            fontSize: 28,
            color: COLORS.muted,
            opacity: subtitle,
            transform: `translateY(${interpolate(subtitle, [0, 1], [15, 0])}px)`,
          }}
        >
          AI-native email infrastructure
        </div>
      </div>
    </SceneShell>
  );
};
