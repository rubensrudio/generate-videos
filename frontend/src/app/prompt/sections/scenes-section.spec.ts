import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';

import { ScenesSection } from './scenes-section';
import { SceneForm, buildSceneGroup } from '../prompt-form.factory';
import { SceneValue } from '../prompt.model';
import { TEMPLATE_DEFAULTS, createEmptyScene } from '../template-defaults';

@Component({
  standalone: true,
  imports: [ScenesSection],
  template: `<app-scenes-section [scenes]="scenes" />`,
})
class HostComponent {
  scenes = new FormArray<SceneForm>(
    TEMPLATE_DEFAULTS.scenes.map((scene) => buildSceneGroup(scene)),
  );
}

function scene(overrides: Partial<SceneValue>): SceneValue {
  return { ...createEmptyScene(), title: 't', narration: 'n', content: 'c', ...overrides };
}

async function render(scenes?: SceneValue[]) {
  const fixture = TestBed.createComponent(HostComponent);
  if (scenes) {
    fixture.componentInstance.scenes = new FormArray(scenes.map((s) => buildSceneGroup(s)));
  }
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

function rowTitles(compiled: HTMLElement): string[] {
  return Array.from(compiled.querySelectorAll('.items-table-title')).map(
    (el) => el.textContent?.trim() ?? '',
  );
}

describe('ScenesSection', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  });

  it('linhas mostram id derivado, tipo e faixa de frames encadeada', async () => {
    const compiled = (await render()).nativeElement as HTMLElement;
    expect(rowTitles(compiled)[6]).toBe('6b — Email Preview');
    const subtitles = Array.from(compiled.querySelectorAll('.items-table-subtitle')).map((el) =>
      el.textContent?.trim(),
    );
    expect(subtitles[0]).toBe('Abertura · frames 0–138');
    expect(subtitles[10]).toBe('Chamada final (CTA) · frames 1312–1389');
  });

  it('mostra a duração total derivada', async () => {
    const compiled = (await render()).nativeElement as HTMLElement;
    expect(compiled.querySelector('#scenes-total')?.textContent).toBe(
      'Duração total: 1389 frames (~46.3 s)',
    );
  });

  it('avisa quando o vídeo termina antes de a música começar', async () => {
    const compiled = (await render([scene({ durationFrames: '30' })])).nativeElement as HTMLElement;
    expect(compiled.querySelector('.timeline-warnings')?.textContent).toContain(
      'música de fundo começa no frame 45',
    );
  });

  it('mover uma cena renumera e recalcula os frames', async () => {
    const fixture = await render([
      scene({ title: 'A', durationFrames: '100' }),
      scene({ title: 'B', durationFrames: '50' }),
    ]);
    const compiled = fixture.nativeElement as HTMLElement;

    (compiled.querySelector('#btn-move-down-scene-0') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(rowTitles(compiled)).toEqual(['1 — B', '2 — A']);
    expect(compiled.querySelectorAll('.items-table-subtitle')[1].textContent).toContain(
      'frames 50–150',
    );
  });

  it('adicionar abre o drawer com a cena nova (tipo Personalizada, 90 frames)', async () => {
    const fixture = await render([scene({})]);
    const compiled = fixture.nativeElement as HTMLElement;

    (compiled.querySelector('#btn-add-scene') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.scenes.length).toBe(2);
    expect((compiled.querySelector('#f-scenes-1-type') as HTMLSelectElement).value).toBe('CUSTOM');
    expect((compiled.querySelector('#f-scenes-1-durationFrames') as HTMLInputElement).value).toBe(
      '90',
    );
    expect(compiled.querySelector('.drawer h3')?.textContent).toBe('Cena 2 · frames 90–180');
  });

  it('marcar sub-cena muda o id para a letra da cena anterior', async () => {
    const fixture = await render([scene({ title: 'A' }), scene({ title: 'B' })]);
    const compiled = fixture.nativeElement as HTMLElement;

    (compiled.querySelector('#btn-edit-scene-1') as HTMLButtonElement).click();
    fixture.detectChanges();
    const checkbox = compiled.querySelector('#f-scenes-1-subScene') as HTMLInputElement;
    checkbox.click();
    fixture.detectChanges();

    expect(rowTitles(compiled)[1]).toBe('1b — B');
  });

  it('primeira cena não oferece a opção de sub-cena', async () => {
    const fixture = await render([scene({})]);
    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('#btn-edit-scene-0') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(compiled.querySelector('#f-scenes-0-subScene')).toBeNull();
  });

  it('dica da animação mostra o padrão do tipo selecionado', async () => {
    const fixture = await render([scene({ type: 'MIC_DROP' })]);
    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('#btn-edit-scene-0') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(compiled.querySelector('.drawer')?.textContent).toContain(
      'Vazio usa o padrão do tipo: Texto principal spring',
    );
  });

  it('não remove a última cena', async () => {
    const fixture = await render([scene({})]);
    const compiled = fixture.nativeElement as HTMLElement;
    expect((compiled.querySelector('#btn-remove-scene-0') as HTMLButtonElement).disabled).toBe(
      true,
    );
  });
});
