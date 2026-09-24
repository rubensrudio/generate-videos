import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';

import { ScenesSection } from './scenes-section';
import { SceneForm, buildSceneGroup } from '../prompt-form.factory';
import { atLeastOneCompleteScene } from '../prompt-validators';
import { createEmptyScene } from '../template-defaults';
import { MAX_SCENES } from '../prompt.model';

function buildScenes(count: number): FormArray<SceneForm> {
  const scenes: SceneForm[] = [];
  for (let i = 0; i < count; i += 1) {
    const scene = createEmptyScene();
    scene.id = String(i + 1);
    scene.title = `Cena ${i + 1}`;
    scene.narration = 'Narração';
    scene.startFrame = String(i * 10);
    scene.endFrame = String(i * 10 + 10);
    scene.content = 'Conteúdo';
    scenes.push(buildSceneGroup(scene));
  }
  return new FormArray(scenes, { validators: [atLeastOneCompleteScene()] });
}

@Component({
  standalone: true,
  imports: [ScenesSection, ReactiveFormsModule],
  template: `<app-scenes-section [scenes]="scenes" [totalFrames]="totalFrames" (structureChange)="onStructureChange()" />`,
})
class HostComponent {
  scenes: FormArray<SceneForm> = buildScenes(11);
  totalFrames = new FormControl('300', { nonNullable: true });
  structureChangeCount = 0;

  onStructureChange(): void {
    this.structureChangeCount += 1;
  }
}

/** Cria e renderiza um `HostComponent` já com o `FormArray` de cenas desejado
 * definido ANTES do primeiro `detectChanges()` (evita reatribuir o `@Input`
 * depois que a árvore já renderizou, o que não repropaga neste ambiente de
 * teste zoneless). */
function createFixture(scenes: FormArray<SceneForm>) {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.componentInstance.scenes = scenes;
  fixture.detectChanges();
  return fixture;
}

describe('ScenesSection', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
  });

  it('com as 11 cenas default, btn-add-scene adiciona uma cena vazia ao final (12 cenas)', async () => {
    const fixture = createFixture(buildScenes(11));
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const addBtn = compiled.querySelector('#btn-add-scene') as HTMLButtonElement;
    addBtn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.scenes.length).toBe(12);
    const last = fixture.componentInstance.scenes.at(11);
    expect(last.controls.id.value).toBe('');
    expect(last.controls.title.value).toBe('');
    expect(last.controls.narration.value).toBe('');
    expect(last.controls.startFrame.value).toBe('');
    expect(last.controls.endFrame.value).toBe('');
    expect(last.controls.content.value).toBe('');
    expect(last.controls.animation.value).toBe('');
    expect(last.controls.fadeOutFrame.value).toBe('');
  });

  it('com 30 cenas, btn-add-scene está disabled e aparece "Limite de 30 cenas atingido"', async () => {
    const fixture = createFixture(buildScenes(MAX_SCENES));
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const addBtn = compiled.querySelector('#btn-add-scene') as HTMLButtonElement;
    expect(addBtn.disabled).toBe(true);
    expect(compiled.textContent).toContain('Limite de 30 cenas atingido');
  });

  it('com 1 cena, btn-remove-scene-0 está disabled', async () => {
    const fixture = createFixture(buildScenes(1));
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const removeBtn = compiled.querySelector('#btn-remove-scene-0') as HTMLButtonElement;
    expect(removeBtn.disabled).toBe(true);
  });

  it('com 2 cenas, remover a 0 (via clique) deixa só a antiga cena 1', async () => {
    const fixture = createFixture(buildScenes(2));
    await fixture.whenStable();
    fixture.detectChanges();

    const secondSceneId = fixture.componentInstance.scenes.at(1).controls.id.value;

    const compiled = fixture.nativeElement as HTMLElement;
    const removeBtn = compiled.querySelector('#btn-remove-scene-0') as HTMLButtonElement;
    expect(removeBtn.disabled).toBe(false);
    removeBtn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.scenes.length).toBe(1);
    expect(fixture.componentInstance.scenes.at(0).controls.id.value).toBe(secondSceneId);
  });

  it('btn-move-up-scene-1 troca as cenas 0 e 1; btn-move-up-scene-0 e o move-down da última estão disabled', async () => {
    const fixture = createFixture(buildScenes(3));
    await fixture.whenStable();
    fixture.detectChanges();

    const scenes = fixture.componentInstance.scenes;
    const originalFirstId = scenes.at(0).controls.id.value;
    const originalSecondId = scenes.at(1).controls.id.value;

    const compiled = fixture.nativeElement as HTMLElement;
    const moveUpFirst = compiled.querySelector('#btn-move-up-scene-0') as HTMLButtonElement;
    expect(moveUpFirst.disabled).toBe(true);

    const moveDownLast = compiled.querySelector('#btn-move-down-scene-2') as HTMLButtonElement;
    expect(moveDownLast.disabled).toBe(true);

    const moveUpSecond = compiled.querySelector('#btn-move-up-scene-1') as HTMLButtonElement;
    expect(moveUpSecond.disabled).toBe(false);
    moveUpSecond.click();
    fixture.detectChanges();

    expect(scenes.at(0).controls.id.value).toBe(originalSecondId);
    expect(scenes.at(1).controls.id.value).toBe(originalFirstId);
  });

  it('cada ação estrutural (add, remove, move) emite structureChange uma vez', async () => {
    const fixture = createFixture(buildScenes(3));
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    (compiled.querySelector('#btn-add-scene') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.structureChangeCount).toBe(1);

    (compiled.querySelector('#btn-move-up-scene-1') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.structureChangeCount).toBe(2);

    (compiled.querySelector('#btn-remove-scene-0') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.structureChangeCount).toBe(3);
  });

  it('cena 2 com início diferente do fim da cena 1 gera aviso do CT-7 dentro de [role="status"]', async () => {
    const scenes = buildScenes(2);
    scenes.at(1).controls.startFrame.setValue('999');
    const fixture = createFixture(scenes);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const status = compiled.querySelector('[role="status"]') as HTMLElement;
    expect(status.textContent).toContain('Aviso');
  });

  it('uma única cena vazia, marcada como tocada (via clique de blur), mostra "Adicione pelo menos uma cena"', async () => {
    const scenes = new FormArray([buildSceneGroup(createEmptyScene())], {
      validators: [atLeastOneCompleteScene()],
    });
    const fixture = createFixture(scenes);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const idInput = compiled.querySelector('#f-scenes-0-id') as HTMLInputElement;
    idInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(scenes.touched).toBe(true);
    expect(compiled.textContent).toContain('Adicione pelo menos uma cena');
  });

  it('os ids f-scenes-0-endFrame e btn-remove-scene-0 existem', async () => {
    const fixture = createFixture(buildScenes(11));
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#f-scenes-0-endFrame')).toBeTruthy();
    expect(compiled.querySelector('#btn-remove-scene-0')).toBeTruthy();
  });
});
