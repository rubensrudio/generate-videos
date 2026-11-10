import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BrowserWindow } from "./BrowserWindow";
import { COLORS, SPRING_CONFIG } from "./constants";
import { instrumentSerif, inter } from "./fonts";
import { SceneShell, fadeOutFor } from "./SceneShell";
import { SignupRow } from "./SignupRow";
import { SIGNUPS } from "./signups";

const PHASE_2 = 95;

export const Scene3Pain: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const win = spring({ frame: frame - 3, fps, config: SPRING_CONFIG });
  const phase1Out = spring({ frame: frame - (PHASE_2 - 10), fps, config: SPRING_CONFIG });
  const desaturation = interpolate(frame, [0, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const zero = spring({ frame: frame - PHASE_2, fps, config: SPRING_CONFIG });
  const line = spring({ frame: frame - 125, fps, config: SPRING_CONFIG });

  return (
    <SceneShell fadeOutAt={fadeOutFor(duration)}>
      {/* Phase 1: users leaving */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: win * (1 - phase1Out),
          transform: `scale(${interpolate(win, [0, 1], [0.9, 1]) - phase1Out * 0.1})`,
        }}
      >
        <BrowserWindow url="yourapp.com/dashboard" width={900}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontFamily: inter, fontSize: 18, fontWeight: 600, color: COLORS.foreground }}>
                Dashboard
              </span>
              <span
                style={{
                  fontFamily: inter,
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.red,
                  backgroundColor: COLORS.redLight,
                  padding: "6px 14px",
                  borderRadius: 20,
                }}
              >
                Users leaving
              </span>
            </div>
            {SIGNUPS.map((s, i) => {
              const leave = spring({ frame: frame - 15 - i * 12, fps, config: SPRING_CONFIG });
              return (
                <SignupRow
                  key={s.email}
                  {...s}
                  style={{
                    opacity: interpolate(leave, [0, 1], [1, 0.15]),
                    transform: `translateX(${interpolate(leave, [0, 1], [0, 160])}px)`,
                    filter: `grayscale(${desaturation})`,
                  }}
                />
              );
            })}
          </div>
        </BrowserWindow>
      </AbsoluteFill>

      {/* Phase 2: zero emails sent */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 8 }}>
        <div
          style={{
            fontFamily: inter,
            fontSize: 160,
            fontWeight: 700,
            color: COLORS.red,
            lineHeight: 1,
            opacity: Math.min(zero, 1),
            transform: `scale(${zero})`,
          }}
        >
          0
        </div>
        <div style={{ fontFamily: inter, fontSize: 24, color: COLORS.muted, opacity: Math.min(zero, 1) }}>
          emails sent
        </div>
        <div
          style={{
            fontFamily: instrumentSerif,
            fontStyle: "italic",
            fontSize: 38,
            color: COLORS.muted,
            marginTop: 24,
            opacity: line,
            transform: `translateY(${interpolate(line, [0, 1], [15, 0])}px)`,
          }}
        >
          They signed up... and forgot you exist.
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
