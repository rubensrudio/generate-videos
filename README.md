# ApresentaAI — vídeos de apresentação com Remotion

Gera vídeos de apresentação de produto de forma programática com [Remotion 4](https://www.remotion.dev/) (React + TypeScript). As telas são componentes React animados, sem nenhum screenshot.

O projeto tem duas partes:

| Parte | Pasta | O que faz |
|-------|-------|-----------|
| **Vídeos (Remotion)** | raiz (`src/`) | Composições e cenas do vídeo, Remotion Studio e render do MP4. |
| **ApresentaAI (Angular + Node)** | `frontend/` | Formulário que monta o `PROMPT.md` a partir do `PROMPT-TEMPLATE.md`, com upload de logo, seleção de cores e geração do vídeo pelo Claude Code. |

## Novidades

- **Formulário enxuto**: o formulário caiu de ~190 campos para 2 campos globais, mais logo, 7 cores e 7 campos por cena. O que é igual em todos os projetos virou constante (`prompt-constants.ts`) ou valor derivado (`prompt-derived.ts`): fps, voz ElevenLabs, música, frames das cenas, duração total, tons claros das cores etc.
- **Selects** para o formato do vídeo, a fonte mono e o tipo de cena (cada tipo traz uma animação padrão).
- **Upload de logo**: o arquivo vai para `POST /api/logo` e fica em `public/images/logo.<ext>`. O tipo é validado pelos bytes e o limite é 2 MiB.
- **Seletor de cores** (`ngx-color-picker`) com paleta de sugestões.
- **Geração do vídeo pelo navegador**: ao salvar o `PROMPT.md`, o servidor dispara o Claude Code em modo headless. Ele gera a narração (ElevenLabs), escreve as cenas em `src/` e renderiza o MP4 em `out/`. Dá para acompanhar o andamento, cancelar e assistir ao resultado na própria página.
- **Variáveis de ambiente** lidas de `frontend/.env` e do `.env` da raiz.
- O rascunho do formulário passou para a chave `v2` do `localStorage`. Rascunhos `v1` são descartados.

## Pré-requisitos

- **Node.js 22.18 ou mais novo** (recomendado: 24). O servidor roda arquivos `.ts` direto no Node, sem build.
- **npm** 10 ou mais novo.
- **Claude Code CLI** (`claude`) instalado e autenticado. Só é necessário para gerar o vídeo pelo formulário.
- **Chave da API ElevenLabs**, para a narração.

## Passo a passo

### 1. Clonar e instalar as dependências

```console
git clone git@github.com:rubensrudio/generate-videos.git
cd generate-videos
npm install
cd frontend
npm install
```

### 2. Configurar o `.env`

Crie `frontend/.env` (ou `.env` na raiz do projeto):

```dotenv
ELEVENLABS_API_KEY=sua-chave-aqui
```

Variáveis opcionais:

| Variável | Padrão | Uso |
|----------|--------|-----|
| `PROMPT_SERVER_PORT` | `4310` | Porta do servidor Node. |
| `CLAUDE_BIN` | `claude` | Caminho do binário do Claude Code. |

Os dois arquivos `.env` estão no `.gitignore`. Nunca commite a chave.

### 3. Subir o ApresentaAI

**Modo uso** (build do Angular + servidor, uma porta só):

```console
cd frontend
npm run app
```

Abra http://127.0.0.1:4310.

**Modo desenvolvimento** (hot reload), em dois terminais:

```console
# terminal 1: API em 127.0.0.1:4310
cd frontend
npm run server

# terminal 2: Angular em localhost:4200, com proxy de /api para a porta 4310
cd frontend
npm start
```

Abra http://localhost:4200.

O servidor precisa ser iniciado de dentro deste repositório, porque procura o `PROMPT-TEMPLATE.md` na raiz.

### 4. Preencher o formulário e salvar

1. Preencha os campos globais, envie o logo e escolha as cores.
2. Configure cada cena (tipo, texto, narração…).
3. Clique em **Salvar PROMPT.md**. O arquivo é gravado na raiz do projeto e a geração do vídeo começa em seguida, sozinha.

Enquanto você edita, o rascunho fica salvo no navegador. Se já houver um vídeo sendo gerado, espere ele terminar para salvar de novo.

### 5. Gerar o vídeo

Há duas opções:

- **Pelo formulário** (automático ao salvar): o painel de vídeo mostra o andamento, permite cancelar e exibe o MP4 no fim. O servidor roda `claude -p` na raiz do projeto, com acesso apenas às ferramentas necessárias. O agente não pode alterar `frontend/`, `PROMPT.md` nem `PROMPT-TEMPLATE.md`. O MP4 sai em `out/apresentacao-<id>.mp4`. Roda um job por vez, com limite de 60 minutos.
- **Manualmente**: abra o Claude Code na raiz e peça para criar o vídeo descrito no `PROMPT.md`.

### 6. Pré-visualizar e renderizar no Remotion

Na raiz do projeto:

```console
npm run dev                                # Remotion Studio
npx remotion render <IdDaComposicao> out/video.mp4
```

Composições atuais (em `src/Root.tsx`): `NotaFlow` e `Testando`.

## API do servidor

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/prompt` | Gera e grava o `PROMPT.md`. |
| `POST` / `GET` | `/api/logo` | Envia o logo / devolve o logo atual (prévia). |
| `POST` / `GET` | `/api/video` | Inicia a geração / devolve o estado do job atual. |
| `POST` | `/api/video/cancel` | Cancela a geração em andamento. |
| `GET` | `/api/video/file` | MP4 do último job concluído. |

## Comandos

**Raiz (Remotion)**

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Abre o Remotion Studio. |
| `npm run build` | Gera o bundle do Remotion. |
| `npm run lint` | ESLint + checagem de tipos. |
| `npx remotion render <Id>` | Renderiza uma composição. |
| `npx remotion upgrade` | Atualiza o Remotion. |

**`frontend/` (ApresentaAI)**

| Comando | Descrição |
|---------|-----------|
| `npm run app` | Build do Angular + servidor na porta 4310. |
| `npm start` | `ng serve` em http://localhost:4200. |
| `npm run server` | Só o servidor Node. |
| `npm test` | Testes do Angular (Vitest). |
| `npm run test:server` | Testes do servidor (`node --test`). |
| `npm run typecheck` | Checagem de tipos de app, specs e servidor. |
| `npm run build` | Build de produção em `frontend/dist/`. |

## Estrutura

```
.
├── PROMPT-TEMPLATE.md     # especificação base (design system, cenas, áudio)
├── PROMPT.md              # gerado pelo formulário
├── public/                # áudios e imagens usados nos vídeos (logo em public/images/)
├── src/                   # composições Remotion (Root.tsx, uma pasta por vídeo)
├── out/                   # MP4s renderizados (ignorado no git)
└── frontend/
    ├── server/            # servidor Node: prompt, logo, jobs de vídeo, .env
    └── src/app/prompt/    # formulário, rascunho, cliente da API, painel de vídeo
```

## Licença do Remotion

Algumas empresas precisam de licença comercial para usar o Remotion. [Veja os termos](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
