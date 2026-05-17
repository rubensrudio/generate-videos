import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Background } from "./Background";
import { NotaFlowLogo } from "./NotaFlowLogo";
import { COLORS, SPRING_CONFIG, CARD_SHADOW } from "./constants";
import { useSceneFade } from "./useSceneFade";

const { fontFamily: inter } = loadInter();

const FULL_TEXT =
  "Emitir nota fiscal para ACME Consultoria, CNPJ 12.345.678/0001-90, serviço de consultoria em TI";

export const Scene5Relief: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, scale } = useSceneFade(94, 82);

  const cardProgress = spring({ frame: frame - 3, fps, config: SPRING_CONFIG });
  const cardScale = interpolate(cardProgress, [0, 1], [0.9, 1]);

  // Typewriter between frames 8-38
  const charCount = Math.floor(
    interpolate(frame, [8, 38], [0, FULL_TEXT.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const typedText = FULL_TEXT.slice(0, charCount);

  // Thinking dots after frame 40
  const showDots = frame >= 40;
  const dotPhase = Math.floor((frame - 40) / 8) % 3;

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
            width: 760,
            padding: "40px 36px",
            backgroundColor: COLORS.card,
            borderRadius: 14,
            border: `1px solid ${COLORS.border}`,
            boxShadow: CARD_SHADOW,
            transform: `scale(${cardScale})`,
            opacity: cardProgress,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <NotaFlowLogo size={48} />
            <div
              style={{
                fontFamily: inter,
                fontSize: 22,
                fontWeight: 700,
                color: COLORS.foreground,
              }}
            >
              NotaFlow
            </div>
            <div
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                backgroundColor: COLORS.greenLight,
                fontFamily: inter,
                fontSize: 13,
                fontWeight: 600,
                color: COLORS.green,
              }}
            >
              NFS-e Nacional
            </div>
          </div>

          {/* Input area */}
          <div
            style={{
              padding: "20px 24px",
              borderRadius: 10,
              backgroundColor: COLORS.bg,
              border: `1px solid ${COLORS.border}`,
              minHeight: 80,
            }}
          >
            <div
              style={{
                fontFamily: inter,
                fontSize: 17,
                color: COLORS.foreground,
                lineHeight: 1.6,
              }}
            >
              {typedText}
              {charCount < FULL_TEXT.length && (
                <span
                  style={{
                    opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                    color: COLORS.green,
                  }}
                >
                  |
                </span>
              )}
            </div>

            {/* Thinking dots */}
            {showDots && charCount >= FULL_TEXT.length && (
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 16,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor:
                        dotPhase === i ? COLORS.green : COLORS.border,
                      transition: "background-color 0.2s",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
