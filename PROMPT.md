# NotaFlow — Vídeo de Apresentação (Product Hunt / Lançamento)

> Use este prompt com Claude para criar o vídeo de apresentação do NotaFlow usando Remotion.

---

## Tech Stack

- **Remotion 4.x** (React + TypeScript)
- **Fonts**: `@remotion/google-fonts` — **Inter** (weights: 400, 500, 600, 700) e **Instrument Serif** (weight: 400)
- **Monospace**: JetBrains Mono (para CNPJs, protocolos, códigos)
- **TTS**: ElevenLabs API (token em `.env`)
- **Música de fundo**: Royalty-free em `/public`

## Configurações do Vídeo

| Propriedade | Valor |
|-------------|-------|
| Resolução | 1920×1080 (16:9 landscape) |
| FPS | 30 |
| Duração total | ~1400 frames (~46.7 segundos) |

---

## Narração (ElevenLabs)

| Configuração | Valor |
|--------------|-------|
| Voice ID | `S4M4JhZIzYGUlDsYIOow` |
| Voz fallback (free) | Laura — `S4M4JhZIzYGUlDsYIOow` |
| Modelo | `eleven_multilingual_v2` |
| Stability | 0.3 |
| Similarity boost | 0.8 |
| Style | 0.8 |
| Speaker boost | true |

Gerar um MP3 por cena com estas configurações. Nomeie como `v1-s01.mp3` até `v1-s10.mp3` (mais `v1-s06b.mp3`).

## Música de Fundo

- **Arquivo**: `/public/background.mp3` (royalty-free)
- **Volume**: 0.15 (bem baixo, sob a narração)
- **Inicia em**: frame 45 (1.5 segundos)
- Toca pelo restante da duração

---

## Roteiro de Narração (por cena)

| Cena | Arquivo | Texto da narração |
|------|---------|-------------------|
| 1 — Intro | v1-s01.mp3 | "Apresentamos o NotaFlow. Emissão de NFS-e inteligente para empresas de serviço." |
| 2 — Urgência | v1-s02.mp3 | "A partir de 2026, toda empresa de serviço precisa emitir NFS-e pela API Nacional. O prazo está chegando." |
| 3 — Dor | v1-s03.mp3 | "Mas a realidade é outra. Certificado digital, XML, validação, integração com a Receita Federal. Dias de configuração. Múltiplas ferramentas. Complexidade infinita." |
| 4 — Agitação | v1-s04.mp3 | "Enquanto isso, suas notas não saem. Seus clientes esperam. E o fiscal bate na porta." |
| 5 — Alívio | v1-s05.mp3 | "Ou... você simplesmente usa o NotaFlow." |
| 6 — Funcionalidades | v1-s06.mp3 | "Emissão individual ou em lote. Até 500 notas de uma vez. Em segundos." |
| 6b — Preview da nota | v1-s06b.mp3 | "Formulário guiado. Certificado digital seguro. Tudo validado antes do envio." |
| 7 — Automação | v1-s07.mp3 | "Acompanhe cada nota em tempo real. Dashboard completo. Histórico de emissões. Download de PDF e XML." |
| 8 — Métricas | v1-s08.mp3 | "Suas notas saem. Seus clientes recebem. Sua empresa fica em dia." |
| 9 — Mic drop | v1-s09.mp3 | "De zero a uma operação fiscal completa. Em menos de cinco minutos." |
| 10 — CTA | v1-s10.mp3 | "Teste grátis por 14 dias em notafiscalflow.com.br" |

---

## Detalhamento Cena a Cena

### Cena 1: Intro
- **Frames**: 0–138 (138 frames)
- **Conteúdo**: Logo do NotaFlow (ícone `receipt_long`, 100×100, rounded 22px) surge com spring de scale 0 → 1. Título "Apresentamos o NotaFlow" em Instrument Serif 76px. Subtítulo "Emissão de NFS-e inteligente" em Inter 28px, cor muted.
- **Animação**: Logo spring no frame 2, título no frame 8 (slide up 30px), subtítulo no frame 18 (slide up 15px). Fade out começa no frame 126 (opacity → 0, scale → 0.96 em 12 frames).

### Cena 2: Urgência — Prazo 2026
- **Frames**: 138–243 (105 frames)
- **Conteúdo**: Card central (700px wide) estilo "alerta oficial". Ícone de calendário no topo. Texto grande "01/01/2026" em Instrument Serif 72px, cor foreground. Abaixo: "API Nacional NFS-e obrigatória" em Inter 24px, muted. Um countdown visual com três blocos (dias, horas, minutos) em cards menores com fundo greenLight.
- **Animação**: Card principal spring no frame 3 (scale 0.9→1). Data surge no frame 10, subtítulo no frame 18. Blocos do countdown stagger a cada 8 frames a partir do frame 25. Fade out no frame 93.

### Cena 3: Dor — Complexidade
- **Frames**: 243–437 (194 frames)
- **Duas fases**:
  - **Fase 1 (frames 0–95)**: Seis cards flutuantes (200px wide, padding 16px 20px, rounded 12px, white bg, shadow `0 4px 20px rgba(0,0,0,0.06)`) espalhados com rotação. Cada card tem um dot colorido (8px) + label (15px, weight 600) + conteúdo único. Conectados por linhas SVG tracejadas (strokeWidth 1.5, dasharray 8, 60% opacity):
    - Certificado Digital (green, x:-320 y:-180 rot:-6) — mostra ícone de cadeado + "A1 PFX/P12"
    - Geração XML (purple, x:80 y:-200 rot:4) — mostra blocos de código XML esqueleto
    - Validação Schema (orange, x:-200 y:-20 rot:-3) — mostra ícone de checklist com X vermelho
    - API Receita Federal (blue, x:180 y:-40 rot:5) — mostra `POST /nfse/enviar` em mono
    - Configuração DNS (red, x:-280 y:140 rot:-8) — mostra SPF/DKIM/TXT tags
    - Assinatura Digital (purple, x:120 y:160 rot:7) — mostra ícone de certificado + hash
  - **Fase 2 (a partir do frame 95)**: Header "Dias de configuração" (28px, weight 600) + "Múltiplas ferramentas. Complexidade infinita." (22px, muted). Texto em Instrument Serif 38px itálico, muted: "Enquanto isso, suas notas não saem." (aparece no frame 125 com slide up 15px).
- **Animação**: Cards stagger a cada 12 frames (scale 0.3→1). Linhas de conexão surgem entre frames 50–100. Fade out no frame 182.

### Cena 4: Agitação — Consequências
- **Frames**: 437–589 (152 frames)
- **Conteúdo**: BrowserWindow (900px wide, URL: "receita.fazenda.gov.br"). Dashboard simulado com 3 alertas em vermelho escalonados:
  - "⚠ 47 notas pendentes de emissão" (badge vermelho)
  - "⚠ Cliente aguardando NFS-e há 5 dias" (badge laranja)
  - "⚠ Prazo fiscal vencendo em 48h" (badge vermelho pulsante)
- Abaixo do browser, texto grande em vermelho "0" (160px, Inter bold 700) com "notas emitidas este mês" (24px, muted). Depois, Instrument Serif 38px itálico muted: "E o fiscal bate na porta."
- **Animação**: Browser spring no frame 3. Alertas stagger a cada 15 frames. "0" spring no frame 70. Texto final no frame 95 (slide up 15px). Fade out no frame 140.

### Cena 5: Alívio — NotaFlow
- **Frames**: 589–706 (117 frames)
- **Conteúdo**: Card grande (760px wide) com logo NotaFlow + nome + badge verde "NFS-e Nacional". Efeito typewriter digita: "Emitir nota fiscal para ACME Consultoria, CNPJ 12.345.678/0001-90, serviço de consultoria em TI" (frames 10–50). Após frame 52, três dots animados de "processando" (cycling green/gray).
- **Fade out**: frame 105.

### Cena 6: Funcionalidades — Emissão em Lote
- **Frames**: 706–832 (126 frames)
- **Conteúdo**: Sete cards em lista vertical (600px wide), cada um com checkmark verde:
  1. NFS-e #001 — ACME Consultoria (R$ 5.200,00)
  2. NFS-e #002 — Tech Solutions (R$ 3.800,00)
  3. NFS-e #003 — Digital Agency (R$ 7.150,00)
  4. NFS-e #004 — StartupX (R$ 2.400,00)
  5. NFS-e #005 — DataCorp (R$ 9.600,00)
  6. NFS-e #006 — CloudBase (R$ 4.300,00)
  7. NFS-e #007 — InnovaLab (R$ 6.750,00)
- **Animação**: Cards alternam slide da esquerda (-200px) e direita (+200px) a cada 8 frames. Badge verde "7 notas · 1 lote · CSV upload" aparece no frame 70. Fade out no frame 114.

### Cena 6b: Preview do Formulário de Emissão
- **Frames**: 832–956 (124 frames)
- **Conteúdo**: Card de formulário guiado (620px wide, padding 40px 24px). Contém:
  - Logo NotaFlow (28px height, rounded 4px)
  - Heading (28px, bold): "Emissão de NFS-e"
  - **Step indicator**: 3 etapas (Dados → Serviço → Certificado) com dots conectados, step atual em verde
  - **Bloco Prestador**: Card creme (#f5f5f0) rounded com "CNPJ: 12.345.678/0001-90" em JetBrains Mono + "Razão Social: HaloTechLabs LTDA" em Inter
  - **Bloco Tomador**: Card creme com "CNPJ: 98.765.432/0001-10" em JetBrains Mono + "Razão Social: ACME Consultoria" em Inter
  - **Bloco Serviço**: Card creme com "Código: 1.01" + "Descrição: Consultoria em TI" + "Valor: R$ 5.200,00" em destaque verde (24px bold)
  - Botão CTA verde (#1B5E20 bg, white text, rounded 50px, 15px font): "Emitir NFS-e →"
  - Texto pequeno (14px, muted): "Certificado digital criptografado · nunca armazenado no servidor"
- **Animação**: Reveal escalonado — cada seção fade in e slide up 15px, espaçados 8 frames (logo no frame 10, heading no 18, steps no 26, prestador no 34, tomador no 40, serviço no 46, botão no 52, texto segurança no 58). Fade out no frame 112.

### Cena 7: Dashboard e Acompanhamento
- **Frames**: 956–1117 (161 frames)
- **Conteúdo**: Layout de dashboard com sidebar esquerda minimalista (ícones: dashboard, emissão, histórico, upload, suporte). Área principal com:
  - **Header**: "Dashboard" + toggle "Produção/Homologação" (badge verde/azul)
  - Cinco cards de status em grade vertical (300px wide, padding 14px 20px, rounded 12px, white bg, shadow):
    1. Nota #001 — Processado (dot verde, badge verde "Processado")
    2. Nota #002 — Processado (dot verde)
    3. Nota #003 — Recebido (dot azul, badge azul "Recebido")
    4. Nota #004 — Processando (dot laranja, spinner)
    5. Nota #005 — Processado (dot verde)
  - Conectados por linha tracejada vertical animada
- **Badge flutuante**: "5 notas emitidas" (20px, weight 700, green) com dot verde pulsante (12px, glow `boxShadow`), fundo greenLight, padding 14px 32px, rounded 24px. Posição absolute top-right (top: 40, right: 60). Aparece no frame 5 com spring scale 0.5→1.
- **Animação**: Cards começam no frame 5, cada card+linha leva 20 frames (frames 5, 25, 45, 65, 85). Linhas 10 frames após cada card. Cards spring scale 0.8→1, slide up 15px. Linhas tracejadas (3px wide, 40px tall) animam com marching ants. Fade out no frame 149.

### Cena 8: Métricas de Resultado
- **Frames**: 1117–1221 (104 frames)
- **Conteúdo**: Headline em Instrument Serif 44px: "Sua empresa em dia com o fisco". Três cards horizontais de métrica (280px cada):
  - **Notas emitidas** (green dot): Conta de 0 até "847" (36px, bold, green) + sparkline SVG animada (stroke draw-in via strokeDasharray/offset) + "este mês" (14px, muted)
  - **Valor total** (blue dot): Conta de R$ 0 até "R$ 284.500" (36px, bold, blue) + "em serviços" (14px, muted)
  - **Taxa de sucesso** (purple dot): Conta de 0% até "99,7%" (36px, bold, purple) + 5 círculos sobrepostos de avatar (26px, -8px margin overlap, 80% opacity, cores: green/green/green/green/blue, 2px white border) representando os status
- **Animação**: Headline spring no frame 2. Cards stagger nos frames 10, 16, 22 (scale 0.3→1). Números contam entre frames 18–55. Fade out no frame 92.

### Cena 9: Mic Drop
- **Frames**: 1221–1322 (101 frames)
- **Conteúdo**: Subtítulo em Inter 24px weight 500 muted: "de zero a uma operação fiscal completa". Texto principal em Instrument Serif 100px weight 400 foreground: "Em menos de 5 minutos".
- **Animação**: Texto principal spring no frame 4 (scale 0.7→1). Subtítulo fade in e slide up 15px no frame 14. Fade out no frame 89.

### Cena 10: CTA
- **Frames**: 1322–1400 (78 frames)
- **Conteúdo**: Logo NotaFlow (80×80, rounded 18px). Instrument Serif 64px: "teste grátis por 14 dias". Inter 32px weight 500: "notafiscalflow.com.br". Underline verde animado sob "notafiscalflow.com.br" (cresce de 0% a 100% width). Texto pequeno Inter 16px muted: "Sem cartão de crédito. Sem configuração."
- **Animação**: Logo spring no frame 2. Texto principal slide up no frame 8. URL slide up no frame 14. Underline anima no frame 20. Texto pequeno fade in no frame 28. **Sem fade out** — segura até o final.

---

## Sistema Visual de Design

### Cores (inspiradas no tema "Livro Fiscal")
```
bg:          #F5F4F1  (creme quente — papel de nota fiscal)
card:        #FFFFFF
border:      #E2E2DC  (olive)
foreground:  #1C2B3A  (navy ink — tinta de documento)
muted:       #728999
green:       #1B5E20  (verde Receita Federal — cor principal da marca)
greenMid:    #388E3C
greenLight:  #E8F5E9
greenGlow:   rgba(27, 94, 32, 0.25)
blue:        #1565C0
blueLight:   #E8F0FD
orange:      #E65100
orangeLight: #FFF3E0
purple:      #7c3aed
purpleLight: rgba(124, 58, 237, 0.10)
red:         #C62828
redLight:    #FFEBEE
pinkBlob:    rgba(255, 182, 193, 0.25) — blob de fundo top-right
peachBlob:   rgba(255, 218, 185, 0.2)  — blob de fundo bottom-left
```

### Fontes
- **Body**: Inter (via `@remotion/google-fonts/Inter`) — weights 400, 500, 600, 700
- **Headlines/texto emocional**: Instrument Serif (via `@remotion/google-fonts/InstrumentSerif`) — weight 400
- **Monospace** (CNPJs, protocolos, códigos): JetBrains Mono (via `@remotion/google-fonts/JetBrainsMono`)

### Fundo
- Creme (#F5F4F1) com grid pattern sutil (60px spacing, border color 90 hex alpha, 60% opacity)
- Blob de gradiente radial rosa (canto superior-direito, 700px diâmetro, 25% alpha, blur 40px)
- Blob de gradiente radial pêssego (canto inferior-esquerdo, 700px diâmetro, 20% alpha, blur 40px)

### Cards
- Fundo branco, border olive (1px solid #E2E2DC), rounded 12–14px
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
3. **Ajustar timings das cenas**: Os valores de frame acima são baseados nas durações de áudio estimadas. Recalcule seus valores `from` e `durationInFrames` com base nos seus arquivos de áudio reais.
4. **Construir cenas**: Siga as descrições acima. Todo UI é construído em React (sem screenshots).
5. **Adicionar música de fundo**: Coloque a música em `public/background.mp3`, volume 0.15, iniciando no frame 45.
6. **Assets necessários**: Logo do NotaFlow em `public/images/notaflow-logo.png` (quadrado, versão escura).

---

## Princípios de Design

- **Sem screenshots** — todo UI é composto por componentes React animados
- **Arco narrativo**: Urgência (prazo 2026) → Dor (complexidade) → Solução (NotaFlow) → Resultado (empresa em dia)
- **Audio-first timing**: Gerar áudio → medir → construir cenas ao redor do áudio
- **Cada card é único**: Cards de ferramentas têm visuais internos distintos que combinam com sua função
- **Fundo sutil**: Grid visível mas não dominante
- **Animações spring**: Tudo usa springs, nunca easing linear
- **Identidade fiscal**: Design inspirado em documentos fiscais brasileiros (nota fiscal, papel timbrado)
