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

export type UploadLogoResult = { ok: true; path: string } | { ok: false; message: string };

/** Tipos aceitos no upload do logo (o servidor confere de novo pela assinatura dos bytes). */
export const LOGO_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
export const LOGO_MAX_BYTES = 2 * 1024 * 1024;

const SAVE_TIMEOUT_MS = 10000;
const UPLOAD_TIMEOUT_MS = 30000;

@Injectable({ providedIn: 'root' })
export class PromptApi {
  constructor(private readonly http: HttpClient) {}

  save(content: string): Observable<SavePromptResult> {
    return this.http
      .post<SavePromptOkResponse>(
        '/api/prompt',
        { content },
        { headers: { 'Content-Type': 'application/json' } },
      )
      .pipe(
        timeout(SAVE_TIMEOUT_MS),
        map((response): SavePromptResult => ({ ok: true, path: response.path })),
        catchError((error: unknown) => of(mapErrorToResult(error))),
      );
  }

  /** Envia o arquivo cru para `POST /api/logo`; o servidor grava em `public/images/`. */
  uploadLogo(file: File): Observable<UploadLogoResult> {
    return this.http
      .post<SavePromptOkResponse>('/api/logo', file, { headers: { 'Content-Type': file.type } })
      .pipe(
        timeout(UPLOAD_TIMEOUT_MS),
        map((response): UploadLogoResult => ({ ok: true, path: response.path })),
        catchError((error: unknown) => of(mapUploadError(error))),
      );
  }
}

function mapUploadError(error: unknown): UploadLogoResult {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return { ok: false, message: 'Não foi possível enviar o logo: servidor indisponível' };
    }
    const body = error.error as SavePromptErrorBody | null | undefined;
    return {
      ok: false,
      message: body?.message || `Não foi possível enviar o logo: HTTP ${error.status}`,
    };
  }
  return { ok: false, message: 'Não foi possível enviar o logo: tempo esgotado' };
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
