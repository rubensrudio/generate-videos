import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { TextField } from './text-field';

@Component({
  standalone: true,
  imports: [TextField, ReactiveFormsModule],
  template: `
    <app-text-field
      [control]="control"
      [fieldId]="fieldId"
      [label]="label"
      [required]="required"
      [multiline]="multiline"
      [maxLength]="maxLength"
      [inputMode]="inputMode"
      [hint]="hint"
    />
  `,
})
class HostComponent {
  control = new FormControl('', { nonNullable: true });
  fieldId = 'f-test';
  label = 'Nome';
  required = false;
  multiline = false;
  maxLength = 200;
  inputMode: 'text' | 'numeric' | 'decimal' = 'text';
  hint: string | undefined = undefined;
}

describe('TextField', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
  });

  it('renderiza " *" e o span sr-only "obrigatório" quando required=true, e aria-required="true"', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.required = true;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const label = compiled.querySelector('label') as HTMLLabelElement;
    expect(label.textContent).toContain('*');
    expect(label.querySelector('.sr-only')?.textContent).toBe('obrigatório');

    const input = compiled.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-required')).toBe('true');
  });

  it('label[for] é igual ao id do input', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const label = compiled.querySelector('label') as HTMLLabelElement;
    const input = compiled.querySelector('input') as HTMLInputElement;
    expect(label.getAttribute('for')).toBe('f-test');
    expect(input.id).toBe('f-test');
  });

  it('campo obrigatório vazio sem blur não mostra erro; após blur mostra "Campo obrigatório" e aria-invalid="true"', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.required = true;
    fixture.componentInstance.control = new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('input') as HTMLInputElement;
    const error = compiled.querySelector('#f-test-error') as HTMLParagraphElement;

    expect(error.textContent?.trim()).toBe('');

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(error.textContent?.trim()).toBe('Campo obrigatório');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('após corrigir o valor, a mensagem de erro some e aria-invalid="false"', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.required = true;
    fixture.componentInstance.control = new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('input') as HTMLInputElement;
    const error = compiled.querySelector('#f-test-error') as HTMLParagraphElement;

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    fixture.componentInstance.control.setValue('Sendkit');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(error.textContent?.trim()).toBe('');
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  it('multiline=true renderiza textarea, e maxLength=5000 põe maxlength="5000"', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.multiline = true;
    fixture.componentInstance.maxLength = 5000;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const textarea = compiled.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();
    expect(compiled.querySelector('input')).toBeNull();
    expect(textarea.getAttribute('maxlength')).toBe('5000');
  });

  it('valor com 12 caracteres e maxLength 200 mostra contador "12/200"', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.control = new FormControl('123456789012', {
      nonNullable: true,
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const count = compiled.querySelector('#f-test-count') as HTMLSpanElement;
    expect(count.textContent?.trim()).toBe('12/200');
  });

  it('inputMode="decimal" renderiza input[type="text"][inputmode="decimal"]', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.inputMode = 'decimal';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('type')).toBe('text');
    expect(input.getAttribute('inputmode')).toBe('decimal');
  });
});
