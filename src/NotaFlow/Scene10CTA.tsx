import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Background } from "./Background";
import { NotaFlowLogo } from "./NotaFlowLogo";
import { COLORS, SPRING_CONFIG } from "./constants";

const { fontFamily: instrumentSerif } = loadInstrumentSerif();
const { fontFamily: inter } = loadInter();

export const Scene10CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame: frame - 2, fps, config: SPRING_CONFIG });

  const titleProgress = spring({ frame: frame - 8, fps, config: SPRING_CONFIG });
  const titleY = interpolate(titleProgress, [0, 1], [20, 0]);

  const urlProgress = spring({ frame: frame - 14, fps, config: SPRING_CONFIG });
  const urlY = interpolate(urlProgress, [0, 1], [20, 0]);

  const underlineWidth = interpolate(frame, [20, 35], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const smallTextProgress = spring({ frame: frame - 28, fps, config: SPRING_CONFIG });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <div style={{ transform: `scale(${logoScale})` }}>
          <NotaFlowLogo size={80} />
        </div>

        <div
          style={{
            fontFamily: instrumentSerif,
            fontSize: 64,
            color: COLORS.foreground,
            opacity: titleProgress,
            transform: `translateY(${titleY}px)`,
          }}
        >
          teste grátis por 14 dias
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: urlProgress,
            transform: `translateY(${urlY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: inter,
              fontSize: 32,
              fontWeight: 500,
              color: COLORS.foreground,
            }}
          >
            notafiscalflow.com.br
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 2,
              backgroundColor: COLORS.green,
              width: `${underlineWidth}%`,
              marginTop: 4,
              maxWidth: 320,
            }}
          />
        </div>

        <div
          style={{
            fontFamily: inter,
            fontSize: 16,
            color: COLORS.muted,
            opacity: smallTextProgress,
          }}
        >
          Sem cartão de crédito. Sem configuração.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
