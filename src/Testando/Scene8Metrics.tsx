import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CARD_SHADOW, COLORS, SPRING_CONFIG } from "./constants";
import { instrumentSerif, inter } from "./fonts";
import { SceneShell, fadeOutFor } from "./SceneShell";

const SPARKLINE = "M0 44 L30 38 L60 40 L90 28 L120 30 L150 16 L180 18 L210 4";
const SPARKLINE_LENGTH = 240;

const AVATAR_COLORS = [COLORS.blue, COLORS.green, COLORS.purple, COLORS.orange, COLORS.green];

const MetricCard: React.FC<{
  label: string;
  dot: string;
  delay: number;
  children: React.ReactNode;
}> = ({ label, dot, delay, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: SPRING_CONFIG });
  return (
    <div
      style={{
        width: 280,
        height: 190,
        padding: 24,
        boxSizing: "border-box",
        borderRadius: 14,
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        boxShadow: CARD_SHADOW,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        opacity: Math.min(p, 1),
        transform: `scale(${interpolate(p, [0, 1], [0.3, 1])})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: dot }} />
        <span style={{ fontFamily: inter, fontSize: 15, fontWeight: 600, color: COLORS.muted }}>{label}</span>
      </div>
      {children}
    </div>
  );
};

export const Scene8Metrics: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headline = spring({ frame: frame - 2, fps, config: SPRING_CONFIG });
  // Numbers count up between frames 18 and 55
  const progress = spring({
    frame: frame - 18,
    fps,
    config: { ...SPRING_CONFIG, overshootClamping: true },
    durationInFrames: 37,
  });

  const number: React.CSSProperties = { fontFamily: inter, fontSize: 36, fontWeight: 700, lineHeight: 1.1 };

  return (
    <SceneShell fadeOutAt={fadeOutFor(duration)}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48 }}>
        <div
          style={{
            fontFamily: instrumentSerif,
            fontSize: 44,
            color: COLORS.foreground,
            opacity: Math.min(headline, 1),
            transform: `translateY(${interpolate(headline, [0, 1], [20, 0])}px)`,
          }}
        >
          Turn signups into paying customers
        </div>

        <div style={{ display: "flex", gap: 28 }}>
          <MetricCard label="Conversions" dot={COLORS.green} delay={10}>
            <span style={{ ...number, color: COLORS.green }}>+{Math.round(32 * progress)}%</span>
            <svg width={210} height={48} viewBox="0 0 210 48">
              <path
                d={SPARKLINE}
                fill="none"
                stroke={COLORS.green}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={SPARKLINE_LENGTH}
                strokeDashoffset={SPARKLINE_LENGTH * (1 - progress)}
              />
            </svg>
          </MetricCard>

          <MetricCard label="Revenue" dot={COLORS.blue} delay={16}>
            <span style={{ ...number, color: COLORS.blue }}>
              ${Math.round(12400 * progress).toLocaleString("en-US")}
            </span>
            <span style={{ fontFamily: inter, fontSize: 14, color: COLORS.muted }}>from email</span>
          </MetricCard>

          <MetricCard label="Customers" dot={COLORS.purple} delay={22}>
            <span style={{ ...number, color: COLORS.purple }}>{Math.round(847 * progress)}</span>
            <div style={{ display: "flex" }}>
              {AVATAR_COLORS.map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    backgroundColor: c,
                    opacity: 0.8,
                    border: "2px solid white",
                    marginLeft: i === 0 ? 0 : -8,
                  }}
                />
              ))}
            </div>
          </MetricCard>
        </div>
      </div>
    </SceneShell>
  );
};
