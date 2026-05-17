# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Remotion 4.x video project for a Sendkit product introduction campaign ("001-campain"). It produces programmatic videos using React + TypeScript — all UI is animated React components, no screenshots.

## Commands

- **Preview**: `npm run dev` (opens Remotion Studio)
- **Render video**: `npx remotion render HelloWorld` (or any composition ID)
- **Bundle**: `npm run build`
- **Lint**: `npm run lint` (runs ESLint + TypeScript type checking)

## Architecture

- **Entry point**: `src/index.ts` — registers the Remotion root
- **Compositions**: `src/Root.tsx` — defines all `<Composition>` entries (each appears in the Studio sidebar)
- **Schemas**: Each composition uses Zod schemas for typed, parameterized props (e.g., `myCompSchema` in `HelloWorld.tsx`)
- **Config**: `remotion.config.ts` — sets JPEG output, overwrite mode, and enables Tailwind CSS v4 via webpack override

## Key Conventions

- **Tailwind v4** is enabled via `@remotion/tailwind-v4` webpack plugin; CSS entry is `src/index.css`
- **Animations**: Use Remotion's `spring()` (damping 10, stiffness 150, mass 0.8) and `interpolate()` — never linear easing
- **Sequencing**: Use `<Sequence from={frame}>` to offset child timing within compositions
- **Props validation**: Define Zod schemas for composition props and pass them via `schema` prop on `<Composition>`

## PROMPT-TEMPLATE.md

The `PROMPT-TEMPLATE.md` file contains the complete scene-by-scene specification for the Sendkit Product Hunt video, including:
- Design system (colors, fonts, card styles, background treatment)
- All 10 scenes with exact frame ranges, content, and animation details
- Audio/narration settings (ElevenLabs voice config, background music)
- The storytelling arc: Pain → Solution → Payoff

Refer to this file when building or modifying scenes.
