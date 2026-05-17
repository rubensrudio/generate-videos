import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Background } from "./Background";
import { COLORS, SPRING_CONFIG, CARD_SHADOW_LIGHT } from "./constants";
import { useSceneFade } from "./useSceneFade";

const { fontFamily: inter } = loadInter();

const invoices = [
  { id: "#001", name: "ACME Consultoria", value: "R$ 5.200,00" },
  { id: "#002", name: "Tech Solutions", value: "R$ 3.800,00" },
  { id: "#003", name: "Digital Agency", value: "R$ 7.150,00" },
  { id: "#004", name: "StartupX", value: "R$ 2.400,00" },
  { id: "#005", name: "DataCorp", value: "R$ 9.600,00" },
  { id: "#006", name: "CloudBase", value: "R$ 4.300,00" },
  { id: "#007", name: "InnovaLab", value: "R$ 6.750,00" },
];

export const Scene6Batch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, scale } = useSceneFade(214, 202);

  const badgeProgress = spring({ frame: frame - 70, fps, config: SPRING_CONFIG });

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
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            width: 600,
          }}
        >
          {invoices.map((inv, i) => {
            const fromLeft = i % 2 === 0;
            const itemProgress = spring({
              frame: frame - i * 8,
              fps,
              config: SPRING_CONFIG,
            });
            const slideX = interpolate(
              itemProgress,
              [0, 1],
              [fromLeft ? -200 : 200, 0],
            );

            return (
              <div
                key={inv.id}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 20px",
                  borderRadius: 12,
                  backgroundColor: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: CARD_SHADOW_LIGHT,
                  opacity: itemProgress,
                  transform: `translateX(${slideX}px)`,
                }}
              >
                {/* Checkmark */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: COLORS.greenLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill={COLORS.green}>
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: inter,
                      fontSize: 15,
                      fontWeight: 600,
                      color: COLORS.foreground,
                    }}
                  >
                    NFS-e {inv.id} — {inv.name}
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: inter,
                    fontSize: 15,
                    fontWeight: 600,
                    color: COLORS.green,
                  }}
                >
                  {inv.value}
                </div>
              </div>
            );
          })}

          {/* Badge */}
          <div
            style={{
              marginTop: 16,
              padding: "10px 24px",
              borderRadius: 24,
              backgroundColor: COLORS.greenLight,
              fontFamily: inter,
              fontSize: 16,
              fontWeight: 600,
              color: COLORS.green,
              opacity: badgeProgress,
              transform: `scale(${interpolate(badgeProgress, [0, 1], [0.8, 1])})`,
            }}
          >
            7 notas · 1 lote · CSV upload
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
