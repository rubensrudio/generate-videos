import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Background } from "./Background";
import { COLORS, SPRING_CONFIG, CARD_SHADOW_LIGHT } from "./constants";
import { useSceneFade } from "./useSceneFade";

const { fontFamily: instrumentSerif } = loadInstrumentSerif();
const { fontFamily: inter } = loadInter();

const toolCards = [
  { label: "Certificado Digital", color: COLORS.green, x: -320, y: -180, rot: -6, content: "A1 PFX/P12", icon: "🔒" },
  { label: "Geração XML", color: COLORS.purple, x: 80, y: -200, rot: 4, content: "<xml/>", icon: "" },
  { label: "Validação Schema", color: COLORS.orange, x: -200, y: -20, rot: -3, content: "✗ Inválido", icon: "" },
  { label: "API Receita Federal", color: COLORS.blue, x: 180, y: -40, rot: 5, content: "POST /nfse/enviar", icon: "" },
  { label: "Configuração DNS", color: COLORS.red, x: -280, y: 140, rot: -8, content: "SPF DKIM TXT", icon: "" },
  { label: "Assinatura Digital", color: COLORS.purple, x: 120, y: 160, rot: 7, content: "SHA-256 RSA", icon: "" },
];

// SVG connection lines between cards
const connections = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 3], [1, 4],
];

export const Scene3Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, scale } = useSceneFade(440, 428);

  const lineOpacity = interpolate(frame, [50, 100], [0, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2 text
  const phase2 = frame >= 95;
  const headerProgress = phase2
    ? spring({ frame: frame - 95, fps, config: SPRING_CONFIG })
    : 0;
  const quoteProgress = phase2
    ? spring({ frame: frame - 125, fps, config: SPRING_CONFIG })
    : 0;
  const quoteY = interpolate(quoteProgress, [0, 1], [15, 0]);

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
        {/* Connection lines */}
        <svg
          style={{
            position: "absolute",
            width: 1920,
            height: 1080,
            opacity: lineOpacity,
          }}
        >
          {connections.map(([a, b], i) => {
            const ca = toolCards[a];
            const cb = toolCards[b];
            return (
              <line
                key={i}
                x1={960 + ca.x}
                y1={540 + ca.y}
                x2={960 + cb.x}
                y2={540 + cb.y}
                stroke={COLORS.border}
                strokeWidth={1.5}
                strokeDasharray="8"
              />
            );
          })}
        </svg>

        {/* Tool cards */}
        {toolCards.map((card, i) => {
          const cardProgress = spring({
            frame: frame - i * 12,
            fps,
            config: SPRING_CONFIG,
          });
          const cardScale = interpolate(cardProgress, [0, 1], [0.3, 1]);
          const isMono =
            card.label === "API Receita Federal" ||
            card.label === "Assinatura Digital" ||
            card.label === "Configuração DNS";

          return (
            <div
              key={card.label}
              style={{
                position: "absolute",
                left: 960 + card.x - 100,
                top: 540 + card.y - 40,
                width: 200,
                padding: "16px 20px",
                borderRadius: 12,
                backgroundColor: COLORS.card,
                boxShadow: CARD_SHADOW_LIGHT,
                border: `1px solid ${COLORS.border}`,
                transform: `rotate(${card.rot}deg) scale(${cardScale})`,
                opacity: cardProgress,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: card.color,
                  marginBottom: 8,
                }}
              />
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 15,
                  fontWeight: 600,
                  color: COLORS.foreground,
                  marginBottom: 6,
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontFamily: isMono
                    ? "'SF Mono', 'Fira Code', monospace"
                    : inter,
                  fontSize: 12,
                  color: COLORS.muted,
                }}
              >
                {card.icon} {card.content}
              </div>
            </div>
          );
        })}

        {/* Phase 2: text overlay */}
        {phase2 && (
          <div
            style={{
              position: "absolute",
              bottom: 120,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                fontFamily: inter,
                fontSize: 28,
                fontWeight: 600,
                color: COLORS.foreground,
                opacity: headerProgress,
              }}
            >
              Dias de configuração
            </div>
            <div
              style={{
                fontFamily: inter,
                fontSize: 22,
                color: COLORS.muted,
                opacity: headerProgress,
              }}
            >
              Múltiplas ferramentas. Complexidade infinita.
            </div>
            <div
              style={{
                fontFamily: instrumentSerif,
                fontSize: 38,
                fontStyle: "italic",
                color: COLORS.muted,
                opacity: quoteProgress,
                transform: `translateY(${quoteY}px)`,
                marginTop: 8,
              }}
            >
              Enquanto isso, suas notas não saem.
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
