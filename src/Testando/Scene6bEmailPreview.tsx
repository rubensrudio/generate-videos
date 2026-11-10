import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CARD_SHADOW, COLORS, SPRING_CONFIG } from "./constants";
import { inter } from "./fonts";
import { Logo } from "./Logo";
import { SceneShell, fadeOutFor } from "./SceneShell";

const BODY: React.CSSProperties = {
  fontFamily: inter,
  fontSize: 16,
  color: "#333",
  lineHeight: 1.5,
  margin: 0,
};

const STEPS = [
  { title: "Add your sending domain", text: "You'll set up DKIM, SPF, and DMARC. Takes about 5 minutes." },
  { title: "Create an API key", text: "Go to Settings → API Keys. You'll need this for the SDK or SMTP." },
  { title: "Send your first email", text: "Use the REST API, SMTP, or pick one of our 10 SDKs." },
];

const Reveal: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 10 - index * 8, fps, config: SPRING_CONFIG });
  return (
    <div style={{ opacity: Math.min(p, 1), transform: `translateY(${interpolate(p, [0, 1], [15, 0])}px)` }}>
      {children}
    </div>
  );
};

export const Scene6bEmailPreview: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = spring({ frame: frame - 2, fps, config: SPRING_CONFIG });

  return (
    <SceneShell fadeOutAt={fadeOutFor(duration)}>
      <div
        style={{
          width: 620,
          padding: "40px 24px",
          borderRadius: 14,
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          boxShadow: CARD_SHADOW,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          opacity: Math.min(card, 1),
          transform: `scale(${interpolate(card, [0, 1], [0.95, 1])})`,
        }}
      >
        <Reveal index={0}>
          <Logo size={28} radius={4} />
        </Reveal>
        <Reveal index={1}>
          <div style={{ fontFamily: inter, fontSize: 28, fontWeight: 700, color: "#1a1a19" }}>
            Welcome to Sendkit! 🚀
          </div>
        </Reveal>
        <Reveal index={2}>
          <p style={BODY}>Hey, I&apos;m Paulo — I built Sendkit. Thanks for signing up!</p>
        </Reveal>
        <Reveal index={3}>
          <p style={BODY}>
            Quick context on what you just got: Sendkit handles your transactional emails, campaigns, and
            automations in one place. Your free plan comes with <strong>3,000</strong> emails/month. No credit card
            needed.
          </p>
        </Reveal>
        <Reveal index={4}>
          <p style={BODY}>To start sending, you just need three things:</p>
        </Reveal>
        <Reveal index={5}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 10,
                  backgroundColor: "#f5f5f0",
                }}
              >
                <span style={{ fontFamily: inter, fontSize: 16, fontWeight: 700, color: "#1a1a19", width: 18 }}>
                  {i + 1}.
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontFamily: inter, fontSize: 15, fontWeight: 700, color: "#1a1a19" }}>
                    {step.title}
                  </span>
                  <span style={{ fontFamily: inter, fontSize: 14, color: "#555", lineHeight: 1.4 }}>{step.text}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal index={6}>
          <div
            style={{
              display: "inline-block",
              fontFamily: inter,
              fontSize: 15,
              fontWeight: 600,
              color: "white",
              backgroundColor: "#1a1a19",
              padding: "12px 26px",
              borderRadius: 50,
            }}
          >
            Set up my domain →
          </div>
        </Reveal>
        <Reveal index={7}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={BODY}>Talk soon,</span>
            <span style={{ ...BODY, fontWeight: 700 }}>Paulo Castellano</span>
            <span style={{ fontFamily: inter, fontSize: 14, color: "#888" }}>Founder, Sendkit</span>
          </div>
        </Reveal>
      </div>
    </SceneShell>
  );
};
