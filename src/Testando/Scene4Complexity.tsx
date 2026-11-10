import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, MONO, SPRING_CONFIG } from "./constants";
import { inter } from "./fonts";
import { SceneShell, fadeOutFor } from "./SceneShell";

const CENTER_X = 960;
const CENTER_Y = 600;
const CARD_WIDTH = 200;

const EmailApiBody: React.FC = () => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 13,
      color: COLORS.blue,
      backgroundColor: COLORS.blueLight,
      padding: "6px 8px",
      borderRadius: 6,
    }}
  >
    POST /v1/send
  </div>
);

const TemplateBody: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <div style={{ height: 14, borderRadius: 3, backgroundColor: COLORS.purpleLight }} />
    <div style={{ display: "flex", gap: 5 }}>
      <div style={{ flex: 1, height: 28, borderRadius: 3, backgroundColor: COLORS.bg }} />
      <div style={{ flex: 2, height: 28, borderRadius: 3, backgroundColor: COLORS.bg }} />
    </div>
    <div style={{ width: "60%", height: 8, borderRadius: 3, backgroundColor: COLORS.bg }} />
  </div>
);

const AutomationBody: React.FC = () => (
  <svg width={160} height={24} viewBox="0 0 160 24">
    <circle cx={12} cy={12} r={8} fill="none" stroke={COLORS.orange} strokeWidth={2} />
    <line x1={20} y1={12} x2={140} y2={12} stroke={COLORS.orange} strokeWidth={2} />
    <circle cx={148} cy={12} r={8} fill={COLORS.orange} />
  </svg>
);

const AnalyticsBody: React.FC = () => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 36 }}>
    {[14, 24, 18, 32, 26, 36].map((h, i) => (
      <div key={i} style={{ width: 14, height: h, borderRadius: 3, backgroundColor: COLORS.green, opacity: 0.7 }} />
    ))}
  </div>
);

const SmtpBody: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {["Host", "Port"].map((label) => (
      <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: inter, fontSize: 11, color: COLORS.muted, width: 30 }}>{label}</span>
        <div style={{ flex: 1, height: 14, borderRadius: 4, border: `1px solid ${COLORS.border}` }} />
      </div>
    ))}
  </div>
);

const DnsBody: React.FC = () => (
  <div style={{ display: "flex", gap: 6 }}>
    {["TXT", "CNAME", "MX"].map((tag) => (
      <span
        key={tag}
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: COLORS.purple,
          backgroundColor: COLORS.purpleLight,
          padding: "3px 7px",
          borderRadius: 5,
        }}
      >
        {tag}
      </span>
    ))}
  </div>
);

const TOOLS = [
  { label: "Email API", color: COLORS.blue, x: -320, y: -180, rot: -6, Body: EmailApiBody },
  { label: "Template Builder", color: COLORS.purple, x: 80, y: -200, rot: 4, Body: TemplateBody },
  { label: "Automation Tool", color: COLORS.orange, x: -200, y: -20, rot: -3, Body: AutomationBody },
  { label: "Analytics Dashboard", color: COLORS.green, x: 180, y: -40, rot: 5, Body: AnalyticsBody },
  { label: "SMTP Config", color: COLORS.red, x: -280, y: 140, rot: -8, Body: SmtpBody },
  { label: "DNS Setup", color: COLORS.purple, x: 120, y: 160, rot: 7, Body: DnsBody },
];

// Messy, crossing connections between tool indices
const LINKS: [number, number][] = [
  [0, 3],
  [1, 2],
  [2, 5],
  [4, 1],
  [3, 4],
  [0, 5],
];

export const Scene4Complexity: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const header = spring({ frame: frame - 2, fps, config: SPRING_CONFIG });

  return (
    <SceneShell fadeOutAt={fadeOutFor(duration)}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: 110,
          gap: 10,
          opacity: header,
          transform: `translateY(${interpolate(header, [0, 1], [20, 0])}px)`,
        }}
      >
        <div style={{ fontFamily: inter, fontSize: 28, fontWeight: 600, color: COLORS.foreground }}>
          Days of setup
        </div>
        <div style={{ fontFamily: inter, fontSize: 22, color: COLORS.muted }}>
          Multiple tools. Endless configuration.
        </div>
      </AbsoluteFill>

      {/* Dashed connection lines */}
      <AbsoluteFill>
        <svg width={1920} height={1080}>
          {LINKS.map(([a, b], i) => {
            const start = 50 + i * 8;
            const p = interpolate(frame, [start, Math.min(start + 20, 100)], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const x1 = CENTER_X + TOOLS[a].x;
            const y1 = CENTER_Y + TOOLS[a].y;
            const x2 = CENTER_X + TOOLS[b].x;
            const y2 = CENTER_Y + TOOLS[b].y;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x1 + (x2 - x1) * p}
                y2={y1 + (y2 - y1) * p}
                stroke={COLORS.muted}
                strokeWidth={1.5}
                strokeDasharray="8"
                opacity={0.6 * (p > 0 ? 1 : 0)}
              />
            );
          })}
        </svg>
      </AbsoluteFill>

      {/* Tool cards */}
      {TOOLS.map(({ label, color, x, y, rot, Body }, i) => {
        const p = spring({ frame: frame - 6 - i * 12, fps, config: SPRING_CONFIG });
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: CENTER_X + x - CARD_WIDTH / 2,
              top: CENTER_Y + y - 50,
              width: CARD_WIDTH,
              padding: "16px 20px",
              borderRadius: 12,
              backgroundColor: COLORS.card,
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              opacity: Math.min(p, 1),
              transform: `rotate(${rot}deg) scale(${interpolate(p, [0, 1], [0.3, 1])})`,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color }} />
            <div style={{ fontFamily: inter, fontSize: 15, fontWeight: 600, color: COLORS.foreground }}>
              {label}
            </div>
            <Body />
          </div>
        );
      })}
    </SceneShell>
  );
};
