import { Component } from '@angular/core';

import { COMPANY } from './app-info';
import { PromptFormPage } from './prompt/prompt-form-page';

@Component({
  selector: 'app-root',
  imports: [PromptFormPage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly company = COMPANY;
}
