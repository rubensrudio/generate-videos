import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, SPRING_CONFIG } from "./constants";
import { inter } from "./fonts";
import { SceneShell, fadeOutFor } from "./SceneShell";

const STEPS = [
  { title: "New signup", color: COLORS.blue },
  { title: "Welcome email", color: COLORS.green },
  { title: "Wait 2 days", color: COLORS.orange },
  { title: "Getting started", color: COLORS.green },
  { title: "Opened?", color: COLORS.purple },
];

const START = 5;
const STEP_FRAMES = 20;
const LINE_DELAY = 10;
const BRANCH_START = START + (STEPS.length - 1) * STEP_FRAMES + LINE_DELAY;

const Connector: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={3} height={40} style={{ display: "block" }}>
      <line
        x1={1.5}
        y1={0}
        x2={1.5}
        y2={40 * Math.min(progress, 1)}
        stroke={COLORS.muted}
        strokeWidth={3}
        strokeDasharray="6 6"
        strokeDashoffset={-frame}
        opacity={0.6}
      />
    </svg>
  );
};

export const Scene7Automation: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badge = spring({ frame: frame - START, fps, config: SPRING_CONFIG });
  const pulse = interpolate(Math.sin(frame * 0.2), [-1, 1], [0.6, 1]);

  const branch = interpolate(frame, [BRANCH_START, BRANCH_START + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const branchLabel = spring({ frame: frame - BRANCH_START - 12, fps, config: SPRING_CONFIG });

  return (
    <SceneShell fadeOutAt={fadeOutFor(duration)}>
      {/* Automation live badge */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 60,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 32px",
          borderRadius: 24,
          backgroundColor: COLORS.greenLight,
          boxShadow: "0 4px 16px rgba(22, 163, 74, 0.2)",
          opacity: Math.min(badge, 1),
          transform: `scale(${interpolate(badge, [0, 1], [0.5, 1])})`,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: COLORS.green,
            boxShadow: `0 0 ${12 * pulse}px ${4 * pulse}px ${COLORS.greenGlow}`,
            opacity: pulse,
          }}
        />
        <span style={{ fontFamily: inter, fontSize: 20, fontWeight: 700, color: COLORS.green }}>
          Automation live
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {STEPS.map((step, i) => {
          const cardStart = START + i * STEP_FRAMES;
          const card = spring({ frame: frame - cardStart, fps, config: SPRING_CONFIG });
          const line = spring({ frame: frame - cardStart - LINE_DELAY, fps, config: SPRING_CONFIG });
          const isLast = i === STEPS.length - 1;
          return (
            <div key={step.title} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 300,
                  padding: "14px 20px",
                  borderRadius: 12,
                  backgroundColor: COLORS.card,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  opacity: Math.min(card, 1),
                  transform: `translateY(${interpolate(card, [0, 1], [15, 0])}px) scale(${interpolate(card, [0, 1], [0.8, 1])})`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: step.color }} />
                  <span style={{ fontFamily: inter, fontSize: 16, fontWeight: 700, color: COLORS.foreground }}>
                    {step.title}
                  </span>
                </div>
                <div style={{ width: "80%", height: 7, borderRadius: 4, backgroundColor: COLORS.bg }} />
                <div style={{ width: "55%", height: 7, borderRadius: 4, backgroundColor: COLORS.bg }} />
              </div>
              {!isLast && <Connector progress={line} />}
            </div>
          );
        })}

        {/* Yes / No branches */}
        <svg width={420} height={70} style={{ display: "block" }}>
          <path
            d="M210 0 C210 40, 60 30, 60 70"
            fill="none"
            stroke={COLORS.green}
            strokeWidth={3}
            strokeDasharray="6 6"
            strokeDashoffset={-frame}
            opacity={branch}
          />
          <path
            d="M210 0 C210 40, 360 30, 360 70"
            fill="none"
            stroke={COLORS.red}
            strokeWidth={3}
            strokeDasharray="6 6"
            strokeDashoffset={-frame}
            opacity={branch}
          />
        </svg>
        <div
          style={{
            width: 420,
            display: "flex",
            justifyContent: "space-between",
            opacity: Math.min(branchLabel, 1),
            transform: `translateY(${interpolate(branchLabel, [0, 1], [10, 0])}px)`,
          }}
        >
          <span
            style={{
              fontFamily: inter,
              fontSize: 15,
              fontWeight: 700,
              color: COLORS.green,
              backgroundColor: COLORS.greenLight,
              padding: "6px 14px",
              borderRadius: 16,
            }}
          >
            Yes → nurture
          </span>
          <span
            style={{
              fontFamily: inter,
              fontSize: 15,
              fontWeight: 700,
              color: COLORS.red,
              backgroundColor: COLORS.redLight,
              padding: "6px 14px",
              borderRadius: 16,
            }}
          >
            No → re-engage
          </span>
        </div>
      </div>
    </SceneShell>
  );
};
