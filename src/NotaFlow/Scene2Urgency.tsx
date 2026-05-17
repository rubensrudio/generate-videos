import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Background } from "./Background";
import { COLORS, SPRING_CONFIG, CARD_SHADOW } from "./constants";
import { useSceneFade } from "./useSceneFade";

const { fontFamily: instrumentSerif } = loadInstrumentSerif();
const { fontFamily: inter } = loadInter();

const countdownBlocks = [
  { label: "dias", value: "265" },
  { label: "horas", value: "12" },
  { label: "minutos", value: "47" },
];

export const Scene2Urgency: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, scale } = useSceneFade(283, 271);

  const cardScale = spring({ frame: frame - 3, fps, config: SPRING_CONFIG });
  const cardS = interpolate(cardScale, [0, 1], [0.9, 1]);

  const dateProgress = spring({ frame: frame - 10, fps, config: SPRING_CONFIG });
  const subtitleProgress = spring({ frame: frame - 18, fps, config: SPRING_CONFIG });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill
        style={{
          opacity,
          transform: `scale(${scale})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 700,
            padding: "48px 40px",
            backgroundColor: COLORS.card,
            borderRadius: 14,
            border: `1px solid ${COLORS.border}`,
            boxShadow: CARD_SHADOW,
            transform: `scale(${cardS})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Calendar icon */}
          <svg width={48} height={48} viewBox="0 0 24 24" fill={COLORS.red}>
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 002 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
          </svg>

          {/* Date */}
          <div
            style={{
              fontFamily: instrumentSerif,
              fontSize: 72,
              color: COLORS.foreground,
              opacity: dateProgress,
            }}
          >
            01/01/2026
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontFamily: inter,
              fontSize: 24,
              color: COLORS.muted,
              opacity: subtitleProgress,
            }}
          >
            API Nacional NFS-e obrigatória
          </div>

          {/* Countdown blocks */}
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            {countdownBlocks.map((block, i) => {
              const blockProgress = spring({
                frame: frame - 25 - i * 8,
                fps,
                config: SPRING_CONFIG,
              });
              return (
                <div
                  key={block.label}
                  style={{
                    backgroundColor: COLORS.greenLight,
                    borderRadius: 12,
                    padding: "16px 28px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    opacity: blockProgress,
                    transform: `scale(${interpolate(blockProgress, [0, 1], [0.8, 1])})`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: inter,
                      fontSize: 36,
                      fontWeight: 700,
                      color: COLORS.green,
                    }}
                  >
                    {block.value}
                  </div>
                  <div
                    style={{
                      fontFamily: inter,
                      fontSize: 14,
                      color: COLORS.muted,
                      fontWeight: 500,
                    }}
                  >
                    {block.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
