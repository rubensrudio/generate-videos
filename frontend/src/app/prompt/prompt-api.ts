import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, timeout } from 'rxjs';

export type SavePromptResult =
  | { ok: true; path: string }
  | { ok: false; kind: 'indisponivel' | 'permissao' | 'falha'; message: string };

interface SavePromptOkResponse {
  ok: true;
  path: string;
}

interface SavePromptErrorBody {
  code?: string;
  message?: string;
}

const SAVE_TIMEOUT_MS = 10000;

@Injectable({ providedIn: 'root' })
export class PromptApi {
  constructor(private readonly http: HttpClient) {}

  save(content: string): Observable<SavePromptResult> {
    return this.http
      .post<SavePromptOkResponse>(
        '/api/prompt',
        { content },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .pipe(
        timeout(SAVE_TIMEOUT_MS),
        map((response): SavePromptResult => ({ ok: true, path: response.path })),
        catchError((error: unknown) => of(mapErrorToResult(error)))
      );
  }
}

function mapErrorToResult(error: unknown): SavePromptResult {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return {
        ok: false,
        kind: 'indisponivel',
        message: 'Não foi possível salvar o PROMPT.md: Servidor de gravação indisponível',
      };
    }

    const body = error.error as SavePromptErrorBody | null | undefined;
    if (body && body.code === 'PERMISSAO_NEGADA') {
      return {
        ok: false,
        kind: 'permissao',
        message: 'Sem permissão para gravar o PROMPT.md. Verifique as permissões do arquivo',
      };
    }

    const message = body?.message;
    return {
      ok: false,
      kind: 'falha',
      message: `Não foi possível salvar o PROMPT.md: ${message || 'HTTP ' + error.status}`,
    };
  }

  return {
    ok: false,
    kind: 'indisponivel',
    message: 'Não foi possível salvar o PROMPT.md: tempo esgotado',
  };
}
