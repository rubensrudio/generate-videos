import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, SPRING_CONFIG } from "./constants";
import { inter } from "./fonts";
import { SceneShell, fadeOutFor } from "./SceneShell";

const TEMPLATES = [
  "Welcome aboard",
  "Getting started",
  "Tips for your first week",
  "What others are building",
  "A feature you'll love",
  "Your journey so far",
  "We'd love feedback",
];

export const Scene6Templates: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badge = spring({ frame: frame - 70, fps, config: SPRING_CONFIG });

  return (
    <SceneShell fadeOutAt={fadeOutFor(duration)}>
      <div style={{ width: 600, display: "flex", flexDirection: "column", gap: 10 }}>
        {TEMPLATES.map((title, i) => {
          const p = spring({ frame: frame - 4 - i * 8, fps, config: SPRING_CONFIG });
          const fromX = i % 2 === 0 ? -200 : 200;
          return (
            <div
              key={title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 20px",
                borderRadius: 12,
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                opacity: Math.min(p, 1),
                transform: `translateX(${interpolate(p, [0, 1], [fromX, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: COLORS.green,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <path d="M5 12.5l4.5 4.5L19 7.5" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontFamily: inter, fontSize: 15, fontWeight: 600, color: COLORS.muted, width: 56 }}>
                Day {i + 1}
              </span>
              <span style={{ fontFamily: inter, fontSize: 17, fontWeight: 600, color: COLORS.foreground }}>
                {title}
              </span>
            </div>
          );
        })}

        <div
          style={{
            alignSelf: "center",
            marginTop: 12,
            fontFamily: inter,
            fontSize: 18,
            fontWeight: 700,
            color: COLORS.green,
            backgroundColor: COLORS.greenLight,
            padding: "10px 24px",
            borderRadius: 24,
            opacity: Math.min(badge, 1),
            transform: `scale(${interpolate(badge, [0, 1], [0.5, 1])})`,
          }}
        >
          7 templates · 1 prompt
        </div>
      </div>
    </SceneShell>
  );
};
