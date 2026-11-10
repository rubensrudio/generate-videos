import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';

import { ColorField } from './color-field';
import { hexColor, requiredTrimmed } from '../prompt-validators';

@Component({
  standalone: true,
  imports: [ColorField],
  template: `<app-color-field
    [control]="control"
    fieldId="f-colors-green"
    label="Cor principal"
  />`,
})
class HostComponent {
  control = new FormControl('#16a34a', {
    nonNullable: true,
    validators: [requiredTrimmed(), hexColor()],
  });
}

describe('ColorField', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('botão rotulado mostra a amostra e o código da cor, sem campo de texto', async () => {
    const compiled = (await render()).nativeElement as HTMLElement;
    const button = compiled.querySelector('button#f-colors-green') as HTMLButtonElement;

    expect(compiled.querySelector('label[for="f-colors-green"]')?.textContent).toBe(
      'Cor principal',
    );
    expect(button.querySelector('.color-hex')?.textContent).toBe('#16a34a');
    expect((button.querySelector('.color-swatch') as HTMLElement).style.backgroundColor).toBe(
      'rgb(22, 163, 74)',
    );
    expect(compiled.querySelector('input')).toBeNull();
  });

  it('cor escolhida no seletor vai para o controle em minúsculas e marca como tocado', async () => {
    const fixture = await render();
    const field = fixture.debugElement.query(By.directive(ColorField))
      .componentInstance as unknown as {
      onPick(color: string): void;
    };

    field.onPick('#1B5E20');
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('#1b5e20');
    expect(fixture.componentInstance.control.touched).toBe(true);
    expect((fixture.nativeElement as HTMLElement).querySelector('.color-hex')?.textContent).toBe(
      '#1b5e20',
    );
  });

  it('valor inválido vindo de rascunho: amostra transparente e erro após tocar', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.control.setValue('verde');
    fixture.componentInstance.control.markAsTouched();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect((compiled.querySelector('.color-swatch') as HTMLElement).style.backgroundColor).toBe(
      'transparent',
    );
    expect(compiled.querySelector('#f-colors-green-error')?.textContent).toContain('#RRGGBB');
  });
});
