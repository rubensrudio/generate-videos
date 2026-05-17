import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Background } from "./Background";
import { COLORS, SPRING_CONFIG, CARD_SHADOW_LIGHT } from "./constants";
import { useSceneFade } from "./useSceneFade";

const { fontFamily: instrumentSerif } = loadInstrumentSerif();
const { fontFamily: inter } = loadInter();

const sparklinePoints = "0,30 10,28 20,25 30,22 40,18 50,20 60,15 70,12 80,8 90,5 100,3";

export const Scene8Metrics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, scale } = useSceneFade(175, 163);

  const headlineProgress = spring({ frame: frame - 2, fps, config: SPRING_CONFIG });

  // Count-up values between frames 18-55
  const countProgress = interpolate(frame, [18, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const notasValue = Math.round(countProgress * 847);
  const valorValue = Math.round(countProgress * 284500);
  const taxaValue = (countProgress * 99.7).toFixed(1);

  // Sparkline draw-in
  const sparklineLength = 160;
  const sparklineDraw = interpolate(frame, [18, 55], [sparklineLength, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const statusDots = [COLORS.green, COLORS.green, COLORS.green, COLORS.green, COLORS.blue];

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill
        style={{
          opacity,
          transform: `scale(${scale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
        }}
      >
        {/* Headline */}
        <div
          style={{
            fontFamily: instrumentSerif,
            fontSize: 44,
            color: COLORS.foreground,
            opacity: headlineProgress,
            transform: `scale(${interpolate(headlineProgress, [0, 1], [0.9, 1])})`,
          }}
        >
          Sua empresa em dia com o fisco
        </div>

        {/* Metric cards */}
        <div style={{ display: "flex", gap: 24 }}>
          {/* Notas emitidas */}
          {(() => {
            const cardProgress = spring({ frame: frame - 10, fps, config: SPRING_CONFIG });
            const cardScale = interpolate(cardProgress, [0, 1], [0.3, 1]);
            return (
              <div
                style={{
                  width: 280,
                  padding: "28px 24px",
                  borderRadius: 14,
                  backgroundColor: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: CARD_SHADOW_LIGHT,
                  opacity: cardProgress,
                  transform: `scale(${cardScale})`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: COLORS.green }} />
                <div style={{ fontFamily: inter, fontSize: 36, fontWeight: 700, color: COLORS.green }}>
                  {notasValue}
                </div>
                <svg width={100} height={30} viewBox="0 0 100 30" style={{ marginTop: 4 }}>
                  <polyline
                    points={sparklinePoints}
                    fill="none"
                    stroke={COLORS.green}
                    strokeWidth={2}
                    strokeDasharray={sparklineLength}
                    strokeDashoffset={sparklineDraw}
                  />
                </svg>
                <div style={{ fontFamily: inter, fontSize: 14, color: COLORS.muted }}>este mês</div>
              </div>
            );
          })()}

          {/* Valor total */}
          {(() => {
            const cardProgress = spring({ frame: frame - 16, fps, config: SPRING_CONFIG });
            const cardScale = interpolate(cardProgress, [0, 1], [0.3, 1]);
            return (
              <div
                style={{
                  width: 280,
                  padding: "28px 24px",
                  borderRadius: 14,
                  backgroundColor: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: CARD_SHADOW_LIGHT,
                  opacity: cardProgress,
                  transform: `scale(${cardScale})`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: COLORS.blue }} />
                <div style={{ fontFamily: inter, fontSize: 36, fontWeight: 700, color: COLORS.blue }}>
                  R$ {valorValue.toLocaleString("pt-BR")}
                </div>
                <div style={{ fontFamily: inter, fontSize: 14, color: COLORS.muted }}>em serviços</div>
              </div>
            );
          })()}

          {/* Taxa de sucesso */}
          {(() => {
            const cardProgress = spring({ frame: frame - 22, fps, config: SPRING_CONFIG });
            const cardScale = interpolate(cardProgress, [0, 1], [0.3, 1]);
            return (
              <div
                style={{
                  width: 280,
                  padding: "28px 24px",
                  borderRadius: 14,
                  backgroundColor: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: CARD_SHADOW_LIGHT,
                  opacity: cardProgress,
                  transform: `scale(${cardScale})`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: COLORS.purple }} />
                <div style={{ fontFamily: inter, fontSize: 36, fontWeight: 700, color: COLORS.purple }}>
                  {taxaValue}%
                </div>
                {/* Overlapping status dots */}
                <div style={{ display: "flex", marginTop: 4 }}>
                  {statusDots.map((color, i) => (
                    <div
                      key={i}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        backgroundColor: color,
                        opacity: 0.8,
                        border: "2px solid white",
                        marginLeft: i > 0 ? -8 : 0,
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontFamily: inter, fontSize: 14, color: COLORS.muted }}>taxa de sucesso</div>
              </div>
            );
          })()}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
