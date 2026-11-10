import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, SPRING_CONFIG } from "./constants";
import { instrumentSerif } from "./fonts";
import { Logo } from "./Logo";
import { SceneShell } from "./SceneShell";

export const Scene10CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logo = spring({ frame: frame - 2, fps, config: SPRING_CONFIG });
  const text = spring({ frame: frame - 8, fps, config: SPRING_CONFIG });
  const underline = spring({
    frame: frame - 16,
    fps,
    config: { ...SPRING_CONFIG, overshootClamping: true },
  });

  return (
    // No fade out — holds until the end
    <SceneShell fadeOutAt={null}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
        <div style={{ transform: `scale(${logo})` }}>
          <Logo size={80} radius={18} />
        </div>
        <div
          style={{
            fontFamily: instrumentSerif,
            fontSize: 64,
            color: COLORS.foreground,
            opacity: Math.min(text, 1),
            transform: `translateY(${interpolate(text, [0, 1], [30, 0])}px)`,
          }}
        >
          try free at{" "}
          <span style={{ position: "relative", display: "inline-block" }}>
            sendkit.dev
            <span
              style={{
                position: "absolute",
                left: 0,
                bottom: 4,
                height: 4,
                borderRadius: 2,
                width: `${underline * 100}%`,
                backgroundColor: COLORS.green,
              }}
            />
          </span>
        </div>
      </div>
    </SceneShell>
  );
};
