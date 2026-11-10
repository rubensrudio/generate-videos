/**
 * Seções gerais do formulário (CT-15): Marca e Vídeo.
 *
 * Só mostra o que muda entre projetos. Stack, fps, voz (ID, modelo,
 * parâmetros e versão do áudio) e música são fixos (`prompt-constants.ts`);
 * os de vídeo aparecem como dica, para o usuário saber o que vai no
 * documento sem precisar preencher.
 */

import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PromptForm } from '../prompt-form.factory';
import { FPS, MONO_FONT_OPTIONS, MUSIC, VIDEO_FORMAT_OPTIONS } from '../prompt-constants';
import { LogoField } from '../ui/logo-field';
import { SelectField } from '../ui/select-field';
import { TextField } from '../ui/text-field';

@Component({
  selector: 'app-general-sections',
  standalone: true,
  imports: [ReactiveFormsModule, TextField, SelectField, LogoField],
  templateUrl: './general-sections.html',
})
export class GeneralSections {
  readonly form = input.required<PromptForm>();

  protected readonly videoFormatOptions = VIDEO_FORMAT_OPTIONS;
  protected readonly monoFontOptions = MONO_FONT_OPTIONS;

  protected readonly fixedStackHint = `Fixo em todos os vídeos: Remotion 4.x, Inter + Instrument Serif, ${FPS} fps, narração ElevenLabs e música de fundo em ${MUSIC.file} (volume ${MUSIC.volume}).`;
}
