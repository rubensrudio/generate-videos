/**
 * Valores iniciais do formulário (CT-2): o exemplo Sendkit do
 * `PROMPT-TEMPLATE.md`, reduzido aos campos que o usuário preenche.
 *
 * Este arquivo NÃO lê o PROMPT-TEMPLATE.md em runtime. O conteúdo é uma
 * transcrição congelada em build-time. O único import é `import type`, então
 * o arquivo roda no Node via type stripping sem dependência de runtime.
 */

import type { PromptFormValue, SceneValue } from './prompt.model';

/** Duração inicial de uma cena nova (3 s a 30 fps); recalculada depois pelo áudio. */
export const DEFAULT_SCENE_DURATION = '90';

export function createEmptyScene(): SceneValue {
  return {
    type: 'CUSTOM',
    subScene: false,
    title: '',
    narration: '',
    durationFrames: DEFAULT_SCENE_DURATION,
    content: '',
    animation: '',
  };
}

function scene(
  type: SceneValue['type'],
  title: string,
  durationFrames: number,
  narration: string,
  content: string | string[],
  subScene = false,
): SceneValue {
  return {
    type,
    subScene,
    title,
    narration,
    durationFrames: String(durationFrames),
    content: Array.isArray(content) ? content.join('\n') : content,
    animation: '',
  };
}

export const TEMPLATE_DEFAULTS: PromptFormValue = {
  brand: {
    productName: 'Sendkit',
    logoPath: '',
  },
  video: {
    format: 'LANDSCAPE_16_9',
    monoFont: 'SF_MONO',
  },
  scenes: [
    scene(
      'INTRO',
      'Intro',
      138,
      'Introducing Sendkit. AI-native email infrastructure.',
      'Sendkit logo (100×100, rounded 22px) springs in from scale 0 → 1. Title "Introducing Sendkit" in Instrument Serif 76px. Subtitle "AI-native email infrastructure" in Inter 28px, muted color.',
    ),
    scene(
      'CONTEXT',
      'Signups Pouring In',
      95,
      'You just launched your SaaS. Users are signing up.',
      [
        'BrowserWindow component (700px wide, URL: "yourapp.com/dashboard"). Dashboard header with green badge "X new signups today" counting up to 12. Five signup notification rows stagger in from the right.',
        'Signups: Sarah K (sarah@acme.co, green), James M (james@startup.io, blue), Alex R (alex@company.com, purple), Maria D (maria@design.co, orange), Tom A (tom@agency.dev, green)',
      ],
    ),
    scene(
      'PAIN',
      'Pain — No Emails Sent',
      194,
      'But nothing happens. No welcome email. No first steps. They signed up and forgot you exist.',
      [
        'Two phases:',
        'Phase 1 (frames 0–95): Same BrowserWindow (900px wide) but with "Users leaving" red badge. The same 5 signup rows progressively fade out and slide right (grayscale filter increases). Desaturation builds over time.',
        'Phase 2 (from frame 95): Giant red "0" (160px, Inter bold 700) springs in with "emails sent" (24px, muted) below it. Then italic Instrument Serif 38px text in muted color: "They signed up... and forgot you exist." (appears at frame 125 with slide up 15px).',
      ],
    ),
    scene(
      'AGITATION',
      'Agitation — Complexity',
      152,
      'Setting up email infrastructure takes days. Multiple tools. Endless configuration.',
      [
        'Header text "Days of setup" (28px, weight 600) + "Multiple tools. Endless configuration." (22px, muted). Six floating tool cards (200px wide, padding 16px 20px, rounded 12px, white bg, shadow `0 4px 20px rgba(0,0,0,0.06)`) scattered with rotation. Each card has a colored dot (8px) at top + label (15px, weight 600) + unique content. All connected by messy dashed SVG lines (strokeWidth 1.5, dasharray 8, 60% opacity):',
        'Email API (blue, x:-320 y:-180 rot:-6) — shows `POST /v1/send` in mono font',
        'Template Builder (purple, x:80 y:-200 rot:4) — shows skeleton wireframe blocks',
        'Automation Tool (orange, x:-200 y:-20 rot:-3) — shows SVG circle→line→circle flow',
        'Analytics Dashboard (green, x:180 y:-40 rot:5) — shows mini bar chart',
        'SMTP Config (red, x:-280 y:140 rot:-8) — shows Host/Port form fields',
        'DNS Setup (purple, x:120 y:160 rot:7) — shows TXT/CNAME/MX tags',
      ],
    ),
    scene(
      'RELIEF',
      'Relief — Just Tell Sendkit',
      117,
      'Or... you just tell Sendkit what you need.',
      'Large card (760px wide) with Sendkit logo + name + green "MCP" badge. Typewriter effect types: "Create a 7-day onboarding email sequence for my SaaS". Then three animated thinking dots appear (cycling green/gray).',
    ),
    scene('LIST', 'Templates Created', 126, 'Seven emails. Created in seconds.', [
      'Seven template cards in a vertical list (600px wide), each with green checkmark:',
      'Day 1 — Welcome aboard',
      'Day 2 — Getting started',
      'Day 3 — Tips for your first week',
      'Day 4 — What others are building',
      "Day 5 — A feature you'll love",
      'Day 6 — Your journey so far',
      "Day 7 — We'd love feedback",
      'Summary badge (green): "7 templates · 1 prompt"',
    ]),
    scene(
      'PREVIEW',
      'Email Preview',
      124,
      'Pixel-perfect. Personalized. Ready to send.',
      [
        'A pixel-perfect welcome email card (620px wide, padding 40px 24px). Contains:',
        'Sendkit logo (28px height, rounded 4px)',
        'Heading (28px, bold): "Welcome to Sendkit! 🚀"',
        'Body paragraph 1 (16px, #333): "Hey, I\'m Paulo — I built Sendkit. Thanks for signing up!"',
        'Body paragraph 2 (16px, #333): "Quick context on what you just got: Sendkit handles your transactional emails, campaigns, and automations in one place. Your free plan comes with **3,000** emails/month. No credit card needed."',
        'Intro to steps (16px): "To start sending, you just need three things:"',
        'Three numbered setup steps in cream (#f5f5f0) rounded cards:',
        '"Add your sending domain" — "You\'ll set up DKIM, SPF, and DMARC. Takes about 5 minutes."',
        '"Create an API key" — "Go to Settings → API Keys. You\'ll need this for the SDK or SMTP."',
        '"Send your first email" — "Use the REST API, SMTP, or pick one of our 10 SDKs."',
        'Black pill CTA button (#1a1a19 bg, white text, rounded 50px, 15px font): "Set up my domain →"',
        'Signature (16px, #333): "Talk soon," / "Paulo Castellano" (bold) / "Founder, Sendkit" (14px, #888)',
      ],
      true,
    ),
    scene(
      'FLOW',
      'Automation Flow',
      161,
      'Your automation goes live. Every signup gets the right email, at the right time.',
      [
        'Vertical automation flow with five cards (300px wide, padding 14px 20px, rounded 12px, white bg, shadow `0 4px 16px rgba(0,0,0,0.05)`). Each card has a colored dot (8px), bold title (16px, weight 700), and two skeleton bars (80% width 7px height, then 55% width 7px height, cream bg). Connected by animated dashed lines:',
        'New signup (blue dot)',
        'Welcome email (green dot)',
        'Wait 2 days (orange dot)',
        'Getting started (green dot)',
        'Opened? (purple dot)',
        'After the last card, SVG branches split into two dashed paths: green "Yes → nurture" (left) and red "No → re-engage" (right), appearing after the last card.',
        'Badge: "Automation live" (20px, weight 700, green) with pulsing green dot (12px, glows with `boxShadow`), greenLight background, padding 14px 32px, rounded 24px, shadow `0 4px 16px rgba(22, 163, 74, 0.2)`. Positioned absolute top-right corner (top: 40, right: 60). Appears with first card with spring scale 0.5→1.',
      ],
    ),
    scene('METRICS', 'Metrics Payoff', 104, 'They engage. They convert. They pay.', [
      'Headline in Instrument Serif 44px: "Turn signups into paying customers". Three horizontal metric cards (280px each):',
      'Conversions (green dot): "+32%" (36px, bold, green) with animated sparkline SVG (stroke draws in via strokeDasharray/offset)',
      'Revenue (blue dot): Counts up from $0 to $12,400 (36px, bold, blue) + "from email" label (14px, muted)',
      'Customers (purple dot): Counts up from 0 to 847 (36px, bold, purple) + 5 overlapping avatar circles (26px, -8px margin overlap, 80% opacity, colors: blue/green/purple/orange/green, 2px white border)',
    ]),
    scene(
      'MIC_DROP',
      'Mic Drop',
      101,
      'From zero to a complete email stack. Under five minutes.',
      'Subtitle in Inter 24px weight 500 muted: "from zero to a complete email stack". Main text in Instrument Serif 100px weight 400 foreground: "Under 5 minutes".',
    ),
    scene(
      'CTA',
      'CTA',
      77,
      'Try free at sendkit.dev',
      'Sendkit logo (80×80, rounded 18px). Instrument Serif 64px: "try free at sendkit.dev". Green animated underline under "sendkit.dev" (grows from 0% to 100% width).',
    ),
  ],
  colors: {
    bg: '#f5f5f0',
    foreground: '#262622',
    muted: '#757568',
    green: '#16a34a',
    blue: '#2563eb',
    orange: '#ea580c',
    red: '#dc2626',
  },
  extraPrinciples: '',
};
