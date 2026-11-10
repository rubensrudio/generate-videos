import { COLORS } from "./constants";
import { inter } from "./fonts";

export const SignupRow: React.FC<{
  name: string;
  email: string;
  color: string;
  style?: React.CSSProperties;
}> = ({ name, email, color, style }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        borderRadius: 10,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.card,
        ...style,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: color,
          color: "white",
          fontFamily: inter,
          fontWeight: 600,
          fontSize: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {name[0]}
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <span style={{ fontFamily: inter, fontSize: 15, fontWeight: 600, color: COLORS.foreground }}>
          {name}
        </span>
        <span style={{ fontFamily: inter, fontSize: 13, color: COLORS.muted }}>{email}</span>
      </div>
      <span style={{ fontFamily: inter, fontSize: 13, color: COLORS.muted }}>just signed up</span>
    </div>
  );
};
