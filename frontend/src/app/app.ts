import { Component } from '@angular/core';

import { PromptFormPage } from './prompt/prompt-form-page';

@Component({
  selector: 'app-root',
  imports: [PromptFormPage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
