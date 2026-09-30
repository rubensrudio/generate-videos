/**
 * Defaults do template Sendkit (CT-2), transcritos de `PROMPT-TEMPLATE.md`.
 *
 * Este arquivo NÃO lê o PROMPT-TEMPLATE.md em runtime (nem no navegador, nem
 * no servidor). Todo o conteúdo abaixo é uma transcrição literal, congelada
 * em build-time, dos valores descritos no template. O único import é `import
 * type` de `./prompt.model`, então o arquivo não tem nenhum import de valor e
 * pode ser executado pelo Node via type stripping sem qualquer dependência
 * de runtime.
 */

import type { PromptFormValue, SceneValue, TemplateFallbacks } from './prompt.model';

export function createEmptyScene(): SceneValue {
  return {
    id: '',
    title: '',
    narration: '',
    startFrame: '',
    endFrame: '',
    content: '',
    animation: '',
    fadeOutFrame: '',
  };
}

export const TEMPLATE_DEFAULTS: PromptFormValue = {
  identity: {
    productName: 'Sendkit',
    documentTitle: 'Sendkit Product Hunt Video — Replication Prompt',
    usageLine:
      'Use this prompt with Claude to recreate the exact Sendkit product introduction video using Remotion.',
  },
  techStack: {
    videoFramework: 'Remotion 4.x (React + TypeScript)',
    bodyFont: 'Inter',
    headingFont: 'Instrument Serif',
    monoFont: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
    ttsService: 'ElevenLabs API',
    musicSource: 'Royalty-free from Pixabay',
  },
  video: {
    width: '1920',
    height: '1080',
    formatDescription: '16:9 landscape',
    fps: '30',
    totalFrames: '1389',
  },
  voice: {
    voiceId: 'gJx1vCzNCD1EQHT212Ls',
    fallbackName: 'Laura',
    fallbackVoiceId: 'FGY2WhTYpPnrIDTdsKH5',
    model: 'eleven_multilingual_v2',
    stability: '0.3',
    similarityBoost: '0.8',
    style: '0.8',
    speakerBoost: true,
    audioPrefix: 'v4',
  },
  music: {
    file: '/public/background.mp3',
    volume: '0.15',
    startFrame: '45',
  },
  scenes: [
    {
      id: '1',
      title: 'Intro',
      narration: 'Introducing Sendkit. AI-native email infrastructure.',
      startFrame: '0',
      endFrame: '138',
      content:
        'Sendkit logo (100×100, rounded 22px) springs in from scale 0 → 1. Title "Introducing Sendkit" in Instrument Serif 76px. Subtitle "AI-native email infrastructure" in Inter 28px, muted color.',
      animation:
        'Logo springs at frame 2, title at frame 8 (slides up 30px), subtitle at frame 18 (slides up 15px). Fade out starts at frame 126 (opacity → 0, scale → 0.96 over 12 frames).',
      fadeOutFrame: '',
    },
    {
      id: '2',
      title: 'Signups Pouring In',
      narration: 'You just launched your SaaS. Users are signing up.',
      startFrame: '138',
      endFrame: '233',
      content: [
        'BrowserWindow component (700px wide, URL: "yourapp.com/dashboard"). Dashboard header with green badge "X new signups today" counting up to 12. Five signup notification rows stagger in from the right.',
        'Signups: Sarah K (sarah@acme.co, green), James M (james@startup.io, blue), Alex R (alex@company.com, purple), Maria D (maria@design.co, orange), Tom A (tom@agency.dev, green)',
      ].join('\n'),
      animation:
        'Browser springs at frame 3 (scale 0.9→1). Each row enters every 10 frames starting at frame 8, sliding in 120px from right. Fade out at frame 83.',
      fadeOutFrame: '',
    },
    {
      id: '3',
      title: 'Pain — No Emails Sent',
      narration:
        'But nothing happens. No welcome email. No first steps. They signed up and forgot you exist.',
      startFrame: '233',
      endFrame: '427',
      content: [
        'Two phases:',
        'Phase 1 (frames 0–95): Same BrowserWindow (900px wide) but with "Users leaving" red badge. The same 5 signup rows progressively fade out and slide right (grayscale filter increases). Desaturation builds over time.',
        'Phase 2 (from frame 95): Giant red "0" (160px, Inter bold 700) springs in with "emails sent" (24px, muted) below it. Then italic Instrument Serif 38px text in muted color: "They signed up... and forgot you exist." (appears at frame 125 with slide up 15px).',
      ].join('\n'),
      animation: '',
      fadeOutFrame: '182',
    },
    {
      id: '4',
      title: 'Agitation — Complexity',
      narration: 'Setting up email infrastructure takes days. Multiple tools. Endless configuration.',
      startFrame: '427',
      endFrame: '579',
      content: [
        'Header text "Days of setup" (28px, weight 600) + "Multiple tools. Endless configuration." (22px, muted). Six floating tool cards (200px wide, padding 16px 20px, rounded 12px, white bg, shadow `0 4px 20px rgba(0,0,0,0.06)`) scattered with rotation. Each card has a colored dot (8px) at top + label (15px, weight 600) + unique content. All connected by messy dashed SVG lines (strokeWidth 1.5, dasharray 8, 60% opacity):',
        'Email API (blue, x:-320 y:-180 rot:-6) — shows `POST /v1/send` in mono font',
        'Template Builder (purple, x:80 y:-200 rot:4) — shows skeleton wireframe blocks',
        'Automation Tool (orange, x:-200 y:-20 rot:-3) — shows SVG circle→line→circle flow',
        'Analytics Dashboard (green, x:180 y:-40 rot:5) — shows mini bar chart',
        'SMTP Config (red, x:-280 y:140 rot:-8) — shows Host/Port form fields',
        'DNS Setup (purple, x:120 y:160 rot:7) — shows TXT/CNAME/MX tags',
      ].join('\n'),
      animation:
        'Cards stagger in every 12 frames (scale 0.3→1). Connection lines fade in between frames 50–100. Fade out at frame 140.',
      fadeOutFrame: '',
    },
    {
      id: '5',
      title: 'Relief — Just Tell Sendkit',
      narration: 'Or... you just tell Sendkit what you need.',
      startFrame: '579',
      endFrame: '696',
      content:
        'Large card (760px wide) with Sendkit logo + name + green "MCP" badge. Typewriter effect types: "Create a 7-day onboarding email sequence for my SaaS" (frames 10–50). After frame 52, three animated thinking dots appear (cycling green/gray).',
      animation: '',
      fadeOutFrame: '105',
    },
    {
      id: '6',
      title: 'Templates Created',
      narration: 'Seven emails. Created in seconds.',
      startFrame: '696',
      endFrame: '822',
      content: [
        'Seven template cards in a vertical list (600px wide), each with green checkmark:',
        'Day 1 — Welcome aboard',
        'Day 2 — Getting started',
        'Day 3 — Tips for your first week',
        'Day 4 — What others are building',
        "Day 5 — A feature you'll love",
        'Day 6 — Your journey so far',
        "Day 7 — We'd love feedback",
      ].join('\n'),
      animation:
        'Cards alternate sliding in from left (-200px) and right (+200px) every 8 frames. Green badge "7 templates · 1 prompt" appears at frame 70. Fade out at frame 114.',
      fadeOutFrame: '',
    },
    {
      id: '6b',
      title: 'Email Preview',
      narration: 'Pixel-perfect. Personalized. Ready to send.',
      startFrame: '822',
      endFrame: '946',
      content: [
        'A pixel-perfect welcome email card (620px wide, padding 40px 24px). Contains:',
        'Sendkit logo (28px height, rounded 4px)',
        'Heading (28px, bold): "Welcome to Sendkit! 🚀"',
        "Body paragraph 1 (16px, #333): \"Hey, I'm Paulo — I built Sendkit. Thanks for signing up!\"",
        'Body paragraph 2 (16px, #333): "Quick context on what you just got: Sendkit handles your transactional emails, campaigns, and automations in one place. Your free plan comes with **3,000** emails/month. No credit card needed."',
        'Intro to steps (16px): "To start sending, you just need three things:"',
        'Three numbered setup steps in cream (#f5f5f0) rounded cards:',
        '"Add your sending domain" — "You\'ll set up DKIM, SPF, and DMARC. Takes about 5 minutes."',
        '"Create an API key" — "Go to Settings → API Keys. You\'ll need this for the SDK or SMTP."',
        '"Send your first email" — "Use the REST API, SMTP, or pick one of our 10 SDKs."',
        'Black pill CTA button (#1a1a19 bg, white text, rounded 50px, 15px font): "Set up my domain →"',
        'Signature (16px, #333): "Talk soon," / "Paulo Castellano" (bold) / "Founder, Sendkit" (14px, #888)',
      ].join('\n'),
      animation:
        'Staggered content reveal — each section fades in and slides up 15px, spaced 8 frames apart (logo at frame 10, heading at 18, body at 26, steps intro at 34, each step at 38/44/50, CTA at 50, signature at 58). Fade out at frame 112.',
      fadeOutFrame: '',
    },
    {
      id: '7',
      title: 'Automation Flow',
      narration: 'Your automation goes live. Every signup gets the right email, at the right time.',
      startFrame: '946',
      endFrame: '1107',
      content: [
        'Vertical automation flow with five cards (300px wide, padding 14px 20px, rounded 12px, white bg, shadow `0 4px 16px rgba(0,0,0,0.05)`). Each card has a colored dot (8px), bold title (16px, weight 700), and two skeleton bars (80% width 7px height, then 55% width 7px height, cream bg). Connected by animated dashed lines:',
        'New signup (blue dot)',
        'Welcome email (green dot)',
        'Wait 2 days (orange dot)',
        'Getting started (green dot)',
        'Opened? (purple dot)',
        'After the last card, SVG branches split into two dashed paths: green "Yes → nurture" (left) and red "No → re-engage" (right).',
        'Badge: "Automation live" (20px, weight 700, green) with pulsing green dot (12px, glows with `boxShadow`), greenLight background, padding 14px 32px, rounded 24px, shadow `0 4px 16px rgba(22, 163, 74, 0.2)`. Positioned absolute top-right corner (top: 40, right: 60). Appears with first card (frame 5) with spring scale 0.5→1.',
      ].join('\n'),
      animation:
        'Cards start at frame 5, each card+line pair takes 20 frames (cards at frames 5, 25, 45, 65, 85). Lines start 10 frames after their card. Cards spring scale 0.8→1, slide up 15px. Dashed lines (3px wide, 40px tall) animate with marching ants (`backgroundPosition` animated with frame). Branch SVG lines appear at frame 100, branch labels at frame 115. Fade out at frame 149.',
      fadeOutFrame: '',
    },
    {
      id: '8',
      title: 'Metrics Payoff',
      narration: 'They engage. They convert. They pay.',
      startFrame: '1107',
      endFrame: '1211',
      content: [
        'Headline in Instrument Serif 44px: "Turn signups into paying customers". Three horizontal metric cards (280px each):',
        'Conversions (green dot): "+32%" (36px, bold, green) with animated sparkline SVG (stroke draws in via strokeDasharray/offset)',
        'Revenue (blue dot): Counts up from $0 to $12,400 (36px, bold, blue) + "from email" label (14px, muted)',
        'Customers (purple dot): Counts up from 0 to 847 (36px, bold, purple) + 5 overlapping avatar circles (26px, -8px margin overlap, 80% opacity, colors: blue/green/purple/orange/green, 2px white border)',
      ].join('\n'),
      animation:
        'Headline springs at frame 2. Cards stagger at frames 10, 16, 22 (scale 0.3→1). Numbers count up between frames 18–55. Fade out at frame 92.',
      fadeOutFrame: '',
    },
    {
      id: '9',
      title: 'Mic Drop',
      narration: 'From zero to a complete email stack. Under five minutes.',
      startFrame: '1211',
      endFrame: '1312',
      content:
        'Subtitle in Inter 24px weight 500 muted: "from zero to a complete email stack". Main text in Instrument Serif 100px weight 400 foreground: "Under 5 minutes".',
      animation:
        'Main text springs at frame 4 (scale 0.7→1). Subtitle fades in and slides up 15px at frame 14. Fade out at frame 89.',
      fadeOutFrame: '',
    },
    {
      id: '10',
      title: 'CTA',
      narration: 'Try free at sendkit.dev',
      startFrame: '1312',
      endFrame: '1389',
      content:
        'Sendkit logo (80×80, rounded 18px). Instrument Serif 64px: "try free at sendkit.dev". Green animated underline under "sendkit.dev" (grows from 0% to 100% width).',
      animation:
        'Logo springs at frame 2. Text slides up at frame 8. Underline animates at frame 16. No fade out — holds until end.',
      fadeOutFrame: '',
    },
  ],
  design: {
    colors: [
      { name: 'bg', value: '#f5f5f0', comment: 'warm cream' },
      { name: 'card', value: '#ffffff', comment: '' },
      { name: 'border', value: '#e2e2dc', comment: 'olive' },
      { name: 'foreground', value: '#262622', comment: '' },
      { name: 'muted', value: '#757568', comment: '' },
      { name: 'green', value: '#16a34a', comment: '' },
      { name: 'greenLight', value: 'rgba(22, 163, 74, 0.12)', comment: 'badge/tag backgrounds' },
      { name: 'greenGlow', value: 'rgba(22, 163, 74, 0.25)', comment: 'glow effects' },
      { name: 'blue', value: '#2563eb', comment: '' },
      { name: 'blueLight', value: 'rgba(37, 99, 235, 0.10)', comment: '' },
      { name: 'orange', value: '#ea580c', comment: '' },
      { name: 'orangeLight', value: 'rgba(234, 88, 12, 0.10)', comment: '' },
      { name: 'purple', value: '#7c3aed', comment: '' },
      { name: 'purpleLight', value: 'rgba(124, 58, 237, 0.10)', comment: '' },
      { name: 'red', value: '#dc2626', comment: '' },
      { name: 'redLight', value: 'rgba(220, 38, 38, 0.10)', comment: '' },
      { name: 'pinkBlob', value: 'rgba(255, 182, 193, 0.25)', comment: 'background blob top-right' },
      { name: 'peachBlob', value: 'rgba(255, 218, 185, 0.2)', comment: 'background blob bottom-left' },
    ],
    background: [
      'Cream (#f5f5f0) with a subtle grid pattern (60px spacing, border color at 90 hex alpha, 60% opacity)',
      'Pink radial gradient blob (top-right corner, 700px diameter, 25% alpha, blur 40px)',
      'Peach radial gradient blob (bottom-left corner, 700px diameter, 20% alpha, blur 40px)',
    ].join('\n'),
    cards: [
      'White background, olive border (1px solid #e2e2dc), rounded 12–14px',
      'Shadow: `0 25px 60px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.04)`',
    ].join('\n'),
    browserWindow: [
      'macOS-style with three dots (red #ff5f57, yellow #ffbd2e, green #28c840)',
      'URL bar centered in cream pill with olive border',
      'Rounded 14px corners',
    ].join('\n'),
    springDamping: '10',
    springStiffness: '150',
    springMass: '0.8',
    fadeOut: 'Last 12 frames of each scene → opacity 0, scale 0.96',
    stagger: '8–15 frames between items',
  },
  process: {
    steps: [
      "Generate audio: Use the ElevenLabs API with the voice settings above and the narration script. Save as `v4-s01.mp3` through `v4-s10.mp3` + `v4-s06b.mp3`.",
      "Measure durations: Use `ffprobe` to get each audio file's duration in seconds, multiply by 30 (fps) to get frames. Add 5 frames padding.",
      'Adjust scene timings: The frame values above are based on our specific audio durations. Recalculate your `from` and `durationInFrames` values based on your audio files.',
      'Build scenes: Follow the scene descriptions above. All UI is built in React (no screenshots).',
      'Add background music: Place your background music at `public/audio/music/background2.mp3`, volume 0.15, starting at frame 45.',
      'Assets needed: Sendkit logo at `public/images/sendkit-logo-dark.png` (square, dark version).',
    ],
  },
  principles: {
    items: [
      'No screenshots — all UI is animated React components',
      'Storytelling arc: Pain → Solution → Payoff (not a feature list)',
      'Audio-first timing: Generate audio → measure → build scenes around audio',
      'Every card is unique: Tool cards have distinct internal visuals matching their function',
      'Subtle background: Grid visible but not dominant',
      'Spring animations: Everything uses springs, never linear easing',
    ],
  },
};

export const TEMPLATE_FALLBACKS: TemplateFallbacks = {
  colors: [
    'bg:          #f5f5f0  (warm cream)',
    'card:        #ffffff',
    'border:      #e2e2dc  (olive)',
    'foreground:  #262622',
    'muted:       #757568',
    'green:       #16a34a',
    'greenLight:  rgba(22, 163, 74, 0.12)   — badge/tag backgrounds',
    'greenGlow:   rgba(22, 163, 74, 0.25)   — glow effects',
    'blue:        #2563eb',
    'blueLight:   rgba(37, 99, 235, 0.10)',
    'orange:      #ea580c',
    'orangeLight: rgba(234, 88, 12, 0.10)',
    'purple:      #7c3aed',
    'purpleLight: rgba(124, 58, 237, 0.10)',
    'red:         #dc2626',
    'redLight:    rgba(220, 38, 38, 0.10)',
    'pinkBlob:    rgba(255, 182, 193, 0.25) — background blob top-right',
    'peachBlob:   rgba(255, 218, 185, 0.2)  — background blob bottom-left',
  ].join('\n'),
  background: [
    '- Cream (#f5f5f0) with a subtle grid pattern (60px spacing, border color at 90 hex alpha, 60% opacity)',
    '- Pink radial gradient blob (top-right corner, 700px diameter, 25% alpha, blur 40px)',
    '- Peach radial gradient blob (bottom-left corner, 700px diameter, 20% alpha, blur 40px)',
  ].join('\n'),
  cards: [
    '- White background, olive border (1px solid #e2e2dc), rounded 12–14px',
    '- Shadow: `0 25px 60px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.04)`',
  ].join('\n'),
  browserWindow: [
    '- macOS-style with three dots (red #ff5f57, yellow #ffbd2e, green #28c840)',
    '- URL bar centered in cream pill with olive border',
    '- Rounded 14px corners',
  ].join('\n'),
  animationDefaults: [
    '- **Spring**: damping 10, stiffness 150, mass 0.8, overshootClamping false',
    '- **Fade out**: Last 12 frames of each scene → opacity 0, scale 0.96',
    '- **Stagger**: 8–15 frames between items',
  ].join('\n'),
  processSteps: [
    "1. **Generate audio**: Use the ElevenLabs API with the voice settings above and the narration script. Save as `v4-s01.mp3` through `v4-s10.mp3` + `v4-s06b.mp3`.",
    "2. **Measure durations**: Use `ffprobe` to get each audio file's duration in seconds, multiply by 30 (fps) to get frames. Add 5 frames padding.",
    '3. **Adjust scene timings**: The frame values above are based on our specific audio durations. Recalculate your `from` and `durationInFrames` values based on your audio files.',
    '4. **Build scenes**: Follow the scene descriptions above. All UI is built in React (no screenshots).',
    '5. **Add background music**: Place your background music at `public/audio/music/background2.mp3`, volume 0.15, starting at frame 45.',
    '6. **Assets needed**: Sendkit logo at `public/images/sendkit-logo-dark.png` (square, dark version).',
  ].join('\n'),
  principles: [
    '- **No screenshots** — all UI is animated React components',
    '- **Storytelling arc**: Pain → Solution → Payoff (not a feature list)',
    '- **Audio-first timing**: Generate audio → measure → build scenes around audio',
    '- **Every card is unique**: Tool cards have distinct internal visuals matching their function',
    '- **Subtle background**: Grid visible but not dominant',
    '- **Spring animations**: Everything uses springs, never linear easing',
  ].join('\n'),
};
