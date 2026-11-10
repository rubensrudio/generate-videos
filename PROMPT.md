# testando — Vídeo de Apresentação

> Use este prompt com Claude para criar o vídeo de apresentação do testando usando Remotion.

---

## Tech Stack

- **Remotion 4.x** (React + TypeScript)
- **Fontes**: `@remotion/google-fonts` — **Inter** (weights: 400, 500, 600, 700) e **Instrument Serif** (weight: 400)
- **Monospace**: `'SF Mono', 'Fira Code', 'Cascadia Code', monospace`
- **TTS**: ElevenLabs API (token em `.env`)
- **Música de fundo**: Royalty-free em `/public`

## Configurações do Vídeo

| Propriedade | Valor |
|-------------|-------|
| Resolução | 1920×1080 (16:9 paisagem) |
| FPS | 30 |
| Duração total | 1389 frames (~46.3 segundos) |

---

## Narração (ElevenLabs)

| Configuração | Valor |
|--------------|-------|
| Voice ID | `S4M4JhZIzYGUlDsYIOow` |
| Voz fallback (free) | Laura — `FGY2WhTYpPnrIDTdsKH5` |
| Modelo | `eleven_multilingual_v2` |
| Stability | 0.3 |
| Similarity boost | 0.8 |
| Style | 0.8 |
| Speaker boost | true |

Gerar um MP3 por cena com estas configurações. Nomeie os arquivos como `v1-s<cena>.mp3`: `v1-s01.mp3`, `v1-s02.mp3`, `v1-s03.mp3`, `v1-s04.mp3`, `v1-s05.mp3`, `v1-s06.mp3`, `v1-s06b.mp3`, `v1-s07.mp3`, `v1-s08.mp3`, `v1-s09.mp3`, `v1-s10.mp3`.

## Música de Fundo

- **Arquivo**: `/public/background.mp3`
- **Volume**: 0.15 (bem baixo, sob a narração)
- **Inicia em**: frame 45 (1.5 segundos)
- Toca pelo restante da duração

---

## Roteiro de Narração (por cena)

| Cena | Arquivo | Texto da narração |
|------|---------|-------------------|
| 1 — Intro | v1-s01.mp3 | "Introducing Sendkit. AI-native email infrastructure." |
| 2 — Signups Pouring In | v1-s02.mp3 | "You just launched your SaaS. Users are signing up." |
| 3 — Pain — No Emails Sent | v1-s03.mp3 | "But nothing happens. No welcome email. No first steps. They signed up and forgot you exist." |
| 4 — Agitation — Complexity | v1-s04.mp3 | "Setting up email infrastructure takes days. Multiple tools. Endless configuration." |
| 5 — Relief — Just Tell Sendkit | v1-s05.mp3 | "Or... you just tell Sendkit what you need." |
| 6 — Templates Created | v1-s06.mp3 | "Seven emails. Created in seconds." |
| 6b — Email Preview | v1-s06b.mp3 | "Pixel-perfect. Personalized. Ready to send." |
| 7 — Automation Flow | v1-s07.mp3 | "Your automation goes live. Every signup gets the right email, at the right time." |
| 8 — Metrics Payoff | v1-s08.mp3 | "They engage. They convert. They pay." |
| 9 — Mic Drop | v1-s09.mp3 | "From zero to a complete email stack. Under five minutes." |
| 10 — CTA | v1-s10.mp3 | "Try free at sendkit.dev" |

---

## Detalhamento Cena a Cena

### Cena 1: Intro
- **Frames**: 0–138 (138 frames)
- **Conteúdo**: Sendkit logo (100×100, rounded 22px) springs in from scale 0 → 1. Title "Introducing Sendkit" in Instrument Serif 76px. Subtitle "AI-native email infrastructure" in Inter 28px, muted color.
- **Animação**: Logo spring no frame 2 (scale 0 → 1), título no frame 8 (slide up 30px), subtítulo no frame 18 (slide up 15px).
- **Fade out**: frame 126

### Cena 2: Signups Pouring In
- **Frames**: 138–233 (95 frames)
- **Conteúdo**: BrowserWindow component (700px wide, URL: "yourapp.com/dashboard"). Dashboard header with green badge "X new signups today" counting up to 12. Five signup notification rows stagger in from the right.
  Signups: Sarah K (sarah@acme.co, green), James M (james@startup.io, blue), Alex R (alex@company.com, purple), Maria D (maria@design.co, orange), Tom A (tom@agency.dev, green)
- **Animação**: Card ou janela principal spring no frame 3 (scale 0.9 → 1). Itens internos entram em stagger a cada 10 frames a partir do frame 8, deslizando 120px da direita.
- **Fade out**: frame 83

### Cena 3: Pain — No Emails Sent
- **Frames**: 233–427 (194 frames)
- **Conteúdo**: Two phases:
  Phase 1 (frames 0–95): Same BrowserWindow (900px wide) but with "Users leaving" red badge. The same 5 signup rows progressively fade out and slide right (grayscale filter increases). Desaturation builds over time.
  Phase 2 (from frame 95): Giant red "0" (160px, Inter bold 700) springs in with "emails sent" (24px, muted) below it. Then italic Instrument Serif 38px text in muted color: "They signed up... and forgot you exist." (appears at frame 125 with slide up 15px).
- **Animação**: Fase 1: elementos perdem cor (grayscale crescente) e deslizam para fora. Fase 2 (a partir do frame 95): número ou frase de impacto com spring, seguido de texto em Instrument Serif itálico no frame 125 (slide up 15px).
- **Fade out**: frame 182

### Cena 4: Agitation — Complexity
- **Frames**: 427–579 (152 frames)
- **Conteúdo**: Header text "Days of setup" (28px, weight 600) + "Multiple tools. Endless configuration." (22px, muted). Six floating tool cards (200px wide, padding 16px 20px, rounded 12px, white bg, shadow `0 4px 20px rgba(0,0,0,0.06)`) scattered with rotation. Each card has a colored dot (8px) at top + label (15px, weight 600) + unique content. All connected by messy dashed SVG lines (strokeWidth 1.5, dasharray 8, 60% opacity):
  Email API (blue, x:-320 y:-180 rot:-6) — shows `POST /v1/send` in mono font
  Template Builder (purple, x:80 y:-200 rot:4) — shows skeleton wireframe blocks
  Automation Tool (orange, x:-200 y:-20 rot:-3) — shows SVG circle→line→circle flow
  Analytics Dashboard (green, x:180 y:-40 rot:5) — shows mini bar chart
  SMTP Config (red, x:-280 y:140 rot:-8) — shows Host/Port form fields
  DNS Setup (purple, x:120 y:160 rot:7) — shows TXT/CNAME/MX tags
- **Animação**: Cards entram em stagger a cada 12 frames (scale 0.3 → 1). Linhas de conexão tracejadas surgem entre os frames 50 e 100.
- **Fade out**: frame 140

### Cena 5: Relief — Just Tell Sendkit
- **Frames**: 579–696 (117 frames)
- **Conteúdo**: Large card (760px wide) with Sendkit logo + name + green "MCP" badge. Typewriter effect types: "Create a 7-day onboarding email sequence for my SaaS". Then three animated thinking dots appear (cycling green/gray).
- **Animação**: Card com spring de entrada. Efeito typewriter digita o texto entre os frames 10 e 50. Após o frame 52, três dots animados de "processando" (alternando verde/cinza).
- **Fade out**: frame 105

### Cena 6: Templates Created
- **Frames**: 696–822 (126 frames)
- **Conteúdo**: Seven template cards in a vertical list (600px wide), each with green checkmark:
  Day 1 — Welcome aboard
  Day 2 — Getting started
  Day 3 — Tips for your first week
  Day 4 — What others are building
  Day 5 — A feature you'll love
  Day 6 — Your journey so far
  Day 7 — We'd love feedback
  Summary badge (green): "7 templates · 1 prompt"
- **Animação**: Cards alternam slide da esquerda (-200px) e da direita (+200px) a cada 8 frames. Badge de resumo aparece no frame 70.
- **Fade out**: frame 114

### Cena 6b: Email Preview
- **Frames**: 822–946 (124 frames)
- **Conteúdo**: A pixel-perfect welcome email card (620px wide, padding 40px 24px). Contains:
  Sendkit logo (28px height, rounded 4px)
  Heading (28px, bold): "Welcome to Sendkit! 🚀"
  Body paragraph 1 (16px, #333): "Hey, I'm Paulo — I built Sendkit. Thanks for signing up!"
  Body paragraph 2 (16px, #333): "Quick context on what you just got: Sendkit handles your transactional emails, campaigns, and automations in one place. Your free plan comes with **3,000** emails/month. No credit card needed."
  Intro to steps (16px): "To start sending, you just need three things:"
  Three numbered setup steps in cream (#f5f5f0) rounded cards:
  "Add your sending domain" — "You'll set up DKIM, SPF, and DMARC. Takes about 5 minutes."
  "Create an API key" — "Go to Settings → API Keys. You'll need this for the SDK or SMTP."
  "Send your first email" — "Use the REST API, SMTP, or pick one of our 10 SDKs."
  Black pill CTA button (#1a1a19 bg, white text, rounded 50px, 15px font): "Set up my domain →"
  Signature (16px, #333): "Talk soon," / "Paulo Castellano" (bold) / "Founder, Sendkit" (14px, #888)
- **Animação**: Reveal escalonado: cada seção faz fade in e slide up 15px, espaçadas 8 frames a partir do frame 10.
- **Fade out**: frame 112

### Cena 7: Automation Flow
- **Frames**: 946–1107 (161 frames)
- **Conteúdo**: Vertical automation flow with five cards (300px wide, padding 14px 20px, rounded 12px, white bg, shadow `0 4px 16px rgba(0,0,0,0.05)`). Each card has a colored dot (8px), bold title (16px, weight 700), and two skeleton bars (80% width 7px height, then 55% width 7px height, cream bg). Connected by animated dashed lines:
  New signup (blue dot)
  Welcome email (green dot)
  Wait 2 days (orange dot)
  Getting started (green dot)
  Opened? (purple dot)
  After the last card, SVG branches split into two dashed paths: green "Yes → nurture" (left) and red "No → re-engage" (right), appearing after the last card.
  Badge: "Automation live" (20px, weight 700, green) with pulsing green dot (12px, glows with `boxShadow`), greenLight background, padding 14px 32px, rounded 24px, shadow `0 4px 16px rgba(22, 163, 74, 0.2)`. Positioned absolute top-right corner (top: 40, right: 60). Appears with first card with spring scale 0.5→1.
- **Animação**: Cards começam no frame 5; cada par card + linha leva 20 frames, e a linha começa 10 frames após o card. Cards spring scale 0.8 → 1 e slide up 15px. Linhas tracejadas (3px × 40px) animam com marching ants.
- **Fade out**: frame 149

### Cena 8: Metrics Payoff
- **Frames**: 1107–1211 (104 frames)
- **Conteúdo**: Headline in Instrument Serif 44px: "Turn signups into paying customers". Three horizontal metric cards (280px each):
  Conversions (green dot): "+32%" (36px, bold, green) with animated sparkline SVG (stroke draws in via strokeDasharray/offset)
  Revenue (blue dot): Counts up from $0 to $12,400 (36px, bold, blue) + "from email" label (14px, muted)
  Customers (purple dot): Counts up from 0 to 847 (36px, bold, purple) + 5 overlapping avatar circles (26px, -8px margin overlap, 80% opacity, colors: blue/green/purple/orange/green, 2px white border)
- **Animação**: Headline spring no frame 2. Cards em stagger nos frames 10, 16 e 22 (scale 0.3 → 1). Números contam entre os frames 18 e 55.
- **Fade out**: frame 92

### Cena 9: Mic Drop
- **Frames**: 1211–1312 (101 frames)
- **Conteúdo**: Subtitle in Inter 24px weight 500 muted: "from zero to a complete email stack". Main text in Instrument Serif 100px weight 400 foreground: "Under 5 minutes".
- **Animação**: Texto principal spring no frame 4 (scale 0.7 → 1). Subtítulo faz fade in e slide up 15px no frame 14.
- **Fade out**: frame 89

### Cena 10: CTA
- **Frames**: 1312–1389 (77 frames)
- **Conteúdo**: Sendkit logo (80×80, rounded 18px). Instrument Serif 64px: "try free at sendkit.dev". Green animated underline under "sendkit.dev" (grows from 0% to 100% width).
- **Animação**: Logo spring no frame 2. Texto slide up no frame 8. Underline verde anima no frame 16. Sem fade out — segura até o final.

---

## Sistema Visual de Design

### Cores

```
bg:          #f5f5f0  — fundo do vídeo
card:        #ffffff
border:      #e2e2dc  — olive
foreground:  #262622  — texto principal
muted:       #757568  — legendas e textos de apoio
green:       #16a34a  — cor principal da marca
greenLight:  rgba(22, 163, 74, 0.12)  — fundos de badge/tag
greenGlow:   rgba(22, 163, 74, 0.25)  — efeitos de glow
blue:        #2563eb
blueLight:   rgba(37, 99, 235, 0.10)
orange:      #ea580c
orangeLight: rgba(234, 88, 12, 0.10)
purple:      #7c3aed
purpleLight: rgba(124, 58, 237, 0.10)
red:         #dc2626  — alertas e dor
redLight:    rgba(220, 38, 38, 0.10)
pinkBlob:    rgba(255, 182, 193, 0.25)  — blob de fundo top-right
peachBlob:   rgba(255, 218, 185, 0.2)  — blob de fundo bottom-left
```

### Fontes
- **Body**: Inter (via `@remotion/google-fonts/Inter`) — weights 400, 500, 600, 700
- **Headlines/texto emocional**: Instrument Serif (via `@remotion/google-fonts/InstrumentSerif`) — weight 400
- **Monospace** (códigos): `'SF Mono', 'Fira Code', 'Cascadia Code', monospace`

### Fundo

- Cor #f5f5f0 com grid pattern sutil (60px spacing, border color com alpha 90 hex, 60% opacity)
- Blob de gradiente radial rosa (canto superior-direito, 700px diâmetro, 25% alpha, blur 40px)
- Blob de gradiente radial pêssego (canto inferior-esquerdo, 700px diâmetro, 20% alpha, blur 40px)

### Cards

- Fundo branco, border olive (1px solid #e2e2dc), rounded 12–14px
- Shadow: `0 25px 60px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.04)`

### BrowserWindow Component

- Estilo macOS com três dots (red #ff5f57, yellow #ffbd2e, green #28c840)
- URL bar centralizada em pill creme com border olive
- Rounded 14px corners

### Padrões de Animação

- **Spring**: damping 10, stiffness 150, mass 0.8, overshootClamping false
- **Fade out**: Últimos 12 frames de cada cena → opacity 0, scale 0.96
- **Stagger**: 8–15 frames entre itens

---

## Processo para Recriar

1. **Gerar áudio**: Use a API ElevenLabs com as configurações de voz acima e o roteiro de narração. Salve como `v1-s01.mp3` até `v1-s10.mp3` + `v1-s06b.mp3`.
2. **Medir durações**: Use `ffprobe` para obter a duração de cada arquivo de áudio em segundos, multiplique por 30 (fps) para obter frames. Adicione 5 frames de padding.
3. **Ajustar timings das cenas**: Os valores de frame acima são estimativas. Recalcule `from` e `durationInFrames` de cada cena com base nos arquivos de áudio reais.
4. **Construir cenas**: Siga as descrições acima. Todo UI é construído em React (sem screenshots).
5. **Adicionar música de fundo**: Coloque a música em `/public/background.mp3`, volume 0.15, iniciando no frame 45.
6. **Assets necessários**: Logo do testando em `public/images/logo.jpg` (quadrado, versão escura).

---

## Princípios de Design

- **Sem screenshots** — todo UI é composto por componentes React animados
- **Arco narrativo**: Dor → Solução → Resultado (não uma lista de features)
- **Audio-first timing**: Gerar áudio → medir → construir cenas ao redor do áudio
- **Cada card é único**: Cards de ferramentas têm visuais internos distintos que combinam com sua função
- **Fundo sutil**: Grid visível mas não dominante
- **Animações spring**: Tudo usa springs, nunca easing linear
