import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { GeneralSections } from './general-sections';
import { buildPromptForm, PromptForm } from '../prompt-form.factory';
import { TEMPLATE_DEFAULTS } from '../template-defaults';

@Component({
  standalone: true,
  imports: [GeneralSections],
  template: `<app-general-sections [form]="form" />`,
})
class HostComponent {
  form: PromptForm = buildPromptForm(TEMPLATE_DEFAULTS);
}

describe('GeneralSections', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
  });

  it('renderiza os 5 <legend> na ordem correta', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const legends = Array.from(compiled.querySelectorAll('legend')).map((el) => el.textContent?.trim());

    expect(legends).toEqual([
      'Identificação',
      'Tech Stack',
      'Configurações do Vídeo',
      'Narração',
      'Música de Fundo',
    ]);
  });

  it('todo campo obrigatório tem " *" e todo opcional não tem', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const requiredIds = [
      'f-identity-documentTitle',
      'f-techStack-videoFramework',
      'f-techStack-bodyFont',
      'f-techStack-headingFont',
      'f-techStack-ttsService',
      'f-video-width',
      'f-video-height',
      'f-video-fps',
      'f-video-totalFrames',
      'f-voice-voiceId',
      'f-voice-model',
      'f-voice-stability',
      'f-voice-similarityBoost',
      'f-voice-style',
      'f-voice-audioPrefix',
      'f-music-file',
      'f-music-volume',
      'f-music-startFrame',
    ];

    const optionalIds = [
      'f-identity-productName',
      'f-identity-usageLine',
      'f-techStack-monoFont',
      'f-techStack-musicSource',
      'f-video-formatDescription',
      'f-voice-fallbackName',
      'f-voice-fallbackVoiceId',
    ];

    requiredIds.forEach((id) => {
      const field = compiled.querySelector(`#${id}`) as HTMLElement;
      const container = field.parentElement as HTMLElement;
      expect(container.querySelector('label')?.textContent).toContain('*');
    });

    optionalIds.forEach((id) => {
      const field = compiled.querySelector(`#${id}`) as HTMLElement;
      const container = field.parentElement as HTMLElement;
      expect(container.querySelector('label')?.textContent).not.toContain('*');
    });
  });

  it('existem os ids dos campos-âncora', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    [
      'f-identity-productName',
      'f-identity-documentTitle',
      'f-video-width',
      'f-video-totalFrames',
      'f-voice-voiceId',
      'f-voice-speakerBoost',
      'f-music-startFrame',
    ].forEach((id) => {
      expect(compiled.querySelector(`#${id}`)).toBeTruthy();
    });
  });

  it('marcar/desmarcar o checkbox muda form.controls.voice.controls.speakerBoost.value', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const checkbox = compiled.querySelector('#f-voice-speakerBoost') as HTMLInputElement;
    const control = fixture.componentInstance.form.controls.voice.controls.speakerBoost;

    expect(control.value).toBe(true);

    checkbox.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(control.value).toBe(false);

    checkbox.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(control.value).toBe(true);
  });

  it('f-identity-usageLine é textarea com maxlength="5000"', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const textarea = compiled.querySelector('#f-identity-usageLine') as HTMLTextAreaElement;

    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea.getAttribute('maxlength')).toBe('5000');
  });
});
