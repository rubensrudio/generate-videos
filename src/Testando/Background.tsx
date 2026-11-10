import { AbsoluteFill } from "remotion";
import { COLORS } from "./constants";

export const Background: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Base cream */}
      <AbsoluteFill style={{ backgroundColor: COLORS.bg }} />

      {/* Subtle grid */}
      <AbsoluteFill
        style={{
          opacity: 0.6,
          backgroundImage: `
            linear-gradient(${COLORS.border}90 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.border}90 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Pink blob top-right */}
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.pinkBlob}, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />

      {/* Peach blob bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: -200,
          left: -200,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.peachBlob}, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />
    </AbsoluteFill>
  );
};
