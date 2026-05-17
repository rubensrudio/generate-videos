import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Background } from "./Background";
import { COLORS, SPRING_CONFIG } from "./constants";
import { useSceneFade } from "./useSceneFade";

const { fontFamily: instrumentSerif } = loadInstrumentSerif();
const { fontFamily: inter } = loadInter();

export const Scene9MicDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, scale } = useSceneFade(159, 147);

  const mainProgress = spring({ frame: frame - 4, fps, config: SPRING_CONFIG });
  const mainScale = interpolate(mainProgress, [0, 1], [0.7, 1]);

  const subtitleProgress = spring({ frame: frame - 14, fps, config: SPRING_CONFIG });
  const subtitleY = interpolate(subtitleProgress, [0, 1], [15, 0]);

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
          gap: 20,
        }}
      >
        <div
          style={{
            fontFamily: inter,
            fontSize: 24,
            fontWeight: 500,
            color: COLORS.muted,
            opacity: subtitleProgress,
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          de zero a uma operação fiscal completa
        </div>

        <div
          style={{
            fontFamily: instrumentSerif,
            fontSize: 100,
            color: COLORS.foreground,
            opacity: mainProgress,
            transform: `scale(${mainScale})`,
          }}
        >
          Em menos de 5 minutos
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
