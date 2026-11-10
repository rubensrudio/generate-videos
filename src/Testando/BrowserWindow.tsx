import { COLORS, CARD_SHADOW } from "./constants";
import { inter } from "./fonts";

export const BrowserWindow: React.FC<{
  url: string;
  width?: number;
  children: React.ReactNode;
}> = ({ url, width = 900, children }) => {
  return (
    <div
      style={{
        width,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        boxShadow: CARD_SHADOW,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          backgroundColor: COLORS.bg,
          borderBottom: `1px solid ${COLORS.border}`,
          gap: 8,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 7 }}>
          {["#ff5f57", "#ffbd2e", "#28c840"].map((c) => (
            <div
              key={c}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: c,
              }}
            />
          ))}
        </div>

        {/* URL bar */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              padding: "5px 24px",
              borderRadius: 20,
              backgroundColor: COLORS.bg,
              border: `1px solid ${COLORS.border}`,
              fontFamily: inter,
              fontSize: 13,
              color: COLORS.muted,
            }}
          >
            {url}
          </div>
        </div>

        <div style={{ width: 54 }} />
      </div>

      {/* Content */}
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
};
