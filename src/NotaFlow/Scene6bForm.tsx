import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { Background } from "./Background";
import { NotaFlowLogo } from "./NotaFlowLogo";
import { COLORS, SPRING_CONFIG, CARD_SHADOW } from "./constants";
import { useSceneFade } from "./useSceneFade";

const { fontFamily: inter } = loadInter();
const { fontFamily: jetBrainsMono } = loadJetBrainsMono();

const steps = ["Dados", "Serviço", "Certificado"];

const FadeSlide: React.FC<{
  frame: number;
  appearAt: number;
  fps: number;
  children: React.ReactNode;
}> = ({ frame, appearAt, fps, children }) => {
  const progress = spring({ frame: frame - appearAt, fps, config: SPRING_CONFIG });
  const y = interpolate(progress, [0, 1], [15, 0]);
  return (
    <div style={{ opacity: progress, transform: `translateY(${y}px)` }}>
      {children}
    </div>
  );
};

export const Scene6bForm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, scale } = useSceneFade(220, 208);

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
            width: 620,
            padding: "40px 24px",
            backgroundColor: COLORS.card,
            borderRadius: 14,
            border: `1px solid ${COLORS.border}`,
            boxShadow: CARD_SHADOW,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Logo */}
          <FadeSlide frame={frame} appearAt={10} fps={fps}>
            <NotaFlowLogo size={28} />
          </FadeSlide>

          {/* Heading */}
          <FadeSlide frame={frame} appearAt={18} fps={fps}>
            <div
              style={{
                fontFamily: inter,
                fontSize: 28,
                fontWeight: 700,
                color: COLORS.foreground,
              }}
            >
              Emissão de NFS-e
            </div>
          </FadeSlide>

          {/* Step indicator */}
          <FadeSlide frame={frame} appearAt={26} fps={fps}>
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 8 }}>
              {steps.map((step, i) => (
                <div key={step} style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: i === 0 ? COLORS.green : COLORS.border,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: inter,
                      fontSize: 13,
                      fontWeight: 600,
                      color: i === 0 ? "white" : COLORS.muted,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div
                    style={{
                      fontFamily: inter,
                      fontSize: 14,
                      fontWeight: 500,
                      color: i === 0 ? COLORS.green : COLORS.muted,
                      marginLeft: 6,
                      marginRight: i < steps.length - 1 ? 8 : 0,
                    }}
                  >
                    {step}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      style={{
                        width: 40,
                        height: 2,
                        backgroundColor: COLORS.border,
                        marginLeft: 8,
                        marginRight: 8,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </FadeSlide>

          {/* Prestador */}
          <FadeSlide frame={frame} appearAt={34} fps={fps}>
            <div
              style={{
                padding: "14px 18px",
                borderRadius: 10,
                backgroundColor: COLORS.bg,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ fontFamily: inter, fontSize: 12, fontWeight: 600, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Prestador
              </div>
              <div style={{ fontFamily: jetBrainsMono, fontSize: 14, color: COLORS.foreground }}>
                CNPJ: 12.345.678/0001-90
              </div>
              <div style={{ fontFamily: inter, fontSize: 14, color: COLORS.foreground }}>
                Razão Social: HaloTechLabs LTDA
              </div>
            </div>
          </FadeSlide>

          {/* Tomador */}
          <FadeSlide frame={frame} appearAt={40} fps={fps}>
            <div
              style={{
                padding: "14px 18px",
                borderRadius: 10,
                backgroundColor: COLORS.bg,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ fontFamily: inter, fontSize: 12, fontWeight: 600, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Tomador
              </div>
              <div style={{ fontFamily: jetBrainsMono, fontSize: 14, color: COLORS.foreground }}>
                CNPJ: 98.765.432/0001-10
              </div>
              <div style={{ fontFamily: inter, fontSize: 14, color: COLORS.foreground }}>
                Razão Social: ACME Consultoria
              </div>
            </div>
          </FadeSlide>

          {/* Serviço */}
          <FadeSlide frame={frame} appearAt={46} fps={fps}>
            <div
              style={{
                padding: "14px 18px",
                borderRadius: 10,
                backgroundColor: COLORS.bg,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ fontFamily: inter, fontSize: 12, fontWeight: 600, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Serviço
              </div>
              <div style={{ fontFamily: inter, fontSize: 14, color: COLORS.foreground }}>
                Código: 1.01 — Consultoria em TI
              </div>
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 24,
                  fontWeight: 700,
                  color: COLORS.green,
                  marginTop: 4,
                }}
              >
                R$ 5.200,00
              </div>
            </div>
          </FadeSlide>

          {/* CTA Button */}
          <FadeSlide frame={frame} appearAt={52} fps={fps}>
            <div
              style={{
                padding: "14px 32px",
                borderRadius: 50,
                backgroundColor: COLORS.green,
                color: "white",
                fontFamily: inter,
                fontSize: 15,
                fontWeight: 600,
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              Emitir NFS-e →
            </div>
          </FadeSlide>

          {/* Security text */}
          <FadeSlide frame={frame} appearAt={58} fps={fps}>
            <div
              style={{
                fontFamily: inter,
                fontSize: 14,
                color: COLORS.muted,
                textAlign: "center",
              }}
            >
              Certificado digital criptografado · nunca armazenado no servidor
            </div>
          </FadeSlide>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
