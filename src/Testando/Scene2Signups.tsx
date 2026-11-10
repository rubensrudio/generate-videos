import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BrowserWindow } from "./BrowserWindow";
import { COLORS, SPRING_CONFIG } from "./constants";
import { inter } from "./fonts";
import { SceneShell, fadeOutFor } from "./SceneShell";
import { SignupRow } from "./SignupRow";
import { SIGNUPS } from "./signups";

export const Scene2Signups: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const win = spring({ frame: frame - 3, fps, config: SPRING_CONFIG });
  const count = Math.round(
    interpolate(frame, [8, 60], [0, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );

  return (
    <SceneShell fadeOutAt={fadeOutFor(duration)}>
      <div style={{ opacity: win, transform: `scale(${interpolate(win, [0, 1], [0.9, 1])})` }}>
        <BrowserWindow url="yourapp.com/dashboard" width={700}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ fontFamily: inter, fontSize: 18, fontWeight: 600, color: COLORS.foreground }}>
                Dashboard
              </span>
              <span
                style={{
                  fontFamily: inter,
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.green,
                  backgroundColor: COLORS.greenLight,
                  padding: "6px 14px",
                  borderRadius: 20,
                }}
              >
                {count} new signups today
              </span>
            </div>
            {SIGNUPS.map((s, i) => {
              const p = spring({ frame: frame - 8 - i * 10, fps, config: SPRING_CONFIG });
              return (
                <SignupRow
                  key={s.email}
                  {...s}
                  style={{
                    opacity: p,
                    transform: `translateX(${interpolate(p, [0, 1], [120, 0])}px)`,
                  }}
                />
              );
            })}
          </div>
        </BrowserWindow>
      </div>
    </SceneShell>
  );
};
