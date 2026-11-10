import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CARD_SHADOW, COLORS, SPRING_CONFIG } from "./constants";
import { inter } from "./fonts";
import { Logo } from "./Logo";
import { SceneShell, fadeOutFor } from "./SceneShell";

const PROMPT_TEXT = "Create a 7-day onboarding email sequence for my SaaS";

export const Scene5Relief: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const card = spring({ frame: frame - 2, fps, config: SPRING_CONFIG });
  const chars = Math.round(
    interpolate(frame, [10, 50], [0, PROMPT_TEXT.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const typing = frame < 52;
  const cursorOn = Math.floor(frame / 8) % 2 === 0;

  return (
    <SceneShell fadeOutAt={fadeOutFor(duration)}>
      <div
        style={{
          width: 760,
          padding: 32,
          borderRadius: 14,
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          boxShadow: CARD_SHADOW,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          opacity: Math.min(card, 1),
          transform: `scale(${interpolate(card, [0, 1], [0.85, 1])})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Logo size={40} radius={10} />
          <span style={{ fontFamily: inter, fontSize: 20, fontWeight: 700, color: COLORS.foreground }}>
            Sendkit
          </span>
          <span
            style={{
              fontFamily: inter,
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.green,
              backgroundColor: COLORS.greenLight,
              padding: "4px 10px",
              borderRadius: 12,
            }}
          >
            MCP
          </span>
        </div>

        <div
          style={{
            fontFamily: inter,
            fontSize: 26,
            fontWeight: 500,
            color: COLORS.foreground,
            minHeight: 72,
            lineHeight: 1.4,
          }}
        >
          {PROMPT_TEXT.slice(0, chars)}
          {typing && (
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: 28,
                marginLeft: 2,
                verticalAlign: "middle",
                backgroundColor: COLORS.green,
                opacity: cursorOn ? 1 : 0,
              }}
            />
          )}
        </div>

        <div style={{ display: "flex", gap: 8, height: 12 }}>
          {[0, 1, 2].map((i) => {
            const appear = spring({ frame: frame - 52 - i * 3, fps, config: SPRING_CONFIG });
            const active = Math.floor((frame - 52) / 8) % 3 === i;
            return (
              <div
                key={i}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: active ? COLORS.green : COLORS.border,
                  transform: `scale(${appear})`,
                }}
              />
            );
          })}
        </div>
      </div>
    </SceneShell>
  );
};
