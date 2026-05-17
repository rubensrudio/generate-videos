import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Background } from "./Background";
import { BrowserWindow } from "./BrowserWindow";
import { COLORS, SPRING_CONFIG } from "./constants";
import { useSceneFade } from "./useSceneFade";

const { fontFamily: instrumentSerif } = loadInstrumentSerif();
const { fontFamily: inter } = loadInter();

const alerts = [
  { text: "47 notas pendentes de emissão", color: COLORS.red, bgColor: COLORS.redLight },
  { text: "Cliente aguardando NFS-e há 5 dias", color: COLORS.orange, bgColor: COLORS.orangeLight },
  { text: "Prazo fiscal vencendo em 48h", color: COLORS.red, bgColor: COLORS.redLight, pulse: true },
];

export const Scene4Agitation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, scale } = useSceneFade(175, 163);

  const browserScale = spring({ frame: frame - 3, fps, config: SPRING_CONFIG });
  const browserS = interpolate(browserScale, [0, 1], [0.9, 1]);

  const zeroProgress = spring({ frame: frame - 70, fps, config: SPRING_CONFIG });
  const zeroScale = interpolate(zeroProgress, [0, 1], [0.5, 1]);

  const textProgress = spring({ frame: frame - 95, fps, config: SPRING_CONFIG });
  const textY = interpolate(textProgress, [0, 1], [15, 0]);

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
          gap: 32,
        }}
      >
        {/* Browser window */}
        <div style={{ transform: `scale(${browserS})`, opacity: browserScale }}>
          <BrowserWindow url="receita.fazenda.gov.br" width={900}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Header */}
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 18,
                  fontWeight: 600,
                  color: COLORS.foreground,
                  marginBottom: 8,
                }}
              >
                Painel de Emissões
              </div>

              {/* Alert rows */}
              {alerts.map((alert, i) => {
                const alertProgress = spring({
                  frame: frame - 10 - i * 15,
                  fps,
                  config: SPRING_CONFIG,
                });
                const pulseOpacity = alert.pulse
                  ? interpolate(Math.sin(frame * 0.15), [-1, 1], [0.7, 1])
                  : 1;

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      borderRadius: 8,
                      backgroundColor: alert.bgColor,
                      opacity: alertProgress * pulseOpacity,
                      transform: `translateX(${interpolate(alertProgress, [0, 1], [40, 0])}px)`,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>⚠</span>
                    <span
                      style={{
                        fontFamily: inter,
                        fontSize: 15,
                        fontWeight: 600,
                        color: alert.color,
                      }}
                    >
                      {alert.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </BrowserWindow>
        </div>

        {/* Zero + text below browser */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontFamily: inter,
              fontSize: 160,
              fontWeight: 700,
              color: COLORS.red,
              lineHeight: 1,
              opacity: zeroProgress,
              transform: `scale(${zeroScale})`,
            }}
          >
            0
          </div>
          <div
            style={{
              fontFamily: inter,
              fontSize: 24,
              color: COLORS.muted,
              opacity: zeroProgress,
            }}
          >
            notas emitidas este mês
          </div>
          <div
            style={{
              fontFamily: instrumentSerif,
              fontSize: 38,
              fontStyle: "italic",
              color: COLORS.muted,
              opacity: textProgress,
              transform: `translateY(${textY}px)`,
              marginTop: 12,
            }}
          >
            E o fiscal bate na porta.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
