import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';

import type {
  AssistantChatTurn,
  AssistantExplanation,
  AssistantUiError,
  LanguageOption,
  SupportedLanguage
} from '../models/assistant-ui';
import type { PermitFieldDefinition } from '../models/form-models';
import type {
  AssistantChatRequest,
  AssistantChatResponse,
  AssistantExplainRequest,
  AssistantExplainResponse
} from '../../shared/assistant-contract';
import { LANGUAGE_OPTIONS } from '../data/sample-permit-fields';

@Injectable({
  providedIn: 'root'
})
export class AssistantService {
  private readonly http = inject(HttpClient);

  readonly languageOptions: LanguageOption[] = LANGUAGE_OPTIONS;

  explainField(field: PermitFieldDefinition, language: SupportedLanguage) {
    const payload: AssistantExplainRequest = {
      fieldId: field.id,
      fieldLabel: field.label,
      fieldType: field.kind,
      questionText: field.questionText,
      helpText: field.helpText,
      placeholder: field.placeholder,
      allowedOptions: field.options?.map((option) => option.label) ?? [],
      sampleAnswer: field.sampleAnswer,
      language
    };

    return this.http
      .post<AssistantExplainResponse>('/api/assistant/explain', payload)
      .pipe(
        map((response) => response.explanation),
        catchError((error) => throwError(() => this.toUiError(error, 'Unable to load field guidance.')))
      );
  }

  sendFollowUp(
    field: PermitFieldDefinition,
    language: SupportedLanguage,
    chatHistory: AssistantChatTurn[],
    userMessage: string
  ) {
    const payload: AssistantChatRequest = {
      fieldId: field.id,
      fieldLabel: field.label,
      fieldType: field.kind,
      questionText: field.questionText,
      helpText: field.helpText,
      placeholder: field.placeholder,
      allowedOptions: field.options?.map((option) => option.label) ?? [],
      sampleAnswer: field.sampleAnswer,
      language,
      chatHistory: chatHistory.map((turn) => ({
        role: turn.role,
        content: turn.content
      })),
      userMessage
    };

    return this.http
      .post<AssistantChatResponse>('/api/assistant/chat', payload)
      .pipe(catchError((error) => throwError(() => this.toUiError(error, 'Unable to send the follow-up question.'))));
  }

  toUiError(error: unknown, fallbackMessage: string): AssistantUiError {
    const message = this.extractMessage(error) ?? fallbackMessage;
    const retryable = this.extractRetryable(error);

    if (typeof error === 'object' && error !== null && 'status' in error) {
      return {
        code: 'SERVER',
        message,
        retryable
      };
    }

    return {
      code: 'NETWORK',
      message,
      retryable
    };
  }

  private extractMessage(error: unknown): string | null {
    if (typeof error === 'object' && error !== null) {
      if (
        'error' in error &&
        typeof error.error === 'object' &&
        error.error !== null &&
        'error' in error.error &&
        typeof error.error.error === 'object' &&
        error.error.error !== null &&
        'message' in error.error.error &&
        typeof error.error.error.message === 'string'
      ) {
        return error.error.error.message;
      }

      if ('message' in error && typeof error.message === 'string') {
        return error.message;
      }
    }

    return null;
  }

  private extractRetryable(error: unknown): boolean {
    if (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof error.error === 'object' &&
      error.error !== null &&
      'error' in error.error &&
      typeof error.error.error === 'object' &&
      error.error.error !== null &&
      'retryable' in error.error.error &&
      typeof error.error.error.retryable === 'boolean'
    ) {
      return error.error.error.retryable;
    }

    return true;
  }
}
