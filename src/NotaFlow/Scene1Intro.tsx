import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { interpolate } from "remotion";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Background } from "./Background";
import { NotaFlowLogo } from "./NotaFlowLogo";
import { COLORS, SPRING_CONFIG } from "./constants";
import { useSceneFade } from "./useSceneFade";

const { fontFamily: instrumentSerif } = loadInstrumentSerif();
const { fontFamily: inter } = loadInter();

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, scale } = useSceneFade(216, 204);

  const logoScale = spring({ frame: frame - 2, fps, config: SPRING_CONFIG });

  const titleProgress = spring({ frame: frame - 8, fps, config: SPRING_CONFIG });
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);

  const subtitleProgress = spring({ frame: frame - 18, fps, config: SPRING_CONFIG });
  const subtitleY = interpolate(subtitleProgress, [0, 1], [15, 0]);

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
            gap: 24,
          }}
        >
          <div style={{ transform: `scale(${logoScale})` }}>
            <NotaFlowLogo size={100} />
          </div>

          <div
            style={{
              fontFamily: instrumentSerif,
              fontSize: 76,
              color: COLORS.foreground,
              opacity: titleProgress,
              transform: `translateY(${titleY}px)`,
            }}
          >
            Apresentamos o NotaFlow
          </div>

          <div
            style={{
              fontFamily: inter,
              fontSize: 28,
              color: COLORS.muted,
              fontWeight: 400,
              opacity: subtitleProgress,
              transform: `translateY(${subtitleY}px)`,
            }}
          >
            Emissão de NFS-e inteligente
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
