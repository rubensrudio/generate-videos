import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Background } from "./Background";
import { COLORS, SPRING_CONFIG, CARD_SHADOW_MED } from "./constants";
import { useSceneFade } from "./useSceneFade";

const { fontFamily: inter } = loadInter();

const statusCards = [
  { id: "#001", name: "ACME Consultoria", status: "Processado", color: COLORS.green, bgColor: COLORS.greenLight },
  { id: "#002", name: "Tech Solutions", status: "Processado", color: COLORS.green, bgColor: COLORS.greenLight },
  { id: "#003", name: "Digital Agency", status: "Recebido", color: COLORS.blue, bgColor: COLORS.blueLight },
  { id: "#004", name: "StartupX", status: "Processando", color: COLORS.orange, bgColor: COLORS.orangeLight },
  { id: "#005", name: "DataCorp", status: "Processado", color: COLORS.green, bgColor: COLORS.greenLight },
];

const sidebarItems = [
  { icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z", label: "Dashboard" },
  { icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z", label: "Emissão" },
  { icon: "M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z", label: "Histórico" },
  { icon: "M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z", label: "Upload" },
  { icon: "M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z", label: "Suporte" },
];

export const Scene7Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, scale } = useSceneFade(313, 301);

  // Badge
  const badgeProgress = spring({ frame: frame - 5, fps, config: SPRING_CONFIG });
  const badgeScale = interpolate(badgeProgress, [0, 1], [0.5, 1]);
  const pulseGlow = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.15, 0.35]);

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
            display: "flex",
            width: 900,
            height: 560,
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 25px 60px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.04)",
            position: "relative",
          }}
        >
          {/* Sidebar */}
          <div
            style={{
              width: 200,
              backgroundColor: COLORS.foreground,
              padding: "24px 0",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <div
              style={{
                fontFamily: inter,
                fontSize: 18,
                fontWeight: 700,
                color: "white",
                padding: "0 20px 20px",
              }}
            >
              NotaFlow
            </div>
            {sidebarItems.map((item, i) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 20px",
                  backgroundColor: i === 0 ? "rgba(255,255,255,0.1)" : "transparent",
                  borderLeft: i === 0 ? `3px solid ${COLORS.green}` : "3px solid transparent",
                }}
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
                  <path d={item.icon} />
                </svg>
                <span
                  style={{
                    fontFamily: inter,
                    fontSize: 14,
                    color: i === 0 ? "white" : "rgba(255,255,255,0.6)",
                    fontWeight: i === 0 ? 600 : 400,
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Main content */}
          <div style={{ flex: 1, padding: "24px 28px", position: "relative" }}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 22,
                  fontWeight: 700,
                  color: COLORS.foreground,
                }}
              >
                Dashboard
              </div>
              <div
                style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  backgroundColor: COLORS.greenLight,
                  fontFamily: inter,
                  fontSize: 12,
                  fontWeight: 600,
                  color: COLORS.green,
                }}
              >
                Produção
              </div>
            </div>

            {/* Status cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {statusCards.map((card, i) => {
                const cardProgress = spring({
                  frame: frame - 5 - i * 20,
                  fps,
                  config: SPRING_CONFIG,
                });
                const cardScale = interpolate(cardProgress, [0, 1], [0.8, 1]);
                const cardY = interpolate(cardProgress, [0, 1], [15, 0]);

                return (
                  <div key={card.id}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "14px 20px",
                        borderRadius: 12,
                        backgroundColor: COLORS.card,
                        border: `1px solid ${COLORS.border}`,
                        boxShadow: CARD_SHADOW_MED,
                        opacity: cardProgress,
                        transform: `scale(${cardScale}) translateY(${cardY}px)`,
                      }}
                    >
                      {/* Status dot */}
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: card.color,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontFamily: inter,
                            fontSize: 14,
                            fontWeight: 600,
                            color: COLORS.foreground,
                          }}
                        >
                          Nota {card.id}
                        </span>
                        <span
                          style={{
                            fontFamily: inter,
                            fontSize: 14,
                            color: COLORS.muted,
                            marginLeft: 8,
                          }}
                        >
                          — {card.name}
                        </span>
                      </div>
                      {/* Status badge */}
                      <div
                        style={{
                          padding: "3px 10px",
                          borderRadius: 12,
                          backgroundColor: card.bgColor,
                          fontFamily: inter,
                          fontSize: 12,
                          fontWeight: 600,
                          color: card.color,
                        }}
                      >
                        {card.status}
                      </div>
                    </div>

                    {/* Dashed line connector */}
                    {i < statusCards.length - 1 && (
                      <div
                        style={{
                          width: 3,
                          height: 10,
                          marginLeft: 30,
                          opacity: spring({
                            frame: frame - 15 - i * 20,
                            fps,
                            config: SPRING_CONFIG,
                          }),
                          backgroundImage: `repeating-linear-gradient(to bottom, ${COLORS.border} 0px, ${COLORS.border} 3px, transparent 3px, transparent 6px)`,
                          backgroundPosition: `0 ${frame * 0.5}px`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating badge */}
          <div
            style={{
              position: "absolute",
              top: 40,
              right: 60,
              padding: "14px 32px",
              borderRadius: 24,
              backgroundColor: COLORS.greenLight,
              boxShadow: `0 4px 16px rgba(22, 163, 74, 0.2)`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity: badgeProgress,
              transform: `scale(${badgeScale})`,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: COLORS.green,
                boxShadow: `0 0 8px rgba(27, 94, 32, ${pulseGlow})`,
              }}
            />
            <span
              style={{
                fontFamily: inter,
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.green,
              }}
            >
              5 notas emitidas
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
